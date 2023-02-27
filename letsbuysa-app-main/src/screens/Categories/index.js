import React, {Component} from 'react';
import {
    ScrollView,
    View,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {FlatGrid} from 'react-native-super-grid';

//Custom component
import {CustomNavigationHeader, Label} from "src/component";

//Utility
import {API_GET_CATEGORIES, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {Color, Constants, ThemeUtils, decodeImageUrl, Strings} from "src/utils";
import Routes from "src/router/routes";

class Categories extends Component {

    //Server request
    getCategoryRequest = () => {
        new APIRequest.Builder()
            .get()
            .setReqId(API_GET_CATEGORIES)
            .reqURL(ApiURL.getCategories)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        switch (reqId) {
            case API_GET_CATEGORIES:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.categories) {
                            this.setState({categoryimagepath: response.data.categoryimagepath,subcategoryimagepath:response.data.subcategoryimagepath });
                            this.processCategories(response.data.categories);
                            /*if (Object.keys(response.data).includes("banners") && response.data["banners"].length > 0) {
                                this.setState({banners: response.data["banners"]})
                            }*/
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        console.log('error', error)
    };

    //Utility
    processCategories = (categories) => {
        categories.map((category) => {
            if (category.subcategories.length <= 0) {
                console.log('got categories',categories)
                category.subcategories.push({
                    category_id: category.category_id,
                    name: this.props.localeStrings.categoryAll,
                    image: category.image_1 || category.image_2
                })
            }
        });

        this.setState({categories: categories, });
    };

    getBannerHeader = (categoryData) => {
        console.log('category data',categoryData)
        if (categoryData.header_image) {
            return decodeImageUrl(this.state.categoryimagepath+categoryData.header_image)
        } else if (categoryData.footer_image) {
            return decodeImageUrl(this.state.categoryimagepath+categoryData.footer_image)
        }
    };

    getBannerFooter = (categoryData) => {
        console.log(' footr category data',categoryData)

        if (categoryData.footer_image) {
            return decodeImageUrl(this.state.categoryimagepath+categoryData.footer_image)
        } else if (categoryData.header_image) {
            return decodeImageUrl(this.state.categoryimagepath+categoryData.header_image)
        }
    };

    //User Interaction
    onLogout = () => {
        this.props.logoutUser()
    };

    onClickCategory = (idx) => {
        if (this.state.selectedCategoryId !== idx) {
            this.setState({selectedCategoryId: idx})
        }
    };

    onClickSubCategory = (item, mainCategory) => {
        console.log('cat ',mainCategory)
        console.log('subcCat ',item)

        this.props.navigation.navigate(Routes.ProductList, {
            categoryId: mainCategory.id,
            subCategoryId: item.id
        })
    };

    //UI methods
    renderCategories = () => {
        //create categories with title and sub-category array
        let categoryData = this.state.categories;
        /*Object.keys(this.state.categories).map((item) => {
            return this.state.categories[item]
        });*/

        if (categoryData && categoryData.length > 0) {
            return (
                <FlatList
                    showsVerticalScrollIndicator={false}
                    extraData={this.state}
                    data={categoryData}
                    keyExtractor={item => `${item.category_id}`}
                    renderItem={({index, item}) => this.renderCategoryListItem(item, index)}
                />
            )
        }
        return null
    };

    renderCategoryListItem = (item, idx) => {
        let isSelected = this.state.selectedCategoryId === idx;
        return (
            <TouchableOpacity key={item.category_id}
                              activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              style={{backgroundColor: isSelected ? Color.LIGHT_WHITE : Color.WHITE}}
                              onPress={() => this.onClickCategory(idx)}>
                <Label small
                       ms={10}
                       me={10}
                       mt={15}
                       mb={15}
                       color={isSelected ? Color.TEXT_DARK : Color.TEXT_LIGHT}>
                    {item.name}
                </Label>
            </TouchableOpacity>
        )
    };

    renderSelectedCategory = () => {
        let selectedCategory = this.state.categories[this.state.selectedCategoryId];
        if (selectedCategory) {
            return (
                <ScrollView
                    contentContainerStyle={{paddingHorizontal: 10}}>
                    <View style={styles.bannerContainer}>
                        {this.getBannerHeader(selectedCategory) &&
                        <Image
                            source={{uri: this.getBannerHeader(selectedCategory)}}
                            style={styles.bannerImage}/>
                        }
                    </View>
                    {<View style={styles.gridContainer}>
                        <FlatGrid
                            style={{flex: 1}}
                            itemContainerStyle={{justifyContent: 'flex-start'}}
                            spacing={0}
                            itemDimension={ThemeUtils.relativeWidth(60) / 3 - 10}
                            items={selectedCategory.subcategories}
                            renderItem={({item}) => this.renderSubCategoryItem(item, selectedCategory)}
                        />
                    </View>
                    }
                    {this.getBannerFooter(selectedCategory) &&
                    <View style={styles.bannerContainer}>
                        <Image
                            source={{uri: this.getBannerFooter(selectedCategory)}}
                            style={styles.bannerImage}/>
                    </View>
                    }
                </ScrollView>
            )
        }
        return null;
    };

    renderSubCategoryItem = (item, mainCategory = null) => {
        return (
            <View style={styles.subCatItemContainer}
                  key={item.category_id}>
                <TouchableOpacity
                    activeOpacity={0.9}
                    underlayColor={Color.TRANSPARENT}
                    style={styles.subCatImageContainer}
                    onPress={() => this.onClickSubCategory(item, mainCategory)}>
                    <Image
                        source={{uri: decodeImageUrl(this.state.subcategoryimagepath+item.image)}}
                        style={styles.subCatImage}/>
                </TouchableOpacity>
                <Label xsmall
                       style={{flex: 1}}
                       color={Color.TEXT_DARK}
                       align={'center'}
                       mt={5}>
                    {item.name}
                </Label>
            </View>
        )
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            title: "navCategories",
            header: (props) => <CustomNavigationHeader {...props}
                                                       titleCenter={true}
                                                       isMainTitle={false}/>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            categories: null,
            categoryimagepath:'',
            subcategoryimagepath:'',
            selectedCategoryId: 0
        };
    }


    componentDidMount() {
        this.getCategoryRequest();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={{
                    flex: 0.27,
                    backgroundColor: Color.WHITE,
                }}>
                    {this.state.categories ?
                        this.renderCategories() : null
                    }
                </View>
                <View style={{
                    flex: 0.73,
                    backgroundColor: Color.LIGHT_WHITE,
                }}>
                    {this.state.categories ?
                        this.renderSelectedCategory() : null}
                </View>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Categories)

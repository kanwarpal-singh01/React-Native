import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    RefreshControl,Image,
    I18nManager
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {FlatGrid} from 'react-native-super-grid';
import {NavigationEvents, SafeAreaView} from "react-navigation";
import LinearGradient from 'react-native-linear-gradient';

//Custom component
import {
    Label,
    SortPopUp,
    ProductCard,
    CustomNavigationHeader,
    FilterPopUp
} from "src/component";

//Utility
import Action from "src/redux/action";
import {
    API_Brands_STATUS,
    APIRequest,
    ApiURL
} from "src/api";
import styles from './styles';
import {
    Color,
    Constants,
    ThemeUtils,
    IS_IOS,
    CommonStyle,
    Icon,
    Strings,
    showSuccessSnackBar
} from "src/utils";
import Routes from "src/router/routes";

class BrandList extends Component {

    //Server request
    getBrandList = () => {
        this.setState({
            isLoaderVisible: true,
            errMessage: this.props.localeStrings.pleaseWait
        });
    

        let params = {
            "page": this.state.tempPage,
        };

        if (this.props.user) {
            params["customer_id"] = this.props.user.customer_id
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_Brands_STATUS)
            .reqURL(ApiURL.brands)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

   

    onResponse = (response, reqId) => {

        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_Brands_STATUS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.brands) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                brand_path:response.data.topbrands_path,
                                brands: this.state.tempPage === 1 ? response.data.brands : [...this.state.brands, ...response.data.brands],
                                page: dummyPage
                            });
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
        this.setState({
            isLoaderVisible: false
        });
        console.log('error', error);
        switch (reqId) {
            case API_Brands_STATUS:
                if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }
                this.setState({
                    errMessage: this.props.localeStrings.noProductsFound
                });
                break;
        }
    };

    //Utility
   

    //User Interaction
    onClickBrand = (item) => {
   
        console.log('rand',item)
          const obj = {id: item?.name , title:item?.name}
          this.props.navigation.navigate(Routes.ProductListHome, {
            brand_id: item.id,
            type:obj
          });
    };

    handleLoadMore = () => {

        if (!this.state.isLoaderVisible && this.state.page !== 0) {
            this.setState({
                    tempPage: this.state.page + 1,
                    isLoaderVisible: true
                },
                () => {
                    this.getBrandList();
                });
        }
    };

    _renderFooter = () => {
        if (this.state.isLoaderVisible && this.state.tempPage !== 1) {
            return (
                <View
                    style={{
                        marginVertical: 20,
                    }}>
                    <Label align="center"
                           color={Color.TEXT_DARK}
                           small>
                        {this.props.localeStrings.loadingMoreProducts}
                    </Label>
                </View>
            );
        }
        return null
    };

    _renderEmptyView = () => {
        return (!this.state.isLoaderVisible ?
            <View style={{flex: 1, alignItems: 'center'}}>
                <Label align="center" normal color={Color.TEXT_DARK}
                       mt={15}>
                    {this.props.localeStrings.pullRefresh}
                </Label>
            </View>
            : null)
    };

    emptyListStyle = () => {
        if (!this.state.brands.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    renderBrandGrid = () => {

        return (
            <View style={styles.gridContainer}>
                <FlatGrid
                   // key={}
                    spacing={10}
                    itemDimension={ThemeUtils.relativeWidth(95) / 2 - 10}
                    items={this.state.brands}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoaderVisible}
                        />}
                    itemContainerStyle={{alignItems: "center"}}
                    renderItem={({item}) => this.renderBrandItem(item)}
                    onEndReachedThreshold={0.5}
                    onEndReached={this.handleLoadMore}
                    // ListHeaderComponent={this._renderHeader}
                    ListFooterComponent={this._renderFooter}
                    ListEmptyComponent={this._renderEmptyView}
                    contentContainerStyle={this.emptyListStyle()}
                />
            </View>
        )
    };

    renderBrandItem = (item) => {
        const imgPath = this.state.brand_path;
        const img = item.image;
        return (
          <View style={styles.brandItem}>
            <TouchableOpacity
              style={styles.brandItemTouchable}
              onPress={()=>this.onClickBrand(item)}
              activeOpacity={0.8}>
              <LinearGradient
                start={{x: 0, y: 0.5}}
                end={{x: 0, y: 1}}
                colors={['#EFEFEF', '#F9F9F9']}
                style={styles.brandItemLinearGradient}>
                <View style = {styles.brandImageContainer}>
                <Image
                source={{uri: imgPath + img}}
                style={styles.brandItemImage}
              />
              </View>
              </LinearGradient>
              
            </TouchableOpacity>
            <Label
                mt={5}
                mb={5}
                small
                // singleLine
               // numberOfLines={3}
                nunito_bold
                bolder={IS_IOS}
                color={Color.TEXT_DARK}>
                {item?.name}
              </Label>
          </View>
        );
    };


    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation;

        let title = navigation.getParam("appNameTitle", ""),
            all = navigation.getParam("allCategoryTitle", Strings.all);

        if (state.params && state.params.subCategory && state.params.subCategory.name) {
            if (state.params.subCategory.name.toUpperCase() === all.toUpperCase()) {
                title = state.params && state.params.mainCategory && state.params.mainCategory.name ?
                    state.params.mainCategory.name : "";
            } else {
                title = state.params && state.params.subCategory && state.params.subCategory.name
            }
        } else if (state.params && state.params.searchParam) {
            title = state.params.searchParam
        } else {
            if (state.params && state.params.type && state.params.type.title) {
                title = state.params.type.title;
            }
        }

        return {
            title,
            header: (props) => <CustomNavigationHeader {...props}
                                                       showRightButton={true}
                                                       showLeftButton={true}
                                                       titleCenter={true}
                                                       isMainTitle={title === navigation.getParam("appNameTitle", Strings.appName)}/>
        }
    };

    constructor(props) {
        super(props);

        this.state = {
            brands: null,
            brand_path:'',
            isLoaderVisible: false,
            page: 1,
            tempPage: 1,
            errMessage: this.props.localeStrings.pleaseWait
        };

    }

    componentWillMount() {
        this.props.navigation.setParams({
            appNameTitle: this.props.localeStrings.appName,
            allCategoryTitle: this.props.localeStrings.all
        })
    }

    componentDidMount() {
        this.getBrandList();
    }

    shouldComponentUpdate(nextProps, nextState) {
        // if (this.props.navigation.state &&
        //     this.props.navigation.state.routeName === Routes.ProductListSearch &&
        //     this.props.navigation.state.params &&
        //     nextProps.navigation.state &&
        //     nextProps.navigation.state.params &&
        //     this.props.navigation.state.params.searchParam !== nextProps.navigation.state.params.searchParam
        // ) {
        //     return true
        // } else if (this.state !== nextState) {
        //     return true
        // } else if (this.props !== nextProps) {
        //     return true
        // }
        // return false
        return true
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        // if (this.props.navigation.state &&
        //     this.props.navigation.state.params &&
        //     prevProps.navigation.state ) {
        //     // console.log('mesafe1', this.props.navigation.state.params.searchParam);
        //     // console.log('mesafe2', prevProps.navigation.state.params.searchParam);

        //     this.setState({
        //         selectedFilters: [],
        //         showFilterPopUp: false,
        //         products: null,
        //         page: 1,
        //         tempPage: 1,
        //         searchTypeData: this.props.navigation.state.params.searchParam
        //     }, () => {
        //         this.getBrandList()
        //     })
        // }
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillFocus={payload => {
                        this._ismounted = false;
                    }}
                    onDidFocus={payload => {
                        this._ismounted = true;
                    }}
                    onWillBlur={payload => {
                        this._ismounted = true;
                    }}
                    onDidBlur={payload => {
                        this._ismounted = false;
                    }}
                />
             
                {this.state.brands ?
                    this.renderBrandGrid() :
                    <View style={{flex: 1, marginVertical: 10}}>
                        <View style={[{flex: 1}, CommonStyle.content_center]}>
                            <Label>{this.state.errMessage}</Label>
                        </View>
                    </View>}
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

export default connect(mapStateToProps, mapDispatchToProps)(BrandList)

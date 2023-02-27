import React, {Component} from 'react';
import {
    Image,
    View,
    I18nManager,
    StatusBar,
    FlatList, ScrollView, TouchableOpacity, RefreshControl, Text,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {SafeAreaView, NavigationEvents} from "react-navigation";
import {IndicatorViewPager, PagerDotIndicator} from 'rn-viewpager';

//Custom component
import {
    Label,
    Hr,
    ProductCard
} from "src/component";

//Utility
import styles from './styles';
import Action from "src/redux/action";
import {
    API_GET_CATEGORIES,
    API_HOME_PAGE,
    APIRequest,
    ApiURL
} from "src/api";
import {
    Color,
    ThemeUtils,
    Constants,
    Icon,
    Strings,
    CommonStyle,
    IS_IOS,
    showSuccessSnackBar,
    decodeImageUrl
} from "src/utils";
import Routes from "src/router/routes";

class Home extends Component {

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

    getHomeRequest = () => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id
            };
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_HOME_PAGE)
            .reqURL(ApiURL.homePage)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_HOME_PAGE:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            this.setState({productsData: response.data});
                            if (Object.keys(response.data).includes("banners") && response.data["banners"].length > 0) {
                                this.setState({banners: response.data["banners"]})
                            }
                            if (response.data.wishlist_count !== null && response.data.wishlist_count !== undefined) {
                                this.props.setWishlistCount(parseInt(response.data.wishlist_count));
                            }
                            if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                                this.props.setCartCount(parseInt(response.data.cart_count));
                            }
                            if (Array.isArray(response.data.category_banners) && response.data.category_banners.length > 0) {
                                this.setState({categoryBanners: response.data.category_banners})
                            }
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        console.log('error', error)
    };

    //User Interaction
    onClickBanner = (banner, isFromSlider = false) => {
        if (banner.product_id && banner.product_id !== "") {
            this.onClickProduct(banner)
        } else {
            this.props.navigation.navigate(Routes.ProductListHome, isFromSlider ? null : {
                subCategory: banner
            })
        }
    };

    onClickProduct = (item) => {
        this.props.navigation.navigate(Routes.ProductDetail, {
            productData: item
        })
    };

    onClickViewAll = (section) => {
        this.props.navigation.navigate(Routes.ProductListHome, {
            type: section.type
        })
    };

    //Utility
    updateProductData = (product, updateVal) => {
        let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode),
            HOME_SECTIONS = Constants.HOME_SECTIONS;
        if (selectedLang) {
            HOME_SECTIONS = selectedLang.home_string
        }

        let sectionsData = HOME_SECTIONS.map((item) => {
            if (Object.keys(this.state.productsData).includes(item.id) && this.state.productsData[item.id].length > 0) {
                return {
                    id: item.id,
                    title: item.title,
                    products: this.state.productsData[item.id]
                }
            }
        });

        for (let i = 0; i < sectionsData.length; i++) {
            let idxToReplace = sectionsData[i].products.findIndex((item) => item.product_id === product.product_id);
            if (idxToReplace !== -1) {
                //update product array
                sectionsData[i].products[idxToReplace] = {...product, wishlist: updateVal};

                //update section in state
                let newProductsData = {...this.state.productsData};
                newProductsData[sectionsData[i].id] = sectionsData[i].products;
                this.setState({productsData: newProductsData});

                //exit
                break;
            }
        }
        this._ismounted && showSuccessSnackBar(updateVal ? this.props.localeStrings.productAddWishlist : this.props.localeStrings.productRemoveWishlist);
    };

    //UI methods
    renderListItem = (item, index) => {
        return (
            <ProductCard productData={item}
                         onPress={this.onClickProduct}
                         onUpdateProduct={this.updateProductData}
                         navigation={this.props.navigation}
                         showDescription/>
        )
    };

    renderSection = (sectionData, index, length) => {
        return (
            <View key={sectionData.title}>
                {index === 0 ?
                    <View style={styles.sectionContainer}>
                        <View style={CommonStyle.content_center}>
                            <Label
                                mt={5}
                                mb={5}
                                large
                                nunito_bold
                                bolder={IS_IOS}
                                color={Color.TEXT_DARK}>
                                {this.props.user ? `${this.props.localeStrings.hello}, ${this.props.user.full_name}` : `${this.props.localeStrings.hello}`}
                            </Label>
                        </View>
                        <View style={styles.userLineContainer}>
                            <Hr lineStyle={styles.lineSeparator}/>
                        </View>
                    </View> : null
                }
                <View style={styles.sectionContainer}>
                    <View style={styles.categoryBlock}>
                        <Label nunito_bold
                               bolder={IS_IOS}
                               large
                               color={Color.TEXT_DARK}>
                            {sectionData.title}
                        </Label>
                        <Label nunito_bold
                               bolder={IS_IOS}
                               color={Color.TEXT_LIGHT}
                               onPress={() => this.onClickViewAll(sectionData)}>
                            {this.props.localeStrings.viewAll}
                        </Label>
                    </View>
                    <View style={styles.sectionLineContainer}>
                        <Hr lineStyle={styles.sectionLine}/>
                    </View>
                    <FlatList
                        horizontal
                        contentContainerStyle={{paddingHorizontal: 10}}
                        showsHorizontalScrollIndicator={false}
                        extraData={this.state}
                        data={sectionData.products}
                        keyExtractor={item => `${item.product_id}`}
                        renderItem={({index, item}) => this.renderListItem(item, index)}
                    />
                    {this.state.categoryBanners.length > 0
                    && this.state.categoryBanners[index] !== null
                    && this.state.categoryBanners[index] !== undefined
                    && this.state.categoryBanners[index].image ?
                        <View style={styles.bannerCategory}>
                            <TouchableOpacity activeOpacity={1}
                                              underlayColor={Color.TRANSPARENT}
                                              onPress={() => {
                                                  this.onClickBanner(this.state.categoryBanners[index])
                                              }}>
                                <Image
                                    source={{uri: decodeImageUrl(this.state.categoryBanners[index].image)}}
                                    resizeMode={'contain'}
                                    style={styles.bannerCategoryImage}/>
                            </TouchableOpacity>
                        </View>
                        : null
                    }
                    <View style={styles.sectionRuleContainer}>
                        {index !== length - 1 &&
                        <Hr lineStyle={styles.lineSeparator}/>
                        }

                    </View>
                </View>
            </View>
        )
    };

    renderHome = () => {
        let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode),
            HOME_SECTIONS = Constants.HOME_SECTIONS;
        if (selectedLang) {
            HOME_SECTIONS = selectedLang.home_string
        }
        //create sections with title and products array
        let sectionsData = HOME_SECTIONS.map((item) => {
            if (Object.keys(this.state.productsData).includes(item.id) && this.state.productsData[item.id].length > 0) {
                return {
                    type: item,
                    title: item.title,
                    products: this.state.productsData[item.id]
                }
            }
        });

        //return array of Views
        return sectionsData.map((section, index) => {
            if (section) {
                return this.renderSection(section, index, sectionsData.length);
            }
        })
    };

    _renderDotIndicator = () => {
        return <PagerDotIndicator pageCount={this.state.banners.length}
                                  hideSingle
                                  dotStyle={{backgroundColor: Color.LIGHT_GRAY}}
                                  selectedDotStyle={{backgroundColor: Color.PRIMARY}}/>;
    };

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            currentRTL: I18nManager.isRTL,
            productsData: null,
            banners: [],
            categoryBanners: [],
            isLoaderVisible: false
        };
        this._ismounted = false;
    }

    componentDidMount() {
        // console.log("isRTL", I18nManager.isRTL);
        // this.getHomeRequest();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.user !== this.props.user ||
            prevProps.wishlist !== this.props.wishlist ||
            prevProps.wishlistCount !== this.props.wishlistCount) {
            this.getHomeRequest()
        }
    }

    render() {
        return (
            <View style={styles.safeArea}>
                <StatusBar barStyle={'light-content'} backgroundColor={Color.BG_COLOR_DARK}/>
                <NavigationEvents
                    onWillFocus={payload => {
                        this._ismounted = false;
                    }}
                    onDidFocus={payload => {
                        this.getHomeRequest()
                    }}
                    onWillBlur={payload => {
                        this._ismounted = true;
                    }}
                    onDidBlur={payload => {
                        this._ismounted = false;
                    }}
                />
                <ScrollView removeClippedSubviews={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isLoaderVisible}
                                    onRefresh={this.getHomeRequest}
                                />}>
                    <View style={styles.container}>
                        {this.state.banners.length > 0 ?
                            <IndicatorViewPager
                                keyboardDismissMode='none'
                                style={styles.bannerSlider}
                                indicator={this._renderDotIndicator()}
                                autoPlayInterval={15000}
                                autoPlayEnable={true}>
                                {this.state.banners.map((item) => (
                                    <View key={item.title}>
                                        <TouchableOpacity activeOpacity={1}
                                                          underlayColor={Color.TRANSPARENT}
                                                          onPress={() => {
                                                              this.onClickBanner(item, true)
                                                          }}>
                                            <Image
                                                source={{uri: decodeImageUrl(item.image)}}
                                                style={styles.bannerSliderImage}/>
                                        </TouchableOpacity>
                                    </View>)
                                )}
                            </IndicatorViewPager>
                            : null
                        }
                        {/* {this.state.productsData ?
                            this.renderHome() :
                            null
                        } */}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(Action.logout()),
        setWishlistCount: (count) => dispatch(Action.setWishlistCount(count)),
        setCartCount: (count) => dispatch(Action.setCartCount(count)),
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        wishlist: state.wishlist,
        wishlistCount: state.wishlistCount,
        localeStrings: state.localeStrings,
        appConfig: state.appConfig,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Home)

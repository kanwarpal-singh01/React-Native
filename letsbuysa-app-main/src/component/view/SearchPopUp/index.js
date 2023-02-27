import React from 'react';
import {
    View,
    Animated,
    TouchableOpacity,
    BackHandler,
    StatusBar,
    TextInput,
    I18nManager,
    FlatList, Image, RefreshControl
} from 'react-native';

/// Utility
import styles from "./styles";
import {
    Color,
    ThemeUtils,
    Icon,
    IS_IOS,
    decodeImageUrl,
    Constants,
    Strings
} from "src/utils";
import Routes from "src/router/routes";
import Action from "src/redux/action";
import {API_GET_PRODUCTS, APIRequest, ApiURL} from "src/api";

// Custom Component
import Label from 'src/component/ui/Label';
import Ripple from 'src/component/ui/Ripple';
import UtilityManager from 'src/utils/UtilityManager';
import Hr from "src/component/ui/Hr";
import NavigationRefManager from "src/utils/NavigationRefManager";

/// Thired Party Library
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import debounce from 'lodash.debounce';

class SearchPopUp extends React.Component {

    //Server request
    searchProductRequest = (param) => {
        this.setState({
            isLoaderVisible: true,
        });
        this.lastFetchedKeyword = param;

        let params = {
            "customer_id": this.props.user ? this.props.user.customer_id : "",
            "search": param
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_PRODUCTS)
            .reqURL(ApiURL.getProducts)
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
            case API_GET_PRODUCTS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.product) {
                            this.setState({
                                results: response.data.product,
                                product_path : response.data.product_path
                            });
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
        switch (reqId) {
            case API_GET_PRODUCTS:
                this.setState({
                    errMessage: this.props.localeStrings.noProductsFound,
                    results: []
                });
                break;
        }
    };

    //Utility
    openAnimation = () => {
        this.setState({showSearch: true});
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(this.animatedWidth, {
                    toValue: ThemeUtils.relativeWidth(90),
                    duration: 200
                }),
                Animated.timing(this.animatedBorderRadius, {
                    toValue: 0,
                    duration: 300
                }),
                Animated.timing(this.animatedOpacity, {
                    toValue: 1,
                    duration: 500
                })]).start();
            // this.props.navigation.navigate(Routes.Search);
        }, 200)
    };

    closeAnimation = () => {
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(this.animatedWidth, {
                    toValue: 0,
                    duration: 300
                }),
                Animated.timing(this.animatedBorderRadius, {
                    toValue: 100,
                    duration: 300
                }),
                Animated.timing(this.animatedOpacity, {
                    toValue: 0,
                    duration: 100
                })
            ]).start(() => {
                this.setState({
                    showSearch: false,
                    searchParam: "",
                    results: []
                });
                this.props.setShowSearch(false);
                BackHandler.removeEventListener("SearchPopUpBack", this.handleHardwareBack);
            });
            // this.props.navigation.pop()
        }, 200)
    };

    handleHardwareBack = () => {
        this.closeAnimation();
        BackHandler.removeEventListener("SearchPopUpBack", this.handleHardwareBack);
        return true;
    };

    getImageThumb = (url) => {
        if (url) {
            let thumb_url = decodeImageUrl(this.state.product_path+url)
            // thumb_url = thumb_url.replace('500x500', '200x200');
            return thumb_url
        }
        return ""
    };

    searchProducts = (param) => {
        this.searchProductRequest(param);
    };

    // User Interation
    onChangeSearchText = (searchParam) => {
        this.setState({searchParam});
        this.debouncedSearch(searchParam);
    };

    onClickSearchAll = () => {
        this.setState({
            showSearch: false,
            searchParam: "",
            results: []
        }, () => {

            NavigationRefManager.navigate(Routes.ProductListSearch, {
                searchParam: this.lastFetchedKeyword
            });
            this.props.setShowSearch(false);
        });
    };

    onClickProduct = (item) => {
        this.setState({
            showSearch: false,
            searchParam: "",
            results: []
        }, () => {
            NavigationRefManager.push(Routes.ProductDetail, {
                productData: item
            });
            this.props.setShowSearch(false);
        });
    };

    onClickCloseBtn = () => {
        // this.props.navigation.pop();
        this.setState({searchParam: ""}, () => {
            this.closeAnimation()
        });
    };

    //UI methods
    renderEmptyView = () => {
        return (
            <View style={{alignItems: 'center'}}>
                <Label align="center" normal color={Color.TEXT_DARK}
                       mt={25}
                       mb={25}>
                    {this.state.isLoaderVisible ? "" : this.props.localeStrings.noProductsFound}
                </Label>
            </View>
        )
    };

    emptyListStyle = () => {
        if (!this.state.results.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    renderFooter = () => {
        return Array.isArray(this.state.results) && this.state.results.length > 0 ? (
            <TouchableOpacity
                activeOpacity={0.7}
                underlayColor={Color.TRANSPARENT}
                style={{
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onPress={this.onClickSearchAll}>
                <Label color={Color.PRIMARY}
                       small
                       mt={15}
                       mb={15}>
                    {this.props.localeStrings.viewAll}
                </Label>
            </TouchableOpacity>
        ) : null;
    };

    renderResults = () => {
        return this.state.searchParam ? (
            <View style={{
                position: 'absolute',
                top: 10 + (IS_IOS ?
                    (UtilityManager.getInstance().getStatusBarHeight() + ThemeUtils.APPBAR_HEIGHT + 10) - 10 :
                    ThemeUtils.APPBAR_HEIGHT - 10),
                end: ThemeUtils.relativeWidth(5),
                width: ThemeUtils.relativeWidth(90),
                backgroundColor: Color.WHITE,
                maxHeight: ThemeUtils.relativeHeight(60),
                borderBottomEndRadius: 5,
                borderBottomStartRadius: 5
            }}>
                <FlatList
                    extraData={this.state}
                    data={this.state.results}
                    renderItem={({index, item}) => this.renderSearchItem(item, index)}

                    keyExtractor={item => `${item.id}`}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoaderVisible}
                        />}
                    ItemSeparatorComponent={() => <Hr lineStyle={styles.lineSeparator}/>}
                    ListFooterComponent={this.renderFooter}
                    ListEmptyComponent={this.renderEmptyView}
                    contentContainerStyle={this.emptyListStyle()}
                />
            </View>
        ) : null
    };

    renderSearchItem = (item, index) => {
        return (
            <TouchableOpacity
                activeOpacity={0.7}
                underlayColor={Color.TRANSPARENT}
                style={{
                    marginVertical: 10,
                    marginHorizontal: 10,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                onPress={() => this.onClickProduct(item)}>
                <View style={{
                    width: ThemeUtils.relativeWidth(30),
                    aspectRatio: 1.3,
                    borderRadius: 5,
                    overflow: 'hidden',
                    backgroundColor: Color.LIGHT_GRAY
                }}>
                    {this.getImageThumb(item.img) ?
                        <Image
                            source={{uri: this.getImageThumb(item.img)}}
                            style={styles.productImg}
                            resizeMode={'cover'}
                        /> : null
                    }
                </View>
                <View style={{flex: 1, alignItems: 'flex-start', marginHorizontal: 5}}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {item.name}
                    </Label>
                    <View style={styles.productPrice}>
                        <Label
                            color={item.special ? Color.ERROR : Color.TEXT_DARK}
                            nunito_bold
                            bolder={IS_IOS}
                            xsmall
                            me={5}>
                            {item.special ? item.special : item.price}
                        </Label>
                        {item.special &&
                        <Label color={Color.TEXT_LIGHT}
                               me={5}
                               ms={5}
                               xsmall
                               nunito_bold
                               bolder={IS_IOS}
                               style={{textDecorationLine: 'line-through'}}>
                            {item.price}
                        </Label>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            statusBarHeight: 20,
            showSearch: false,
            results: [],
            product_path:'',
            searchParam: ""
        };
        this.animatedWidth = new Animated.Value(0);
        this.animatedOpacity = new Animated.Value(0);
        this.animatedBorderRadius = new Animated.Value(10);

        this.debouncedSearch = debounce(this.searchProducts, 200);
        this.lastFetchedKeyword = "";
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isSearchVisible !== this.props.isSearchVisible) {
            if (this.props.isSearchVisible) {
                this.openAnimation();
                BackHandler.addEventListener("SearchPopUpBack", this.handleHardwareBack);
            } else {
                this.closeAnimation();
            }
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("SearchPopUpBack", this.handleHardwareBack);
    }

    render() {
        return this.props.isSearchVisible ? (
            <View style={[
                styles.container
            ]}>
                <StatusBar barStyle={'light-content'} backgroundColor={Color.BLACK}/>
                {IS_IOS ?
                    <View style={[
                        styles.statusBarView,
                        {height: UtilityManager.getInstance().getStatusBarHeight()}
                    ]}/>
                    : null}
                <>
                    {this.state.showSearch ?
                        <Animated.View style={[
                            {
                                height: ThemeUtils.APPBAR_HEIGHT - (IS_IOS ? 0 : 10),
                                width: this.animatedWidth,
                                borderRadius: this.animatedBorderRadius,
                            },
                            styles.searchContainer
                        ]}>
                            <Animated.View style={[{
                                opacity: this.animatedOpacity,
                                // marginTop: IS_IOS ? UtilityManager.getInstance().getStatusBarHeight() : 0
                            },
                                styles.searchInnerContainer]}>
                                <TouchableOpacity
                                    onPress={this.onClickCloseBtn}
                                    style={{margin: 10}}>
                                    <Icon name={'back'}
                                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                                          color={Color.TEXT_DARK}
                                          size={20}/>
                                </TouchableOpacity>
                                <View style={{flex: 1}}>
                                    <TextInput
                                        style={[{
                                            flex: 1,
                                            textAlign: I18nManager.isRTL ? 'right' : 'left'
                                        }]}
                                        placeholder={this.props.localeStrings.searchPlaceholder}
                                        placeholderTextColor={Color.TEXT_LIGHT}
                                        value={this.state.searchParam}
                                        autoCorrect={false}
                                        onChangeText={(val) => {
                                            this.onChangeSearchText(val)
                                        }}
                                    />
                                </View>
                            </Animated.View>
                        </Animated.View> : null
                    }
                    {this.renderResults()}
                </>
            </View>
        ) : null
    }
}

SearchPopUp.defaultProps = {
    showLeftButton: true,
    showRightButton: true,
    rightIconName: "",
    showHomeProgress: false,
    btnLeftHandler: null
};

SearchPopUp.propTypes = {
    showLeftButton: PropTypes.bool,
    showRightButton: PropTypes.bool,
    rightIconName: PropTypes.string,
    showHomeProgress: PropTypes.bool,
    btnLeftHandler: PropTypes.func
};

const mapDispatchToProps = (dispatch) => {
    return {
        setShowSearch: (isSearchVisible) => dispatch(Action.setShowSearch(isSearchVisible))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        isSearchVisible: state.isSearchVisible,
        localeStrings: state.localeStrings
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(SearchPopUp);

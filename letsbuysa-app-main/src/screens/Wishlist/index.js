import React, {Component} from 'react';
import {
    Text,
    View,
    Image,
    RefreshControl,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {FlatGrid} from "react-native-super-grid";
import {NavigationActions, NavigationEvents, StackActions} from "react-navigation";

//Custom component
import {
    Label,
    Hr,
    RoundButton,
    ProductCard,
    CustomNavigationHeader
} from "src/component";

//Utility
import Action from "src/redux/action";
import {API_GET_WISHLIST, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import Routes from "src/router/routes";
import {
    Color,
    showSuccessSnackBar,
    ThemeUtils,
    Constants, Strings, CommonStyle
} from "src/utils";

const EMPTY_WISHLIST = require('src/assets/images/empty_wishlist.png');

class Wishlist extends Component {

    //Server request
    getWishlistRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user ? this.props.user.customer_id : ""
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_WISHLIST)
            .reqURL(ApiURL.getWishlist)
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
            case API_GET_WISHLIST:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.product) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                imagepath:response?.data?.imagepath,
                                products: this.state.tempPage === 1 ? response.data.product : [...this.state.product, ...response.data.product],
                                page: dummyPage
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
        console.log('error', error);
        switch (reqId) {
            case API_GET_WISHLIST:
                break;
        }
    };

    //User Interaction
    onClickProduct = (item) => {
        this.props.navigation.push(Routes.ProductDetail, {
            productData: item
        })
    };

    onClickAddItems = () => {
        if (this.props.navigation.state.routeName === Routes.Wishlist) {
            this.props.navigation.navigate(Routes.Home)
        } else {
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                key: undefined,
                actions: [
                    NavigationActions.navigate({routeName: Routes.MainTabs}),
                ]
            }));
        }
    };

    handleLoadMore = () => {
        /*console.log('this.state.tempPage', this.state.page);
        console.log('this.state.isLoaderVisible', this.state.isLoaderVisible);

        if (!this.state.isLoaderVisible && this.state.page !== 0) {
            this.setState({
                    tempPage: this.state.page + 1,
                    isLoaderVisible: true
                },
                () => {
                    this.getWishlist();
                });
        }*/
    };

    //Utility
    updateProductData = (product, updateVal) => {
        let currentProducts = this.state.products.slice();
        let idxToReplace = currentProducts.findIndex((item) => item.product_id === product.product_id);
        if (idxToReplace !== -1) {
            currentProducts.splice(idxToReplace, 1);
            this.setState({products: currentProducts});
        }
        this.setWishlistHeader()
    };

    getWishlist = () => {
        if (this.props.user) {
            this.getWishlistRequest()
        } else {
            this.setState({
                isLoaderVisible: false,
                products: this.props.wishlist
            });
        }
    };

    setWishlistHeader = () => {
        if (this.props.user) {
            let title = this.props.wishlistCount > 0 ?
                `${this.props.localeStrings.myWishList} (${this.props.wishlistCount})` : `${this.props.localeStrings.myWishList}`;
            this.props.navigation.setParams({wishlistTitle: title})
        } else {
            let title = this.props.wishlist.length > 0 ?
                `${this.props.localeStrings.myWishList} (${this.props.wishlist.length})` : `${this.props.localeStrings.myWishList}`;
            this.props.navigation.setParams({wishlistTitle: title})
        }
    };

    //UI methods
    renderProductGrid = () => {
        return (
            <View style={styles.gridContainer}>
                <FlatGrid
                    spacing={10}
                    itemDimension={ThemeUtils.relativeWidth(95) / 2 - 10}
                    items={this.state.products}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoaderVisible}
                            onRefresh={this.getWishlist}
                        />}
                    itemContainerStyle={{alignItems: "center"}}
                    renderItem={({item}) => this.renderProductItem(item)}
                    onEndReachedThreshold={0.5}
                    onEndReached={this.handleLoadMore}
                    ListFooterComponent={this._renderFooter}
                    ListEmptyComponent={this._renderEmptyView}
                    contentContainerStyle={this.emptyListStyle()}
                />
            </View>
        )
    };

    renderProductItem = (item) => {
        return (
            <ProductCard productData={item}
                         imagepath={this.state.imagepath}
                         onPress={this.onClickProduct}
                         onUpdateProduct={this.updateProductData}
                         navigation={this.props.navigation}
                         newDesign/>
        )
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
        console.log(this.state.isLoaderVisible);
        return (!this.state.isLoaderVisible ?
            <View style={{alignItems: 'center'}}>
                <View style={{
                    width: ThemeUtils.relativeWidth(30),
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image
                        source={EMPTY_WISHLIST}
                        style={{flex: 1}}
                        resizeMode={'contain'}/>
                </View>
                <Label align="center"
                       normal color={Color.TEXT_DARK}
                       nunito_medium
                       mt={15}
                       mb={15}>
                    {this.props.localeStrings.emptyWishlist}
                </Label>
                <RoundButton backgroundColor={Color.PRIMARY}
                             textColor={Color.WHITE}
                             border_radius={5}
                             width={ThemeUtils.relativeWidth(50)}
                             click={this.onClickAddItems}>
                    {this.props.localeStrings.addItems}
                </RoundButton>
            </View>
            : <View style={{flex: 1, marginVertical: 10}}>
                <View style={[{flex: 1}, CommonStyle.content_center]}>
                    <Label>{this.props.localeStrings.pleaseWait}</Label>
                </View>
            </View>)
    };

    emptyListStyle = () => {
        if (!this.state.products.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation,
            title = navigation.getParam("wishlistTitle", Strings.myWishList);

        // let title = wishlistCount > 0 ? `${Strings.myWishList} (${wishlistCount})` : Strings.myWishList;

        return {
            title,
            header: (props) => <CustomNavigationHeader {...props}
                                                       showLeftButton={state.routeName !== Routes.Wishlist}
                                                       titleCenter={true}
                                                       isMainTitle={false}/>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            products: [],
            imagepath:'',
            isLoaderVisible: true,
            page: 1,
            tempPage: 1,
        };
    }

    componentDidMount() {
        this.getWishlist();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.wishlist !== prevProps.wishlist && this.currentWishlistProduct) {
            let findIndex = this.props.wishlist.findIndex(product => product.id === this.currentWishlistProduct.id),
                wishlist_add = null;
            if (findIndex === -1) {
                //if product removed
                this.updateProductData(this.currentWishlistProduct, false);
                wishlist_add = false;
            } else {
                //if product added
                this.updateProductData(this.currentWishlistProduct, true);
                wishlist_add = true;
            }
            this.setWishlistHeader();
            this._ismounted && showSuccessSnackBar(wishlist_add ? this.props.localeStrings.productAddWishlist : this.props.localeStrings.productRemoveWishlist);
        }
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
                        this.getWishlist();
                        this.setWishlistHeader();
                    }}
                    onWillBlur={payload => {
                        this._ismounted = true;
                    }}
                    onDidBlur={payload => {
                        this._ismounted = false;
                    }}
                />
                {this.renderProductGrid()}
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setWishlistCount: (count) => dispatch(Action.setWishlistCount(count))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        wishlist: state.wishlist,
        wishlistCount: state.wishlistCount,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Wishlist)

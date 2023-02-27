import React, {Component} from 'react';
import {
    View,
    Alert,
    TouchableOpacity,
    FlatList,
    Image, RefreshControl, I18nManager,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {SafeAreaView, NavigationEvents, NavigationActions, StackActions} from "react-navigation";

//custom component
import {
    Label,
    RoundButton,
    CustomNavigationHeader,
    ModalDropdown,
    ProductOptionPopUp
} from 'src/component'

//Utility
import Action from "src/redux/action";
import {
    API_ADD_TO_CART,
    API_GET_CART,
    API_MOVE_TO_WISHLIST,
    API_REMOVE_FROM_CART,
    API_GET_PRODUCT_DETAIL,
    API_CHECKOUT_CART,
    APIRequest,
    ApiURL
} from "src/api";
import styles from './styles';
import Routes from "src/router/routes";
import {
    CommonStyle,
    Color,
    Constants,
    ThemeUtils,
    IS_IOS,
    Icon,
    Strings,
    decodeImageUrl,
    showErrorSnackBar,
    showSuccessSnackBar,
    numberWithCommas,
    isHexValid, AdjustAnalyticsService
} from "src/utils";
import Spinner from "react-native-loading-spinner-overlay";

const EMPTY_CART = require('src/assets/images/empty_cart.png');
const updateType = {
    quantity: 1,
    size_color: 2
};

class Cart extends Component {

    //Server request
    getCartRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user ? this.props.user.customer_id : ""
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_CART)
            .reqURL(ApiURL.getCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    getProductDetailRequest = () => {
        this.setState({
            changeOptLoader: true,
            mainLoader: true
        });

        let params = {
            "product_id": this.state.changedCartItem.id
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_PRODUCT_DETAIL)
            .reqURL(ApiURL.getProductDetail)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    removeProductRequest = (cart_product) => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
            "cart_id": cart_product.cart_id,
            "product_id": cart_product.product_id,
        };

        if (cart_product.option_id){
            params['option_id'] = cart_product.option_id
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_REMOVE_FROM_CART)
            .reqURL(ApiURL.removeFromCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    updateCartRequest = (cart_item, type, value = null) => {
        let params = {
            "customer_id": this.props.user.customer_id,
            "product_id": cart_item.product_id,
            "cart_id": cart_item.cart_id,
        };

        if (type === updateType.quantity && value !== null) {
            // params['type'] = 'qty';
            params['quantity'] = value;
           params["option_id"] = cart_item.option_id

            // if (Array.isArray(cart_item.option) && cart_item.option.length > 0) {
            //     cart_item.option.map(option => {
            //         params[`option[${option.product_option_id}]`] = option.product_option_value_id
            //     })
            // }

        } else if (type === updateType.size_color && value !== null) {
            params['quantity'] = cart_item.quantity;
            params['type'] = 'size_color';
            if (Array.isArray(value) && value.length > 0) {
                value.map((option) => {
                    params[`option[${Object.keys(option)[0]}]`] = option[Object.keys(option)[0]];
                });
            }
        }


        new APIRequest.Builder()
            .post()
            .setReqId(API_ADD_TO_CART)
            .reqURL(ApiURL.addToCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    moveToWishListRequest = (cart_product) => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
            "cart_id": cart_product.cart_id,
            "product_id": cart_product.product_id,

        };
        if (cart_product.option_id){
            params['option_id'] = cart_product.option_id
        }


        new APIRequest.Builder()
            .post()
            .setReqId(API_MOVE_TO_WISHLIST)
            .reqURL(ApiURL.moveToWishlist)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    checkoutCartRequest = () => {
        this.setState({
            mainLoader: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_CHECKOUT_CART)
            .reqURL(ApiURL.checkoutCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false,
        });
        switch (reqId) {
            case API_GET_CART:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && Array.isArray(response.data.products)){
                            this.setState({
                               cart : response?.data?.products,
                               product_path: response?.data?.product_path
                            }, () => {
                                this.checkForQuantity();
                            });
                        }
                        if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                            this.props.setCartCount(parseInt(response.data.cart_count));
                            this.setCartHeader();
                        }

                        if (response.data && response.data.information) {
                            this.setState({infoHtml: response.data.information})
                        }
                        break
                }
                break;

            case API_REMOVE_FROM_CART:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && Array.isArray(response.data.products)) {
                            this.setState({
                                cart: response.data.products,
                            }, () => {
                                this.checkForQuantity();
                            });
                        }
                        showSuccessSnackBar(this.props.localeStrings.prduct_remove);

                        if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                            this.props.setCartCount(parseInt(response.data.cart_count));
                            this.setCartHeader();
                        }
                        break
                }
                break;

            case API_ADD_TO_CART:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            response.data.success) {
                            //show toast
                            this.getCartRequest();
                            setTimeout(() => {
                                showSuccessSnackBar(this.props.localeStrings.productUpdateCartMessage);
                                if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                                    this.props.setCartCount(parseInt(response.data.cart_count));
                                }
                            }, 500)
                        }
                        break;
                }
                break;

            case API_MOVE_TO_WISHLIST:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            response.data.success) {
                            //show toast
                            this.getCartRequest();
                            setTimeout(() => {
                                showSuccessSnackBar(this.props.localeStrings.productMoveToWishlist);
                            }, 500)
                        }
                        if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                            this.props.setCartCount(parseInt(response.data.cart_count));
                            this.setCartHeader();
                        }
                        if (response.data.wishlist_count !== null && response.data.wishlist_count !== undefined) {
                            this.props.setWishlistCount(parseInt(response.data.wishlist_count));
                        }
                        break;
                }
                break;

            case API_GET_PRODUCT_DETAIL:
                this.setState({
                    changeOptLoader: false,
                    mainLoader: false
                });
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.product) {
                            this.setState({
                                showChangeOptionPopUp: true,
                                changeOptProductDetail: {...response.data.product},
                            });
                        }
                        break
                }
                break;

            case API_CHECKOUT_CART:
                this.setState({
                    mainLoader: false
                });
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            // if (Array.isArray(response.data.addresses) && response.data.addresses.length > 0) {
                            //     this.props.navigation.navigate(Routes.Checkout, {
                            //         checkoutParams: response.data,
                            //         isFromRoute:this.props.navigation.state.routeName
                            //     })
                            // } else {
                            //     setTimeout(() => {
                            //         this.showNoAddressAlert();
                            //     }, 250);
                            // }
                            this.props.navigation.navigate(Routes.Checkout, {
                                checkoutParams: response.data,
                                isFromRoute:this.props.navigation.state.routeName
                            })
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({
            changeOptLoader: false,
            mainLoader: false,
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_GET_CART:
                this.setState({
                    cart: [],
                });
                this.props.setCartCount(0);
                this.setCartHeader();
                break;
            case API_GET_PRODUCT_DETAIL:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(this.props.localeStrings.errCouldNotGetProductDetail)
                }
                this.setState({
                    changedCartItem: null,
                    changeOptProductDetail: null,
                });
                break;
            default:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break
        }
    };

    //User Interaction
    onClickRemove = (product) => {

        if (this.props.user) {
            this.removeProductRequest(product)
        } else {
            this.props.removeFromCart(product)
        }
        // Alert.alert(this.props.localeStrings.areUSure,
        //     this.props.localeStrings.deleteItemToCartMessage,
        //     [
        //         {
        //             text: this.props.localeStrings.yes, onPress: () => {
                        
        //             }
        //         },
        //         {
        //             text: this.props.localeStrings.no, onPress: () => {
        //             }
        //         }
        //     ])
    };

    onClickMoveToWish = (product) => {
        if (this.props.user) {
            this.moveToWishListRequest(product)
        } else {
            this.moveToWishlistLocal(product)
        }
        // Alert.alert(this.props.localeStrings.areUSure,
        //     this.props.localeStrings.deleteItemToCartAndMoveToWishlist,
        //     [
        //         {
        //             text: this.props.localeStrings.yes, onPress: () => {
                        
        //             }
        //         },
        //         {
        //             text: this.props.localeStrings.no, onPress: () => {
        //             }
        //         }
        //     ])
    };

    onChangeQuantity = (index, value, item) => {
        // if(item?.qty === item.quantity || item?.qty < item.quantity){
        //     return
        // }
        if (this.props.user) {
            this.updateCartRequest(item, updateType.quantity, value)
        } else {
            let updatedProduct = {
                ...item,
                quantity: value
            };
            this.props.updateInCart(updatedProduct);
        }
    };

    onClickFreeShipping = () => {

        if (this.props.appConfig && Array.isArray(this.props.appConfig.languages)) {
            let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode);
            if (selectedLang && selectedLang.information) {
                let html = selectedLang.information.find(type => type.title === 'Shipping & Delivery' ||
                    type.title === 'الشحن والتوصيل'
                );
                if (html) {
                    this.props.navigation.navigate(Routes.WebsiteView, {
                        title: html.title,
                        description: html.description
                    })
                }
            }
        }
    };

    onClickCheckout = () => {

        //analytics
        AdjustAnalyticsService.checkoutEvent();

        if (this.props.user) {
            this.checkoutCartRequest()
        } else {
            let params = {
                fromRoute: this.props.navigation.state.routeName === Routes.Cart ?
                    Routes.MainTabs : Routes.CartOutside
            };

            this.props.navigation.navigate(Routes.Login, params)
        }
    };

    onClickCartItem = (item) => {
        let {local_id, ...rest} = item;

        this.props.navigation.push(Routes.ProductDetail, {
            productData: rest
        })
    };

    onClickGoShopping = () => {
        if (this.props.navigation.state.routeName === Routes.Cart) {
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

    onClickOptionVal = (cart_item) => {
        this.setState({
            changedCartItem: cart_item,
        }, () => {
            this.getProductDetailRequest();
        })
    };

    onClickChangeOptApply = (changedOption) => {
        if (Array.isArray(changedOption) && changedOption.length > 0) {
            if (this.props.user) {
                this.updateCartRequest(
                    this.state.changedCartItem,
                    updateType.size_color,
                    changedOption
                )
            } else {
                let addedProduct = {
                        ...this.state.changedCartItem
                    },
                    selectedOptions = {},
                    selectedOptionsDetail = [];

                if (changedOption.length === this.state.changedCartItem.options.length) {
                    changedOption.map(option => {
                        let optionType = Object.keys(option)[0]; //type of option id eg. "Choose Color"
                        let optionValue = option[Object.keys(option)[0]]; //value of option id eg. "Purple"

                        //add key value pairs eg.: {"344":"255"}
                        selectedOptions = {
                            ...selectedOptions,
                            ...{[`${optionType}`]: `${optionValue}`}
                        };

                        let optionMainObj = this.state.changedCartItem.options.find(mainOpt => mainOpt.product_option_id === optionType);

                        let optionValueObj = optionMainObj ? optionMainObj.product_option_value.find(valueOpt => valueOpt.product_option_value_id === optionValue) : null;
                        if (optionValueObj) {
                            optionValueObj.value = optionValueObj.name;
                            let {name, ...rest} = optionValueObj;
                            selectedOptionsDetail.push({
                                name: optionMainObj.name,
                                ...optionMainObj,
                                ...rest,
                            })
                        }
                    });


                    addedProduct[`selectedOptions`] = selectedOptions;
                    selectedOptionsDetail.length > 0 ? addedProduct[`option`] = selectedOptionsDetail : null;
                    //update Cart in local
                    this.onUpdateInLocalAction(addedProduct)
                } else {
                    showErrorSnackBar(this.props.localeStrings.optionsError)
                }
            }
        }
    };

    //Utility
    getCart = () => {
        if (this.props.user) {
            this.getCartRequest();
            this.setCartHeader();
        } else {
            this.setState({
                cart: this.props.cart,
                isLoaderVisible: false
            }, () => {
                this.setCartHeader();
                this.checkForQuantity()
            });
        }
    };

    getQuantityPrice = (item) => {
        if (item.total) {
            return `SR ${numberWithCommas(item.total)}`
        }
        let priceVal = 0;
        if (item.special) {
            priceVal = parseInt(item?.special?.replace(/[^0-9.]/g, ''));
        } else {
            priceVal = parseInt(item?.price?.replace(/[^0-9.]/g, ''));
        }
        let qty = parseInt(item.quantity) || 1;

        if (!isNaN(priceVal) && !isNaN(qty)) {
            return `SR ${numberWithCommas(priceVal * qty)}`
        }
        return `SR 0`
    };

    getCartItemLabel = () => {
        let tot_items = 0,
            label = this.props.localeStrings.item;
        if (this.state.cart && this.state.cart.length > 0) {
            this.state.cart.map((item) => {
                if (!this.checkOutOfStock(item)) {
                    tot_items += (parseInt(item.quantity) || 1)
                }
            });

            if (tot_items > 1) {
                label = this.props.localeStrings.items
            }
            return {
                label: `${tot_items} ${label}`,
                tot_items
            }
        }
        return {
            label: this.props.localeStrings.noItems,
            tot_items: 0
        }
    };

    getCartTotal = () => {
        let price = 0;
        if (this.state.cart && this.state.cart.length > 0) {
            this.state.cart.map((item) => {
                let actualPrice = 0;
                if (item.total) {
                    actualPrice = parseInt(item?.total?.replace(/[^0-9.]/g, '')) || 0;
                } else if (item.price) {
                    actualPrice = parseInt(item?.price?.replace(/[^0-9.]/g, '')) || 0;
                } else {
                    actualPrice = parseInt(item?.price?.replace(/[^0-9.]/g, '')) || 0;
                }

                if (item.total) {
                    price += actualPrice
                }
                // check if in stock, and also required quantity is less than equal to stock quantity
                else if (!this.checkOutOfStock(item)) {
                    price += (item.quantity || 1) * actualPrice;
                }
            });
            return price
        }
        return 0
    };

    setCartHeader = () => {
        if (this.props.user) {
            let title = this.props.cartCount > 0 ?
                `${this.props.localeStrings.navMyCart} (${this.props.cartCount})` : `${this.props.localeStrings.navMyCart}`;
            this.props.navigation.setParams({cartTitle: title})
        } else {
            let {label, tot_items} = this.getCartItemLabel();
            let title = tot_items > 0 ?
                `${this.props.localeStrings.navMyCart} (${tot_items})` : `${this.props.localeStrings.navMyCart}`;
            this.props.navigation.setParams({cartTitle: title})
        }
    };

    getImage = (item) => {

        const path = item.productPath || this.state.product_path

        if (Array.isArray(item.images) && item.images > 0) {
            if (item.images[0].thumb) {
                return decodeImageUrl(path+item.images[0].thumb)
            }
            return decodeImageUrl(item.images[0].popup)
        } else if (typeof item.images === 'string' && item.images) {
            return decodeImageUrl(path+item.images)
        }

        return decodeImageUrl(path+(item.thumb || item.img|| item.image))
    };

    moveToWishlistLocal = (new_product) => {
        this.props.removeFromCart(new_product);
        let wishlist_found = this.props.wishlist.find((product) => product.product_id === new_product.product_id);
        if (!wishlist_found) {
            this.props.addToWishlist(new_product)
        }
    };

    checkForQuantity = () => {
        let errorQuantityItems = [];

        if (this.state.cart.length > 0) {

            this.state.cart.map(cartItem => {

                //check for greater required quantity than stock error
                if (Array.isArray(cartItem.option) && cartItem.option.length > 0) {
                    for (let i = 0; i < cartItem.option.length; i++) {
                        if (cartItem.option[i].qty !== null
                            && cartItem.option[i].qty !== undefined) {
                            if (parseInt(cartItem.option[i].qty) < parseInt(cartItem.quantity)) {
                                if (!errorQuantityItems.includes(cartItem.cart_id)) {
                                    errorQuantityItems.push(cartItem.cart_id);
                                    break;
                                }
                            } else {
                                if (errorQuantityItems.includes(cartItem.cart_id)) {
                                    errorQuantityItems = errorQuantityItems.filter(errorItem => errorItem !== cartItem.cart_id);
                                }
                            }
                        }
                    }
                } else if (parseInt(cartItem.qty) < parseInt(cartItem.quantity)) {
                    if (!errorQuantityItems.includes(cartItem.cart_id)) {
                        errorQuantityItems.push(cartItem.cart_id)
                    }
                } else {
                    if (errorQuantityItems.includes(cartItem.cart_id)) {
                        errorQuantityItems = errorQuantityItems.filter(errorItem => errorItem !== cartItem.cart_id);
                    }
                }
            });
        } else {
            errorQuantityItems = []
        }

        this.setState({errorQuantityItems})
    };

    extractOptionName = (text) => {
        let opt = text?.toLowerCase().replace(this.props.localeStrings.choose.toLowerCase(), '');
        opt = opt?.toLowerCase().replace(this.props.localeStrings.select.toLowerCase(), '');
        opt = opt.trim();
        return opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : '';
    };

    onUpdateInLocalAction = (finalProduct) => {
        this.props.updateOptionInCart(finalProduct, this.state.changeLocalProductIdx);
        showSuccessSnackBar(this.props.localeStrings.productUpdateCartMessage)
    };

    showNoAddressAlert = () => {
        let fromRoute = this.props.navigation.state.routeName === Routes.CartOutside ||
        this.props.navigation.state.routeName === Routes.CartNotif ?
            this.props.navigation.state.routeName : Routes.MainTabs;

        this.props.navigation.navigate(Routes.MyAddress, {
            isFromCheckout: true,
            isFromRoute: fromRoute
        });
        /*Alert.alert(this.props.localeStrings.warning,
            this.props.localeStrings.noAddressAddedError,
            [{
                text: this.props.localeStrings.cancel, onPress: () => {
                }
            }, {
                text: this.props.localeStrings.ok, onPress: () => {
                    this.props.navigation.navigate(Routes.MyAddress, {
                        isFromCheckout: true,
                        isFromRoute: this.props.navigation.state.routeName
                    });
                }
            }
            ]);*/
    };

    checkOutOfStock = (product) => {
        let outOfStock = false;
        if (Array.isArray(product.option) && product.option.length > 0) {
            for (let i = 0; i < product.option.length; i++) {
                if (product.option[i].qty !== null
                    && product.option[i].qty !== undefined
                    && parseInt(product.option[i].qty) <= 0) {
                    outOfStock = true;
                    break;
                }
            }
        } else {
            if (product.qty !== null
                && product.qty !== undefined
                && parseInt(product.qty) <= 0) {
                outOfStock = true;
            }
        }
        return outOfStock
    };

    handleRedirectToScreen = payload => {
        this._ismounted = true;
        this.getCart();
        this.setCartHeader();
    };

    //UI
    renderListHeader = () => {
        let {label, tot_items} = this.getCartItemLabel(),
            cart_total = this.getCartTotal();

        let freeTotalAmt = this.props.appConfig.free_total ?
            this.props.appConfig.free_total : Constants.FREE_SHIPPING_AMT;

        let amtRemaining = parseInt(freeTotalAmt) - parseInt(cart_total);

        if (tot_items > 0) {
            return (
                <View style={styles.freeShippingContainer}>
                    {amtRemaining > 0 ?
                        <>
                            <Label nunito_medium
                                   xsmall
                                   mt={10}
                                   mb={10}
                                   me={5}
                                   color={Color.BLACK}>
                                {this.props.localeStrings.add}
                            </Label>
                            <Label nunito_medium
                                   xsmall
                                   mt={10}
                                   mb={10}
                                   me={5}
                                   color={Color.GREEN}>
                                {`SR${amtRemaining}`}
                            </Label>
                            <Label nunito_medium
                                   xsmall
                                   mt={10}
                                   mb={10}
                                   me={5}
                                   color={Color.BLACK}>
                                {this.props.localeStrings.toGet}
                            </Label>
                            <Label nunito_bold
                                   xsmall
                                   bolder={IS_IOS}
                                   color={Color.PRIMARY}
                                   style={{textDecorationLine: 'underline'}}
                                   onPress={this.onClickFreeShipping}>
                                {this.props.localeStrings.freeShipping}
                            </Label>
                        </> :
                        <>
                            <Label nunito_medium
                                   xsmall
                                   mt={10}
                                   mb={10}
                                   me={5}
                                   color={Color.BLACK}>
                                {this.props.localeStrings.youAreEligible}
                            </Label>
                            <Label nunito_bold
                                   xsmall
                                   bolder={IS_IOS}
                                   color={Color.PRIMARY}
                                   style={{textDecorationLine: 'underline'}}
                                   onPress={this.onClickFreeShipping}>
                                {this.props.localeStrings.freeShipping}
                            </Label>
                        </>
                    }
                </View>
            )
        }
        return null
    };

    renderEmptyView = () => {
        return (!this.state.isLoaderVisible ?
            <View style={{alignItems: 'center'}}>
                <View style={styles.emptyImage}>
                    <Image
                        source={EMPTY_CART}
                        style={{flex: 1}}
                        resizeMode={'contain'}/>
                </View>
                <Label align="center"
                       normal color={Color.TEXT_DARK}
                       nunito_medium
                       mt={15}
                       mb={15}>
                    {this.props.localeStrings.noProductsInCard}
                </Label>
                <RoundButton backgroundColor={Color.PRIMARY}
                             textColor={Color.WHITE}
                             border_radius={5}
                             width={ThemeUtils.relativeWidth(50)}
                             click={this.onClickGoShopping}>
                    {this.props.localeStrings.goShopping}
                </RoundButton>
            </View>
            : <View style={{flex: 1, marginVertical: 10}}>
                <View style={[{flex: 1}, CommonStyle.content_center]}>
                    <Label>{this.props.localeStrings.pleaseWait}</Label>
                </View>
            </View>)
    };

    emptyListStyle = () => {
        if (!this.state.cart.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    renderLessStockLabel = (item) => {
        let isOutofStock = this.checkOutOfStock(item);
        if (isOutofStock ||
            (item.qty !== null &&
                item.qty !== undefined &&
                parseInt(item.qty) >= 0 &&
                parseInt(item.qty) < this.props.appConfig.min_stock_qty)) {
            return (
                <View style={styles.stockLabel}>
                    <Label color={isOutofStock ? Color.ERROR : Color.PRIMARY}
                           xsmall
                           nunito_medium>
                        {isOutofStock ? this.props.localeStrings.outOfStock : `${this.props.localeStrings.only} ${item.qty} ${this.props.localeStrings.left}`}
                    </Label>
                </View>
            )
        }
        return null;
    };

    renderOptionsSection = (item) => {

        console.log('option name',item)

       let sizeOpt = null,
       colorOpt = null
       let option = null
       let otherOpt = null;

        if (item?.option_id) {
          
            colorOpt = item.color ? {product_option_id:item.option_id,name:this.props.localeStrings.color,quantity:item.quantity,color:item.color} : null,
            option = item.option_name? item.option_name  : null,
            subOption = item.option_value ? {id:item.option_id,option_value:item.option_value, quantity:item.quantity} : null

         
                if(option === 'Size'){
                    option = this.props.localeStrings.size
            }
           
        } else {
            colorOpt = item?.selectedColor || null 
            if(colorOpt){
                colorOpt = {...colorOpt,name:this.props.localeStrings.color}
            }

            option = item?.selectedOption ? I18nManager.isRTL ? item?.selectedOption.name_ar : item?.selectedOption.name_en :null
            // option = item?.selectedOption || null
            subOption = item?.selectedSubOption || null
        }
        

        return  (
            <>
                {colorOpt ?
                    <View style={styles.optionTypeContainer} key={colorOpt.product_option_id}>
                        <Label color={Color.TEXT_DARK}
                               me={5}
                               small>
                            {colorOpt?.name}
                        </Label>
                        {
                            this.renderColor(colorOpt)
                        }
                    </View> : null
                }
                {option ?
                    <View style={styles.optionTypeContainer} key={option.id}>
                        <Label color={Color.TEXT_DARK}
                               me={5}
                               small>
                            {`${option} :`}
                        </Label>
                        {
                            this.renderSelectedOption(subOption)
                        }
                    </View> : null
                }
            </>
        ) 
    };

    renderColor = (optionValue)=>{
         let isOutOfStock = optionValue.quantity && parseInt(optionValue.quantity) === 0;
         return optionValue.color ? (
            <TouchableOpacity
                disabled={isOutOfStock}
                key={optionValue.id}
                activeOpacity={0.9}
                underlayColor={Color.TRANSPARENT}
                style={[
                    styles.colorOption,
                    isOutOfStock ? {
                        padding: 5, width: 32,
                        height: 32,
                        borderRadius: 16,
                    } : null,
                    isOutOfStock ? styles.noStockOption : styles.shadowBg
                ]}
                // onPress={() => this.selectColor(optionValue)}
                >
                <View style={[
                    styles.colorOption,
                     styles.selectedOption,
                    isHexValid(optionValue.color) ?
                        {backgroundColor: optionValue.color} :
                        {backgroundColor: Color.LIGHT_GRAY}
                ]}>
                    {/* {isHexValid(optionValue.hex_code) ?
                        <View/> 
                    } */}
                </View>
            </TouchableOpacity>
        ) : <View/>
    }

    renderSelectedOption = (optionType) => {
  
        let isOutOfStock = optionType.quantity && parseInt(optionType.quantity) === 0;
        return (
            <TouchableOpacity
                        activeOpacity={0.7}
                        underlayColor={Color.TRANSPARENT}
                    //    onPress={() => this.onClickOptionVal(optionType)}
                        key={optionType.id}
                        style={[
                            styles.sizeOption,
                            {backgroundColor: Color.PRIMARY},
                            isOutOfStock ? {opacity: 0.5} : null
                        ]}>
                        <Label xsmall
                               mt={3}
                               mb={3}
                               me={3}
                               ms={3}
                               color={Color.WHITE}>
                            {optionType.option_value ? optionType.option_value.toLowerCase() : ""}
                        </Label>
                    </TouchableOpacity>
            )

    };

    renderQuantitySection = (item) => {
        let isOutOfStock = this.checkOutOfStock(item),
            quantityError = false,
            maxQty = 0;
        if (!isOutOfStock && item.qty !== null && item.qty !== undefined) {
            if (parseInt(item.qty) > 0) {
                maxQty = parseInt(item.qty) > 10 ? 10 : parseInt(item.qty);
            }
        }
        if(this.props.user){

        }
        else{
            if(item.selectedColor){
                maxQty = parseInt(item.selectedColor.quantity) > 10 ? 10 : parseInt(item.selectedColor.quantity);
            }
            if(this.state.selectedSubOption){
                maxQty = parseInt(item.selectedSubOption.quantity) > 10 ? 10 : parseInt(item.selectedSubOption.quantity);
            }
        }

       
        if (this.state.errorQuantityItems.length > 0 && this.state.errorQuantityItems.includes(item.cart_id)) {
            quantityError = true
        }
        return !isOutOfStock ? (
            <View>
                <View style={styles.quantityContainer}>
                    <Label color={Color.TEXT_DARK}
                           me={10}
                           xsmall>
                        {`${this.props.localeStrings.quantity} :`}
                    </Label>
                    <ModalDropdown options={new Array(maxQty).fill(0).map((item, idx) => `${idx + 1}`)}
                                   style={[
                                       styles.quantityBtn,
                                       quantityError ? {borderColor: Color.ERROR} : null
                                   ]}
                                   dropdownStyle={styles.quantityDropdown}
                                   dropdownTextStyle={{marginStart: 5}}
                                   onSelect={(index, value) => this.onChangeQuantity(index, value, item)}>
                        <View style={styles.quantityBtnMain}>
                            <Label xsmall
                                   ms={10}
                                   color={Color.TEXT_DARK}>
                                {item.quantity}
                            </Label>
                            <Icon name={"dropdown_arrow"}
                                  style={{marginEnd: 10}}
                                  size={ThemeUtils.fontXSmall}
                                  color={Color.TEXT_DARK}
                            />
                        </View>
                    </ModalDropdown>
                </View>
                {/* <View style={styles.quantityContainer}>
                    <Label color={Color.TEXT_DARK}
                           xsmall>
                        {`${this.props.localeStrings.quantityPrice} : `}
                    </Label>
                    <Label small
                           ms={5}
                           nunito_bold
                           bolder={IS_IOS}
                           color={Color.TEXT_DARK}>
                        {this.getQuantityPrice(item)}
                    </Label>
                </View> */}
            </View>
        ) : null
    };

    renderItems = (index, item) => {

        console.log('render item',item)
        let isOutOfStock = this.checkOutOfStock(item);
        // if(!item.product_id){
        //     return null
        // }
        return (
            <View style={styles.itemMainContainer}>
                <TouchableOpacity style={styles.itemTopMain}
                                  onPress={() => this.onClickCartItem(item)}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}>
                    <View style={styles.itemLeftDetail}>
                        <View style={styles.cartImgContainer}>
                            <Image
                                source={{uri: this.getImage(item)}}
                                style={[styles.cartImg,
                                    isOutOfStock ? {opacity: 0.5} : null]}
                            />
                        </View>
                    </View>
                    <View style={styles.itemRightDetail}>
                        <View style={styles.cartProductName}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_medium>
                                {item.name}
                            </Label>
                        </View>
                        <View style={styles.cartPrice}>
                            <Label
                                color={item.special || parseFloat(item?.discount_available) > 0  ? Color.ERROR : Color.TEXT_DARK}
                                nunito_bold
                                bolder={IS_IOS}
                                xsmall
                                me={5}>
                                {item.special || parseFloat(item?.discount_available) > 0 ? `SR ${numberWithCommas(item.price)}`  :`SR ${numberWithCommas(item.price)}` }
                            </Label>
                            {item.special &&
                            <Label color={Color.TEXT_LIGHT}
                                   me={5}
                                   ms={5}
                                   xsmall
                                   nunito_bold
                                   bolder={IS_IOS}
                                   style={{textDecorationLine: 'line-through'}}>
                                {item.special}
                            </Label>
                            }
                            {item.special || parseFloat(item.discount_available) > 0 ?
                            <View style={styles.cartDiscountView}>
                                <Label color={Color.WHITE}
                                       nunito_medium
                                       xsmall>
                                    {I18nManager.isRTL ?
                                        `${this.props.localeStrings.off} %${item.percentage || parseFloat(item?.discount_available)}` :
                                        `${item.percentage || parseFloat(item?.discount_available)}% ${this.props.localeStrings.off}`}
                                </Label>
                            </View> : null
                            }
                        </View>
                        {this.renderLessStockLabel(item)}
                        {this.renderOptionsSection(item)}
                        {this.renderQuantitySection(item)}
                    </View>
                </TouchableOpacity>
                <View style={styles.itemBottomMain}>
                    <TouchableOpacity style={styles.itemButton}
                                      activeOpacity={0.7}
                                      underlayColor={Color.TRANSPARENT}
                                      onPress={() => this.onClickRemove(item)}>
                        <Icon name={"delete"}
                              style={{marginVertical: 15}}
                              size={ThemeUtils.fontXSmall}
                              color={Color.TEXT_DARK}/>
                        <Label color={Color.TEXT_DARK}
                               xsmall
                               mt={15}
                               mb={15}
                               ms={10}>
                            {this.props.localeStrings.remove}
                        </Label>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.itemButton}
                                      activeOpacity={0.7}
                                      underlayColor={Color.TRANSPARENT}
                                      onPress={() => this.onClickMoveToWish(item)}>
                        <Icon name={"wishlist_fill"}
                              style={{marginVertical: 15}}
                              size={ThemeUtils.fontXSmall}
                              color={Color.TEXT_DARK}/>
                        <Label color={Color.TEXT_DARK}
                               xsmall
                               mt={15}
                               mb={15}
                               ms={10}>
                            {this.props.localeStrings.moveToWishList}
                        </Label>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };

    renderBottomSection = () => {
        let cartTotalAmt = numberWithCommas(this.getCartTotal());
        let {label, tot_items} = this.getCartItemLabel();
        let isCheckoutDisabled = this.state.errorQuantityItems.length > 0;
        return tot_items > 0 ? (
            <View style={styles.bottomSection} pointerEvents={"box-none"}>
                <View style={styles.bottomStart}>
                    <Label xsmall
                           nunito_medium
                           color={Color.PRIMARY}>{label}</Label>
                    <Label color={Color.TEXT_DARK}
                           nunito_bold
                           bolder={IS_IOS}>
                        {I18nManager.isRTL ?
                            `SR ${cartTotalAmt} ${' : '} ${this.props.localeStrings.cartTotal}` :
                            `${this.props.localeStrings.cartTotal} ${': SR'} ${cartTotalAmt}`}
                    </Label>
                </View>
                <View style={styles.bottomEnd}>
                    <RoundButton backgroundColor={isCheckoutDisabled ? Color.TEXT_DARK : Color.PRIMARY}
                                 disabled={isCheckoutDisabled}
                                 textColor={Color.WHITE}
                                 btn_sm
                                 border_radius={5}
                                 width={ThemeUtils.relativeWidth(38)}
                                 click={this.onClickCheckout}>
                        {this.props.localeStrings.checkOut}
                    </RoundButton>
                </View>
            </View>
        ) : null
    };

    renderChangeOptPopup = () => {
        return (
            <ProductOptionPopUp showPopup={this.state.showChangeOptionPopUp}
                                showLoader={this.state.changeOptLoader}
                                productDetail={this.state.changeOptProductDetail}
                                localeStrings={this.props.localeStrings}
                                onClickApply={this.onClickChangeOptApply}
                                onClosePopUp={() => {
                                    this.setState({
                                        showChangeOptionPopUp: false,
                                        changeOptLoader: false,
                                        changeOptProductDetail: null
                                    })
                                }}/>
        )
    };


    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation,
            title = navigation.getParam("cartTitle", Strings.navMyCart);

        // let title = cartCount > 0 ? `${Strings.navMyCart} (${cartCount})` : `${Strings.navMyCart}`;

        return {
            title,
            header: (props) => <CustomNavigationHeader {...props}
                                                       titleCenter={true}
                                                       showRightButton={false}
                                                       showLeftButton={state.routeName !== Routes.Cart}
                                                       isMainTitle={false}/>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            cart: [],
            product_path:'',
            errorQuantityItems: [],
            showChangeOptionPopUp: false,
            changeOptLoader: false,
            isLoaderVisible: true,
            mainLoader: false,
            changedCartItem: null,
            changeOptProductDetail: null,
            changeLocalProductIdx: null,
            freeShipping: {
                amtVal: 50,
                amtLabel: 'SR 50'
            },
            infoHtml: []
        };
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.cart !== this.props.cart) {
            this.setState({cart: this.props.cart}, () => {
                this.setCartHeader();
            });
        }
    }

    render() {
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <NavigationEvents
                    onDidFocus={this.handleRedirectToScreen}
                />
                <Spinner visible={this.state.mainLoader}/>
                <View style={styles.container}>
                    <FlatList
                        data={this.state.cart}
                        extraData={this.state}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isLoaderVisible}
                                onRefresh={this.getCart}
                            />}
                        renderItem={
                            ({index, item}) => this.renderItems(index, item)
                        }
                        ListHeaderComponent={this.renderListHeader()}
                        ListEmptyComponent={this.renderEmptyView}
                        contentContainerStyle={this.emptyListStyle()}
                    />
                    {this.renderBottomSection()}
                    {this.renderChangeOptPopup()}
                </View>
            </SafeAreaView>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        removeFromCart: (product) => dispatch(Action.removeFromCart(product)),
        setCartCount: (count) => dispatch(Action.setCartCount(count)),
        addToWishlist: (product) => dispatch(Action.addToWishlist(product)),
        updateInCart: (product) => dispatch(Action.updateInCart(product)),
        setWishlistCount: (count) => dispatch(Action.setWishlistCount(count)),
        updateOptionInCart: (product) => dispatch(Action.updateOptionInCart(product)),
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        appConfig: state.appConfig,
        cart: state.cart,
        cartCount: state.cartCount,
        wishlist: state.wishlist,
        localeStrings: state.localeStrings,
        langCode: state.langCode

    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Cart)

import {
    SET_USER,
    SET_TOKEN,
    SET_LANGUAGE,
    SET_SHOW_POPUP,
    SET_SHOW_SEARCH,
    SET_TIMER_VALUE,
    SET_LOCAL_STRINGS,
    SET_APP_CONFIG,
    SET_APP_CONFIG_SYN_TIME,
    SET_OPTIONAL_UPDATE_TIME,
    SET_FCM_TOKEN,
    ADD_RECENT_PRODUCT,
    SET_WISHLIST_COUNT,
    ADD_TO_CART,
    REMOVE_FROM_CART,
    ADD_TO_WISHLIST,
    SET_CART_COUNT,
    UPDATE_IN_CART,
    UPDATE_OPTION_IN_CART,
    SET_OPEN_NOTIF,
    SET_OPEN_LINK,
    PROMO_TIME
} from "./action-types";
import {REHYDRATE} from 'redux-persist/src/constants';
import {Constants, deepCompare} from "src/utils";

let initial = {
    user: null,
    token: null,
    langCode: Constants.API_LANGUAGES.AR,
    showSupportPopUp: false,
    isSearchVisible: false,
    timerValue: 0,
    localeStrings: null,
    synTime: 0,
    appConfig: null,
    optionalUpdateTime: null,
    fcmToken: null,
    recentProducts: [],
    wishlistCount: 0,
    cart: [],
    wishlist: [],
    cartCount: 0,
    notificationID: null,
    deeplinkUrl: null,
    prevLangCode: Constants.API_LANGUAGES.EN,
    promoTime: null,
};

const reducer = (state = initial, action) => {
    switch (action.type) {

        case SET_USER:
            return Object.assign({}, state, {user: action.user});
        case SET_TOKEN:
            return Object.assign({}, state, {token: action.token});
        case PROMO_TIME:
                return Object.assign({}, state, {promoTime: action.promoTime});
        case SET_FCM_TOKEN:
            return Object.assign({}, state, {fcmToken: action.fcmToken});

        case SET_LANGUAGE:
            return Object.assign({}, state, {
                langCode: action.langCode,
                prevLangCode: state.langCode});

        case SET_LOCAL_STRINGS:
            return Object.assign({}, state, {localeStrings: action.localeStrings});
        case SET_SHOW_POPUP:
            return Object.assign({}, state, {showSupportPopUp: action.showSupportPopUp});
        case SET_SHOW_SEARCH:
            return Object.assign({}, state, {isSearchVisible: action.isSearchVisible});
        case SET_TIMER_VALUE:
            return Object.assign({}, state, {timerValue: action.timerValue});
        case SET_APP_CONFIG:
            return Object.assign({}, state, {appConfig: action.appConfig});
        case SET_APP_CONFIG_SYN_TIME:
            return Object.assign({}, state, {synTime: action.synTime});
        case SET_OPTIONAL_UPDATE_TIME:
            return Object.assign({}, state, {optionalUpdateTime: action.optionalUpdateTime});
        case SET_OPEN_NOTIF:
            return Object.assign({}, state, {notificationID: action.notificationID});
        case SET_OPEN_LINK:
            return Object.assign({}, state, {deeplinkUrl: action.deeplinkUrl});

        case ADD_RECENT_PRODUCT:
            if (!state.recentProducts.find((product) => product && product.id === action.product.id)) {
                let newState = state.recentProducts.slice();
                newState.push(action.product);
                if (newState.length > 16) {
                    newState.shift();
                }
                return Object.assign({}, state, {recentProducts: newState});
            }
            return state;

        case SET_WISHLIST_COUNT:
            return Object.assign({}, state, {wishlistCount: action.wishlistCount});

        case ADD_TO_WISHLIST:
            let wishlist_found = state.wishlist.find((product) => product.id === action.product.id),
                newWishlist = state.wishlist.slice();
            if (!wishlist_found) {
                //Product not in list, add with wishlist true
                newWishlist.push({...action.product, wishlist: true});
            } else {
                //Product not in list, remove
                newWishlist = newWishlist.filter(product => product.id !== action.product.id)
            }
            return Object.assign({}, state, {wishlist: newWishlist});

        case ADD_TO_CART: {
            let foundProductIdx = state.cart.findIndex((product) => {
                console.log('cart product',product)
                console.log('my product',action.product)

                    let found = false;
                    if (product.id === action.product.id) {
                        found = true
                        if (product?.selectedSubOption && action.product?.selectedSubOption) {
                            if(product?.selectedSubOption.id === action.product?.selectedSubOption.id){
                                found = true
                            }
                            else{
                                found = false
                            }
                          //  found = deepCompare(product.selectedOptions, action.product.selectedOptions)
                        } else if (product?.selectedColor && action.product?.selectedColor) {
                            if(product?.selectedColor?.id === action.product?.selectedColor?.id){
                                found = true
                            }
                            else{
                                found = false
                            }
                        }
                    }
                    return found
                }),
                newCart = state.cart.slice();

            if (foundProductIdx === -1) {
                //Add new product with quantity 1
                newCart.push({
                    local_id: new Date().getTime(),
                    ...action.product
                });
            } else {
                //Increment product quantity by 1 if action from ProductCard
                if (action.product.type === 'increment_local') {
                    let {type, ...rest} = state.cart[foundProductIdx];
                    let maxQuantity = action.product.qty
                    if(action.product.selectedColor){
                        maxQuantity = parseInt(action.product.selectedColor.quantity);
                    }
                    if(action.product.selectedSubOption){
                        maxQuantity = parseInt(action.product.selectedSubOption.quantity);
                    }
                    const totalQ = parseInt(state.cart[foundProductIdx].quantity) + action.product.quantity

                    const replace = maxQuantity === totalQ ? maxQuantity : maxQuantity < totalQ ? maxQuantity : totalQ


                    newCart.splice(foundProductIdx, 1, {
                        ...rest,
                        quantity: replace
                    });
                } else {
                    let {type, ...rest} = action.product;
                    newCart.splice(foundProductIdx, 1, {
                        ...rest,
                    });
                }
            }
            return Object.assign({}, state, {cart: newCart});
        }

        case UPDATE_IN_CART: {
            let cartProductIdx = state.cart.findIndex((product) => product.local_id === action.product.local_id),
                updateCart = state.cart.slice();

            if (cartProductIdx !== -1) {
                //Update product
                updateCart.splice(cartProductIdx, 1, {
                    ...action.product,
                    type: null,
                });
            }
            return Object.assign({}, state, {cart: updateCart});
        }

        case UPDATE_OPTION_IN_CART: {
            let foundItemIdx = state.cart.findIndex((product) => product.local_id === action.product.local_id),
                newCart = state.cart.slice();

            if (foundItemIdx !== -1) {
                let similarItemIdx = newCart.findIndex((product, index) => {
                    let found = false;

                    if (
                        index !== foundItemIdx &&       //ignore self item
                        product.id === action.product.id        //same product
                    ) {
                        //check if any cart item has same options
                        if (product.selectedOptions && action.product.selectedOptions) {
                            console.log('before compare, existing::', product.selectedOptions);
                            console.log('new::', action.product.selectedOptions);

                            found = deepCompare(product.selectedOptions, action.product.selectedOptions)
                        } else if (
                            (!product.options || product.options.length <= 0) &&
                            (!action.product.options || action.product.options.length <= 0)) {
                            found = true
                        }
                    }
                    return found
                });

                if (similarItemIdx === -1) {

                    // no similar item, so just update the given item
                    newCart.splice(similarItemIdx, 1, {
                        ...action.product,
                    });

                } else {
                    //First replace similar item at its own index
                    newCart.splice(similarItemIdx, 1, {
                        ...action.product,
                        quantity:
                            parseInt(state.cart[similarItemIdx].quantity) +
                            parseInt(action.product.quantity)
                    });

                    //Remove the found item from array
                    newCart.splice(foundItemIdx, 1);

                }
            }
            return Object.assign({}, state, {cart: newCart});
        }

        case REMOVE_FROM_CART:
            let productIdx = state.cart.findIndex((product) => product.local_id === action.product.local_id),
                cart = state.cart.slice();
            if (productIdx !== -1) {
                //If found product at index, remove elem from index
                cart.splice(productIdx, 1);
                return Object.assign({}, state, {cart: cart});
            }
            return state;

        case SET_CART_COUNT:
            return Object.assign({}, state, {cartCount: action.cartCount});

        case REHYDRATE:
            return {...state, ...action.payload};
        default:
            return state;
    }
};

export default reducer;

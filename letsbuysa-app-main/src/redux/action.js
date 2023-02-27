import {
    SET_TOKEN,
    SET_USER,
    SET_LANGUAGE,
    SET_TIMER_VALUE,
    SET_SHOW_POPUP,
    SET_SHOW_SEARCH,
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
import {Constants} from "src/utils";

let initialState = {
    user: null,
    token: null,
    showSupportPopUp: false,
    isSearchVisible: false,
    timerValue: 0,
    fcmToken: null,
    recentProducts: [],
    wishlistCount: 0,
    cart: [],
    wishlist: [],
    cartCount: 0,
    notificationID: null,
    deeplinkUrl: null,
    promoTime: null,
};

const setToken = (token) => ({type: SET_TOKEN, token});
const setPromoTime = (promoTime) => ({type: PROMO_TIME, promoTime});

const setUser = (user) => ({type: SET_USER, user});
const logout = () => ({type: REHYDRATE, payload: initialState});
const setLanguageCode = (langCode) => ({type: SET_LANGUAGE, langCode});
const setStrings = (localeStrings) => ({type: SET_LOCAL_STRINGS, localeStrings});
const setShowPopUp = (showSupportPopUp) => ({type: SET_SHOW_POPUP, showSupportPopUp});
const setShowSearch = (isSearchVisible) => ({type: SET_SHOW_SEARCH, isSearchVisible});
const setTimerValue = (timerValue) => ({type: SET_TIMER_VALUE, timerValue});
const setAppConfig = (appConfig) => ({type: SET_APP_CONFIG, appConfig});
const setAppConfigSynTime = (synTime) => ({type: SET_APP_CONFIG_SYN_TIME, synTime});
const setOptionalUpdateTime = (optionalUpdateTime) => ({type: SET_OPTIONAL_UPDATE_TIME, optionalUpdateTime});
const setFCMToken = (fcmToken) => ({type: SET_FCM_TOKEN, fcmToken});
const addRecentProduct = (product) => ({type: ADD_RECENT_PRODUCT, product});
const setWishlistCount = (wishlistCount) => ({type: SET_WISHLIST_COUNT, wishlistCount});
const addToCart = (product) => ({type: ADD_TO_CART, product});
const removeFromCart = (product) => ({type: REMOVE_FROM_CART, product});
const addToWishlist = (product) => ({type: ADD_TO_WISHLIST, product});
const setCartCount = (cartCount) => ({type: SET_CART_COUNT, cartCount});
const updateInCart = (product) => ({type: UPDATE_IN_CART, product});
const updateOptionInCart = (product) => ({type: UPDATE_OPTION_IN_CART, product});
const setOpenedNotif = (notifID) => ({type: SET_OPEN_NOTIF, notificationID: notifID});
const setOpenedURL = (deeplinkUrl) => ({type: SET_OPEN_LINK, deeplinkUrl});

export default {
    setToken,
    setUser,
    logout,
    setLanguageCode,
    setShowPopUp,
    setTimerValue,
    setStrings,
    setAppConfig,
    setAppConfigSynTime,
    setOptionalUpdateTime,
    setFCMToken,
    setShowSearch,
    addRecentProduct,
    setWishlistCount,
    addToCart,
    removeFromCart,
    addToWishlist,
    setCartCount,
    updateInCart,
    updateOptionInCart,
    setOpenedNotif,
    setOpenedURL,
    setPromoTime
};

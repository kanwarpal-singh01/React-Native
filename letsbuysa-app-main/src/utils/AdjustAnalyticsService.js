import {Adjust, AdjustEvent} from "react-native-adjust";
import Constants from "./Constants";

const addToCartEvent = () => {
    let cartEvent = new AdjustEvent(Constants.ADJUST_TRACKING.ADD_TO_CART);
    Adjust.trackEvent(cartEvent);
};

const addToWishlistEvent = () => {
    let wishlistEvent = new AdjustEvent(Constants.ADJUST_TRACKING.ADD_TO_WISHLIST);
    Adjust.trackEvent(wishlistEvent);
};

const buyNowEvent = () => {
    let buyNowEvent = new AdjustEvent(Constants.ADJUST_TRACKING.BUY_NOW);
    Adjust.trackEvent(buyNowEvent);
};

const checkoutEvent = () => {
    let checkout = new AdjustEvent(Constants.ADJUST_TRACKING.CHECKOUT);
    Adjust.trackEvent(checkout);
};

const confirmEvent = () => {
    let confirm = new AdjustEvent(Constants.ADJUST_TRACKING.CONFIRM);
    Adjust.trackEvent(confirm);
};

const revenueEvent = (amount) => {
    let revenueEarned = new AdjustEvent(Constants.ADJUST_TRACKING.REVENUE);
    revenueEarned.setRevenue(amount, "SAR");
    Adjust.trackEvent(revenueEarned);
};

export default {
    addToCartEvent,
    addToWishlistEvent,
    buyNowEvent,
    checkoutEvent,
    confirmEvent,
    revenueEvent
}

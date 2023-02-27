import {APIRequest} from './api-request';

export const API_LOGIN = 1;
export const API_SIGNUP = 2;
export const API_COUNTRY = 3;
export const API_VERIFY_CODE = 4;
export const API_FORGOT_PASSWORD = 5;
export const API_RESEND_OTP = 6;
export const API_GET_CATEGORIES = 7;
export const API_HOME_PAGE = 8;
export const API_VERIFY_MOBILE_CODE = 9;
export const API_LOGOUT = 10;
export const API_APP_CONFIG = 11;
export const API_CHANGE_NUMBER = 12;
export const API_GET_PRODUCTS = 13;
export const API_GET_PRODUCT_DETAIL = 14;
export const API_GET_WISHLIST = 15;
export const API_ADD_WISHLIST = 16;
export const API_VERIFY_FORGOT_CODE = 17;
export const API_CHANGE_FORGOT_PSWD = 18;
export const API_ADD_REVIEW = 19;
export const API_GET_ALL_REVIEWS = 20;
export const API_GET_ADDRESS = 21;
export const API_GET_COUNTRY = 22;
export const API_GET_STATES = 23;
export const API_DELETE_ADDRESS = 24;
export const API_GET_FILTERS = 25;
export const API_ADDRESS_UPDATE = 26;
export const API_ADD_ADDRESS = 27;
export const API_ADD_TO_CART = 28;
export const API_GET_CART = 29;
export const API_REMOVE_FROM_CART = 30;
export const API_MOVE_TO_WISHLIST = 31;
export const API_VERIFY_ADDRESS = 32;
export const API_VERIFY_ADDRESS_CODE = 33;
export const API_CHANGE_PSWD = 34;
export const API_UPDATE_PROFILE = 35;
export const API_SOCIAL_LOGIN = 36;
export const API_SOCIAL_REGISTER = 37;
export const API_CHECKOUT_CART = 38;
export const API_GET_ABOUT_INFO = 39;
export const API_APPLY_COUPON_CODE = 40;
export const API_APPLY_GIFT_CODE = 41;
export const API_GET_ORDERS = 42;
export const API_GET_ORDER_STATUS = 43;
export const API_GET_ORDER_DETAIL = 44;
export const API_ORDER_CANCEL = 45;
export const API_CHANGE_NOTIF_SETTINGS = 46;
export const API_GET_NOTIFICATIONS = 47;
export const API_GET_TRACKING_DETAILS = 48;
export const API_RETURN_ORDER = 49;
export const API_RETURN_ORDER_DETAIL = 50;
export const API_PAYMENT_STATUS = 51;
export const API_Wallet_STATUS = 52;
export const API_Wallet_Recharge_STATUS = 53;
export const API_Wallet_Recharge_Callback_STATUS = 54;
export const API_Voucher_STATUS = 55;
export const API_Brands_STATUS = 56;
export const API_Remove_checkout_STATUS = 57;
export const API_Move_checkout_STATUS = 58;
export const API_Remove_coupen_STATUS = 59;
export const API_Wallet_Apple_STATUS = 60;
export const API_CheckOut_Product_Check_STATUS = 61;
export const API_CheckOut_Apple_Pay_STATUS = 62;
export const API_CheckOutID_Apple_Pay = 63;
export const API_Wellet_CheckOutID_Apple_Pay = 64;






export const ApiURL = {
  signIn: '/login',  //
  signUp: '/register', //
  forgotPassword: '/forget', //
  verifyCode: '/otp_verify', //
  resendOTP: '/resend', //
  changeNumber: '/change_number', //
  verifyForgotCode: '/changepassword/verify', //
  changeForgotPassword: '/changepassword/update', //
  changePassword: '/changepassword', //
  logout: '/logout', //
  socialLogin: '/social/login', //
  socialRegister: '/social/register', //
  updateProfile: '/profile_update', //
  changeNotifSettings: '/profile_notification', //
  appConfig: '/appconfig', //
  getCategories: '/category', //
  homePage: '/home',
  getProducts: '/product', //
  getProductDetail: '/product/detail', //
  getWishlist: '/wishlist', //
  addToWishlist: '/wishlist/add', //
  addReview: '/product_review_add', //
  getAllReviews: '/product/review', 
  getAddress: '/address', //
  getCountries: '/country', //
  states: '/state', //
  getProductFilters: '/product/filter', 
  deleteAddressRequest: '/address/delete', //
  updateAddressRequest: '/address/update',
  addAddress: '/address/add', //
  addressVerify: '/address/send/code', //
  verifyAddressCode: '/address/verify/code', //
  addToCart: '/cart/add', //
  getCart: '/cart', //
  removeFromCart: '/cart/remove', //
  moveToWishlist: '/cart/movewishlist', //
  checkoutCart: '/checkout',
  checkoutNew: '/checkout/hyperpay',
  getAboutInfo: '/information',
  applyCoupon: '/coupon',
  applyGiftCode: '/voucher',
  getOrders: '/order', //
  getOrderStatus: '/order_status', //
  getOrderDetail: '/order/detail',
  orderCancel: '/ordercancel',
  getNotifications: '/notification', //
  getTrackingDetail: '/order/track',
  orderReturn: '/orderreturn/request',
  getReturnOrderDetail: 'orderreturn/detail',
  getPaymentStatus: 'ordercallback',
  wallet:'wallet',
  walletRecharg:'wallet/recharge',
  walletRechargeCallBack:'rechargecallback',
  voucher:'voucher',
  brands:'brands',
  removeProductCheckOut:'remove/product/checkout',
  moveProductCheckout:'movetowislit/product/checkout',
  removeCoupen:'remove_coupon',
  walletApple:'checkout/wallet/payment',
  productCheck:'check/product/availability',
  checkOutApplePay:'checkout/payment',
  checkOutIDApplePay:'checkout/apple-pay',

  checkWelletOutIDApplePay:'checkout/wallet/apple-pay',

  walletCheckOut:"get-wallet-url"



};

export {APIRequest};

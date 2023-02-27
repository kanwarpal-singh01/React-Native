// internal app notifications key
import {Platform} from "react-native";
import FB_LOGO from 'src/assets/images/logo_assets/fb_logo.png';
import GOOGLE_LOGO from 'src/assets/images/logo_assets/google_logo.png';
import TWITTER_LOGO from 'src/assets/images/logo_assets/logo_twitter.png';
import INSTA_LOGO from 'src/assets/images/logo_assets/logo_insta.png';

const notificationKey = {
    LOGOUT: 'LOGOUT',
};

const Permissions = {
    PHOTO: 'photo',
    CAMERA: 'camera',
    LOCATION: 'location',
    MICROPHONE: 'microphone',
    CONTACTS: 'contacts',
    EVENTS: 'event',
    STORAGE: 'storage',
    PHONE_CALL: 'callPhone',
    READ_SMS: 'readSms',
    RECEIVE_SMS: 'receiveSms',

    //support only IOS
    MOTION: 'motion',
    MEDIA_LIBRARY: 'mediaLibrary',
    SPEECH_RECOGNITAION: 'speechRecognition',
    PUSH_NOTIFICATION: 'notification',

    //Android Permission
    READ_EXTERNAL_STORAGE: 'READ_EXTERNAL_STORAGE',
    WRITE_EXTERNAL_STORAGE: 'WRITE_EXTERNAL_STORAGE'
};

// api response codes
const ResponseCode = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    UNPROCESSABLE_REQUEST: 422,
    INTERNAL_SERVER_ERROR: 500,
    TOKEN_INVALID: 503,
    NO_INTERNET: 522,
    BAD_GATEWAY: 502,
};

//social login
const SocialLoginProvider = {
    FACEBOOK: 1,
    GOOGLE: 2,
    APPLE:3,
};

const GoogleDev = {
    iosClientId: '',
    webClientId: '123662298510-1p7ncjoihlr5qkrn1heo5sp3v10gv03h.apps.googleusercontent.com',
    android_API_KEY: 'AIzaSyBA3UR9-5Xwd3GhYqSvzYmStcJObewGSp4',
    ios_API_KEY: 'AIzaSyBO8Cl_w1VJ6lWMsU0KGk1FIyzm02wnWEs'
};

const GoogleProd = {
    iosClientId: '',
    webClientId: '843400075916-c5nhm4nnob1ngu0obkmmtiv1n6d5floa.apps.googleusercontent.com',
    android_API_KEY: 'AIzaSyCxB9R6jmSDbp06_oddbzX67y8dmzqDd9Y',
    ios_API_KEY: 'AIzaSyBDX5Y_Py4PM-NoWCEPH1O-RUVp6hTfoyc'
};

const API_KEY = "mNjM1q47TAv8WOtFFGwwAWgM9JfL1hHUCx65vL4AJCN0NBJMPxoH3J2zaSjw4r6IFrz4HRjxMhJXY6snDlusfSrhnAX1YyHCMydKOUUBgggM1iy2ihMqzX2H8aGPSaRE5aATXt91j1srn6kbKVKeNmoCFfPt7n24jfxv5Hr4RXZ67C2kNXIbXSCB8EWw02UScXYr3kz8iO5obf8r82J4lcXy4vYN4XbXgOOOCVlge48IJ24xMJ7QK1UgoUp6L9RN";

const FontStyle = {
    bold: Platform.OS === 'ios' ? "NunitoSans-Bold" : "NunitoSans-Bold",
    regular: Platform.OS === 'ios' ? "NunitoSans-Regular" : "NunitoSans-Regular",
    medium: Platform.OS === 'ios' ? "NunitoSans-SemiBold" : "NunitoSans-SemiBold"
};


const PhilosopherFont = {
    regular: Platform.OS === 'ios' ? "ExpletusSans" : "ExpletusSans-Regular"
};

const OpenSansFont= {
    regular:'OpenSans-Regular',
    bold:'OpenSans-Bold',
    semibold: 'OpenSans-SemiBold',
}

const ArabicFont = {
    regular: Platform.OS === 'ios' ? "MCS Taif S_U normal." : "MCS Taif S_U normal."
};


const VerifyCodeType = {
    ADDRESS_MOBILE: 1,
    MOBILE_NUMBER: 2,
    MOBILE_NUMBER_WITH_SEND_OTP: 3,
    MOBILE_NUMBER_WITH_SEND_OTP_PROFILE: 4,
    MOBILE_NUMBER_OTP_CHANGE_NUMBER: 5,
    CHANGE_MOBILE_WITHOUT_AREA_CODE: 6,

};

const API_CONFIG = {
    // BASE_URL: "https://letsbuysa.com",
    // BASE_URL: "http://192.168.1.172/letsbuy",
  // BASE_URL: "http://letsbuy.devtechnosys.tech",
    // BASE_URL: "https://newletsbuy.devtechnosys.info",

//    BASE_URL: "https://newletsbuy.devtechnosys.info",
    BASE_URL: "https://letsbuysa.com",

    // http://newletsbuy.devtechnosys.tech/api/register

    //http://192.168.1.79/letsbuy
    //local : http://192.168.1.82/letsbuy
    //development url : https://lts.webmobtech.biz
    //live url :https://letsbuysa.com

  // BASE_ROUTE: "/index.php?route=restapi"
     BASE_ROUTE: "/api"

};

const API_LANGUAGES = {
    EN: "3",
    AR: "2"
};

const HOME_SECTIONS = [
    {
        id: "hotToday",
        title: "Special Offers"
    },
    {
        id: "newArrivals",
        title: "New Arrivals"
    },
    {
        id: "trending",
        title: "Trending"
    },
    {
        id: "bestsellers",
        title: "Best Sellers"
    },
];

const RESEND_CODE_TIMER = 30;
const CountryCode = "966";
const AppUpdateAlertShowHours = 0; // This contant used to show Option app update alert to user once in 12 hours if new version available
const IOS_APP_STORE_URL = "https://apps.apple.com/us/app/لتس-باي-lets-buy/id1414208279";
const ANDROID_APP_STORE_URL = "https://play.google.com/store/apps/details?id=com.lets.buyapk";
const SA_FLAG_ICON = "data:image/png;base64,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";
const EN_FLAG_ICON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAeCAMAAABpA6zvAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAj1QTFRF4bm96r/B6b/B3a6y5bO15bK1wltjyF1j8unr+vDx+vDwyHB2z3J31ZSZ3JicGS9dJTplITdjGjBdKDxnHjNhGzFfKT1oHzZjQjJXtzxFvT1EGjBedYKdXWyNFStaIDVih5OrRFV7FCpZLkJsjpmvdYKeGC5cWmyNQDFWuD5Hvj9GM0dwRlh9NEdwOEtzLEBqTF2BLUFrOUx0M0dvPVB2KT9pTFJ1HDJfeIWgFy1bJjpmhI+oNklxFi1bS12BY3KRFixbUmOF9/f5////aHaUVGSGIjdjPlF3Gi9dfYqkU2SGaHeVUGKFSk5ySlt/PlB3MkZvMUVuKz9qV2eJKz9pO093QDFVtjpCvDpBFSxbgo6nUWKEEilYJjtmj5qwOUxzEihYFCtaa3mXFCxbRDpfRFZ7KDxoJzxnXW2NKT5pYXCQQFJ5UF6BTl+DHjNgcH6aO051HjRhYnGQS1yAUGCD9fT1/vv8/vv7Fy1cfYmjT1+DiZSsZ3aUFS1cRkBkO011M0ZvMERtQVN5QlR6LEBrQ1V7Ok10N0pyL0VvQTBVtTc/uzc+coCcW2qLhJCpLkJri5atc4CcWGmLR0drHzRhITZiaXiWRVd8c4GdIDZiWGiKJTpmPE92YG+PL0NtKj5pJztnIDZjTlh76c/S8dbX8dXXdoOfXm2NiZWsEylZL0JskJuxd4SfFy5cW22OQDNXukZOwUZNwEZNJDllPVB3P1F4MkdwSzxfu0ZOzdLczNHbzdHbzNDb1tPb8NXXWNrergAAAA90Uk5T/v7+/v7+/v7+/v7+/v7+6a2FXwAAAAFiS0dEQ2fQDWIAAAAJcEhZcwAAAEgAAABIAEbJaz4AAAITSURBVDjLY+AXEOQXEhbhFxUT5RcRFuIXFODnFxCXkJRCAwzSMrJy8gqKSsoqykqKCvJysqpqaqrqGppaaICBX1tZR1dP38DQyNBAX09XR9nYxMTY1IyBkQkVMPDzm1sYWFpZ29jaWFtZ2lmYq9nbqzk4OjmjAQZpF1dpNwt3D0NPQw93CzdpL29zc28fX2YWVlTAwO/nryzmFRAYFBwUGOAlpuzvFxLiFxoWHoEGGPgjpaOiY2Lj4hPi42JjoqOkE5OS5JJT2NjRAIOQY2paeoZNpn6WfqZNRnpaqmNsrGN2DgcnFypg4M/KzXPLLyjUV9UvLMh3y8stKiwsKi4pLStHBQz8FaKVVYmx1XpKetWxiVWVog41Nba1ddw8aICBv77Bv7HJsLmltaXZsKnRv6Gtvb2to7OrGw0w8Pf0ysn3NSf2T+hPbO6Tl+udqKY2cdJkXj40wMA/Zeq06XnpM7TztGek502fNjNv1qxCaSwBzp8+e9YcMeG58+bPmyssNmfW7AXFxQsWLlq8ZCkqYOBftlxJfkXqylWrV61MXSGvtHzN2rVr1q3fsHETKmAQMNLdHLtFefP8rfM3K2+J3axrJCBgtG37DgyFO3ft2rlz1+6dO/fs3LkbxATjvfuWolvtTCRg4CMSMHQTCRh4iAQM5UQCBi4iAQM7kYAhgkjAwEokID7AmYgEDFpEAgYpIgEA2hc6qEvsr/QAAAAldEVYdGRhdGU6Y3JlYXRlADIwMTMtMTAtMDdUMTM6MTU6MTUrMDI6MDDoZk8yAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDEzLTEwLTA3VDEzOjE1OjE1KzAyOjAwmTv3jgAAAABJRU5ErkJggg==";
const FREE_SHIPPING_AMT = 300;
const FREE_SHIPPING_URL = "https://lts-buy.com/الشحن-والتوصيل";
const THUMB_PLACEHOLDER = `http://localhost/letsbuy/image/cache/placeholder-200x200.png`;

const SOCIAL_LINKS = [
    // {
    //     id: 'facebook',
    //     image: FB_LOGO,
    //     dummyLink: "https://www.facebook.com"
    // },
    {
        id: 'google',
        image: GOOGLE_LOGO,
        dummyLink: "https://www.google.com"
    },
    {
        id: 'twitter',
        image: TWITTER_LOGO,
        link: "https://www.twitter.com"
    },
    {
        id: 'instagram',
        image: INSTA_LOGO,
        link: "https://www.instagram.com"
    }
];

const SORT_OPTIONS = [
    {
        id: 0,
        label: 'Default',
        sort_val: '',
        order_val: 'asc'
    },
    {
        id: 1,
        label: 'Name (A - Z)',
        sort_val: 'name',
        order_val: 'asc'
    },
    {
        id: 2,
        label: 'Name (Z - A)',
        sort_val: 'name',
        order_val: 'desc'
    },
    {
        id: 3,
        label: 'Price (Low & High)',
        sort_val: 'price',
        order_val: 'asc'
    },
    {
        id: 4,
        label: 'Price (High & Low)',
        sort_val: 'price',
        order_val: 'desc'
    },
    {
        id: 5,
        label: 'Rating (Highest)',
        sort_val: 'rating',
        order_val: 'desc'
    },
    {
        id: 6,
        label: 'Rating (Lowest)',
        sort_val: 'rating',
        order_val: 'ASC'
    },
    // {
    //     id: 7,
    //     label: 'Model (A - Z)',
    //     sort_val: 'p.model',
    //     order_val: 'ASC'
    // },
    // {
    //     id: 8,
    //     label: 'Model (Z - A)',
    //     sort_val: 'p.model',
    //     order_val: 'DESC'
    // }
];

const NEW_ARRIV_DEFAULT_SORT = {
    id: 9,
    label: 'New Arrival',
    sort_val: '',
    order_val: 'DESC'
};

const ImageUtils = {
    WIDTH: 300,
    HEIGHT: 300,
    COMPRESS_IMG_MAX_WIDTH: 640,
    COMPRESS_IMG_MAX_HEIGHT: 480,
    COMPRESS_IMG_QUALITY: 0.5,
    COMPRESS_VID_PRESET: 'MediumQuality',
    MEDIA_TYPE: 'photo',
    MAX_IMG_NUM: 5

};

const GoogleSearchRestriction = {
    country: 'SA',
    radius: 50000,
};

const locationConfigWatchIOS = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    distanceFilter: 50
};

const locationConfigWatchAndroid = {
    enableHighAccuracy: true, //TODO change to false on build for android only, for iOS set it true always
    timeout: 10000,
    maximumAge: 0,
    distanceFilter: 10
};

const locationFetchInterval = 1000;
const locationFetchTapAgainInterval = 5000;

const NOTIFICATION_TYPES = {
    ORDER: "1",
    PRODUCT: "2",
    RETURN_ORDER: "3",
    CART: "4"
};

const OrderTypeReturn = 'returned';

const letsBuyContactNumber = `+966558300102`;
const letsBuyContactEmail = `letsbuyfeedback@gmail.com`;

const APP_EVENTS = {
    RETURN_SUCCESS: 'return_order_success',
    ORDER_DETAIL_UPDATE: 'order_detail_update'
};

const URL_REMOVE_REGEX = /http:\/\/localhost\/letsbuy|http:\/\/127.0.0.1\/letsbuy|http:\/\/www.lts-buy.com|http:\/\/lts-buy.com|https:\/\/lts.webmobtech.biz/gi;

const ADJUST_TRACKING = {
    APP_TOKEN: "9x8zb7ibo54w",
    ADD_TO_CART: "4awvhb",
    ADD_TO_WISHLIST: "twnq9z",
    BUY_NOW: "58xm68",
    CHECKOUT: "s6ztwi",
    CONFIRM: "9xukq9",
    REVENUE: "z71u9g"
};

export default {
    notificationKey,
    ResponseCode,
    Permissions,
    SocialLoginProvider,
    GoogleDev,
    GoogleProd,
    API_KEY,
    FontStyle,
    API_CONFIG,
    VerifyCodeType,
    RESEND_CODE_TIMER,
    PhilosopherFont,
    OpenSansFont,
    ArabicFont,
    API_LANGUAGES,
    HOME_SECTIONS,
    CountryCode,
    SOCIAL_LINKS,
    AppUpdateAlertShowHours,
    IOS_APP_STORE_URL,
    ANDROID_APP_STORE_URL,
    SORT_OPTIONS,
    NEW_ARRIV_DEFAULT_SORT,
    SA_FLAG_ICON,
    ImageUtils,
    EN_FLAG_ICON,
    FREE_SHIPPING_AMT,
    FREE_SHIPPING_URL,
    GoogleSearchRestriction,
    locationConfigWatchIOS,
    locationConfigWatchAndroid,
    locationFetchTapAgainInterval,
    locationFetchInterval,
    NOTIFICATION_TYPES,
    letsBuyContactNumber,
    letsBuyContactEmail,
    OrderTypeReturn,
    APP_EVENTS,
    THUMB_PLACEHOLDER,
    URL_REMOVE_REGEX,
    ADJUST_TRACKING
}

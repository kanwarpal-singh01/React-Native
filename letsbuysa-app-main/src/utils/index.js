import {Platform, Linking} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {Color} from 'src/utils/Color';
import DateUtils from 'src/utils/DateUtils';
import Messages from 'src/utils/MessageUtils';
import Constants from 'src/utils/Constants';
import CommonStyle from 'src/utils/CommonStyles';
import ThemeUtils from 'src/utils/ThemeUtils';
import Strings from 'src/utils/strings';
import {validation, PasswordValidate} from 'src/utils/ValidationUtils';
import UtilityManager from 'src/utils/UtilityManager';
import SnackBarManager from 'src/utils/SnackBarManager';
import AdjustAnalyticsService from './AdjustAnalyticsService';

import fontelloConfig from '../../config.json';
import {createIconSetFromFontello} from 'react-native-vector-icons';
import {store} from 'src/redux/store';

const {
    Version,
    OS,
} = Platform;

export const IS_ANDROID = OS === 'android';
export const IS_IOS = OS === 'ios';
export const IS_LT_LOLLIPOP = Version < 21;


// use for check internet connection
/*export const isNetworkConnected = () => {
    if (Platform.OS === 'ios') {
        return new Promise(resolve => {
            const handleFirstConnectivityChangeIOS = isConnected => {
                NetInfo.isConnected.removeEventListener('change', handleFirstConnectivityChangeIOS);
                resolve(isConnected);
            };
            NetInfo.isConnected.addEventListener('change', handleFirstConnectivityChangeIOS);
        });
    }

    return NetInfo.isConnected.fetch();

};*/
const isNetworkConnected = async () => {
    let state = await NetInfo.fetch();
    /*console.log("Connection type", state.type);
    console.log("Is connected?", state.isConnected);*/
    return state.isConnected;
};
const Icon = createIconSetFromFontello(fontelloConfig);

const showErrorSnackBar = (message) => {
    let Snackbar = SnackBarManager.getSnackBar();
    let strings = store.getState().localeStrings ? store.getState().localeStrings : Strings;
    setTimeout(() => {
        Snackbar.alertWithType('error', strings.error, message, null, 800);
    }, 100);
};

const showSuccessSnackBar = (message) => {
    let Snackbar = SnackBarManager.getSnackBar();
    let strings = store.getState().localeStrings ? store.getState().localeStrings : Strings;
    setTimeout(() => {
        Snackbar.alertWithType('success', strings.success, message, null, 800);
    }, 100);
};

const showInfoSnackBar = (title, message, timeOut = 3000) => {
    let Snackbar = SnackBarManager.getSnackBar();
    setTimeout(() => {
        Snackbar.alertWithType('info', title, message, null, timeOut);
    }, 100);
};


const isCorrectType = (expected, actual) => {
    return Object.prototype.toString.call(actual).slice(8, -1) === expected;
};

const getValidArgumentsFromArray = function (array, type) {
    let validValues = [];
    array.forEach(function (value) {
        if (isCorrectType(type, value)) {
            validValues.push(value);
        }
    });

    return validValues;
};

const sendEmail = function (to, cc, bcc, subject, body, successCall, failCall) {
    let url = 'mailto:';
    let argLength = arguments.length;

    switch (argLength) {
        case 0:
            openLinkInBrowser(url);
            return;
        case 7:
            break;
        default:
            console.log('you must supply either 0 or 7 arguments. You supplied ' + argLength);
            return;
    }

    // we use this Boolean to keep track of when we add a new parameter to the querystring
    // it helps us know when we need to add & to separate parameters
    let valueAdded = false;

    if (isCorrectType('Array', arguments[0])) {
        let validAddresses = getValidArgumentsFromArray(arguments[0], 'String');

        if (validAddresses.length > 0) {
            url += encodeURIComponent(validAddresses.join(','));
        }
    }

    url += '?';

    if (isCorrectType('Array', arguments[1])) {
        let validAddresses = getValidArgumentsFromArray(arguments[1], 'String');

        if (validAddresses.length > 0) {
            valueAdded = true;
            url += 'cc=' + encodeURIComponent(validAddresses.join(','));
        }
    }

    if (isCorrectType('Array', arguments[2])) {
        if (valueAdded) {
            url += '&';
        }

        let validAddresses = getValidArgumentsFromArray(arguments[2], 'String');

        if (validAddresses.length > 0) {
            valueAdded = true;
            url += 'bcc=' + encodeURIComponent(validAddresses.join(','));
        }
    }

    if (isCorrectType('String', arguments[3])) {
        if (valueAdded) {
            url += '&';
        }

        valueAdded = true;
        url += 'subject=' + encodeURIComponent(arguments[3]);
    }

    if (isCorrectType('String', arguments[4])) {
        if (valueAdded) {
            url += '&';
        }

        url += 'body=' + encodeURIComponent(arguments[4]);
    }

    openLinkInBrowser(url);
};

const openLinkInBrowser = (link) => {
    let strings = store.getState().localeStrings ? store.getState().localeStrings : Strings;
    Linking.canOpenURL(link).then(supported => {
        if (supported) {
            Linking.openURL(link);
        } else {
            showInfoSnackBar(strings.information, strings.linkUnableToOpen);
        }
    }).catch(err => console.log('Error to open website', err));
};

const extractForgotCode = (link) => {
    link = link.replace(Constants.URL_REMOVE_REGEX, Constants.API_CONFIG.BASE_URL);
    let URLToDetect =
        Constants.API_CONFIG.BASE_URL +
        Constants.API_CONFIG.BASE_ROUTE.replace('restapi', '') +
        'account/reset&code';
    if (link.indexOf(URLToDetect) !== -1) {
        let i = link.indexOf('code=');
        let txt_length = 5;             //this is length of string "code="
        return link.substr(i + txt_length, link.length);
    }
    return null;
};

const extractProductSlug = (link) => {
    link = link.replace(Constants.URL_REMOVE_REGEX, Constants.API_CONFIG.BASE_URL);
    let URLToDetect = Constants.API_CONFIG.BASE_URL;
    if (link.indexOf(URLToDetect) !== -1) {
        let code = link.substr(URLToDetect.length, link.length);
        try {
            console.log('Slug Product code', code.split('?'), code);
            return code.split('?')[0];
        } catch (e) {
            return code;
        }
    }
    return null;
};

const decodeImageUrl = (val) => {
    let url = val ? val : Constants.THUMB_PLACEHOLDER;
    if (url && typeof url === 'string') {
        let thumb_url = url.replace(Constants.URL_REMOVE_REGEX, Constants.API_CONFIG.BASE_URL);
        return decodeURI(thumb_url);
    }
    return '';
};

const validateGeocodeAddress = (object) => {
    /*if ('address_line_1' in object && 'city' in object && 'country' in object) {
        return true
    }
    return false*/
    return true;
};

const handleReverseGeocodeAddress = (arrAddress) => {

    console.log('address will be formatted',arrAddress)
    for (let index in arrAddress) {

        let object = arrAddress[index];
        let showAddress = [];
        let formatedAdd = null
        let addressData = {};

        if(object.formattedAddress && !formatedAdd){
            formatedAdd = object.formattedAddress
        }

        if (object.country) {
            addressData['country'] = object.country;
        }

        if (object.locality) {
            addressData['city'] = object.locality;
        }

        if (object.adminArea && object.locality) {
            addressData['state'] = object.adminArea;
        } else if (object.adminArea) {
            addressData['city'] = object.adminArea;
        }

        if (object.streetName) {
            if (object.streetNumber) {
                addressData['address_line_2'] = object.streetNumber;
                showAddress.push(`${object.streetName},${object.streetNumber}`);
            } else {
                showAddress.push(object.streetName);
            }
            addressData['address_line_1'] = object.streetName;

            if (object.subLocality) {

                if (object.adminArea && object.adminArea !== object.subLocality) {
                    addressData['address_line_3'] = object.subLocality;
                }
            }
        } else if (object.subLocality) {
            addressData['address_line_1'] = object.subLocality;
            showAddress.push((object.subLocality));
        }

        if (object.subAdminArea) {
            if (!addressData['address_line_1']) {
                addressData['address_line_1'] = object.subAdminArea;
                showAddress.push(object.subAdminArea);
            } else if (!addressData['address_line_3']) {
                addressData['address_line_3'] = object.subAdminArea;
            }
        }

        if (object.postalCode) {
            addressData['pin_code'] = object.postalCode;
        }

        if (object.position) {
            addressData['latitude'] = object.position.lat;
            addressData['longitude'] = object.position.lng;
        }
        console.log(addressData);
        if (validateGeocodeAddress(addressData)) {
            console.log('Found Valide Address');
            return { fullAddress :formatedAdd, formatedAddress: showAddress.join(', '), searchAddressData: addressData};
        }
    }
    return undefined;
};

const isHexValid = (val) => {
    if (!val) {
        return false;
    }
    return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(val);
};


const deepCompare = (x, y) => {
    let p, q, val = false;

    for (p in x) {
        if (x.hasOwnProperty(p) !== y.hasOwnProperty(p)) {
            return false;
        } else if (typeof x[p] !== typeof y[p]) {
            return false;
        }
    }

    for (p in y) {
        if (x.hasOwnProperty(p) !== y.hasOwnProperty(p)) {
            return false;
        } else if (typeof x[p] !== typeof y[p]) {
            return false;
        }
    }

    for (p in x) {
        for (q in y) {
            if (x[p] !== y[p]) {
                val = false;
                break;
            }
            val = true;
        }
        if (val === false) {
            return val;
        }
    }

    return val;
};

const capitalizeLetters = (string) => {
    let words = string.split(' '),
        newString = '';
    for (let i = 0; i < words.length; i++) {
        if (words[i] && words[i] !== ' ') {
            newString += words[i].charAt(0).toUpperCase() + words[i].substr(1).toLowerCase() + ' ';
        }
    }
    return newString;
};

const numberWithCommas = (x) => {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const findLastIndex = (array, searchKey, searchValue) => {
    let index = array.slice().reverse().findIndex(x => x[searchKey] === searchValue);
    let count = array.length - 1;
    let finalIndex = index >= 0 ? count - index : index;
    console.log(finalIndex);
    return finalIndex;
};

export {
    Color,
    DateUtils,
    Messages,
    Constants,
    CommonStyle,
    ThemeUtils,
    Strings,
    UtilityManager,
    validation,
    PasswordValidate,
    isNetworkConnected,
    Icon,
    showErrorSnackBar,
    showSuccessSnackBar,
    showInfoSnackBar,
    SnackBarManager,
    openLinkInBrowser,
    extractForgotCode,
    decodeImageUrl,
    handleReverseGeocodeAddress,
    isHexValid,
    deepCompare,
    extractProductSlug,
    capitalizeLetters,
    numberWithCommas,
    findLastIndex,
    sendEmail,
    AdjustAnalyticsService,
};

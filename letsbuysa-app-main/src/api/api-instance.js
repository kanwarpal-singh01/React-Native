import axios from 'axios';
import {store} from 'src/redux/store';
import {
    DeviceEventEmitter,
} from 'react-native';
import Action from "src/redux/action";
import {Constants} from "src/utils";


let axiosInstance = axios.create({
    baseURL: Constants.API_CONFIG.BASE_URL + Constants.API_CONFIG.BASE_ROUTE,
    timeout: 15000
});
store.subscribe(listener);

// add default token in authenticate apis
function listener() {
    if (store.getState() !== undefined) {
        axiosInstance.defaults.headers.common['Accept'] = `application/x-www-form-urlencoded`;
        axiosInstance.defaults.headers.common['language'] = `${store.getState().langCode}`;
       // store.getState().token ? axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${store.getState().token}` : null;
    }
}

// return request config or request error
axiosInstance.interceptors.request.use(
    async (config) => {
        console.log('request config', config);
        return config;
    },
    error => Promise.reject(error)
);

const responseHandler = (response) => {
    console.log("raw response 1 :: ", response);
    if (response.data && response.data.error !== null && response.data.error !== undefined) {
        
        return errorHandler(response.data);
    }

    let dataResponse = {
        status: response.status,
        meta: response.meta !== undefined ? response.meta : null,
        data: response.data !== undefined ? response.data : null,
        pagination: response.data.pagination !== undefined ? response.data.pagination : null
    };
    return Promise.resolve(dataResponse);
};

const errorHandler = (error) => {
    console.log("raw error :: ", error);
    console.log("raw error2 :: ", error.message);
    let errorResponse = {
        status: error !== undefined ? error.status : Constants.ResponseCode.INTERNAL_SERVER_ERROR,
        meta: error.error && error.error.message !== undefined ? {message: error.error.message} : undefined,
        data: error.error && error.error.data !== undefined ? error.error.data : undefined,
    };

    console.log("error :: ", errorResponse);
    switch (errorResponse.status) {
        case Constants.ResponseCode.NOT_FOUND:
            // showSnackBar(errorResponse.meta !== undefined ? errorResponse.meta.message : "Sorry, Not Found");
            break;
        case Constants.ResponseCode.BAD_GATEWAY:
            // showSnackBar(errorResponse.meta !== undefined ? errorResponse.meta.message : "Something went wrong.Please try again.");
            break;
        case Constants.ResponseCode.INTERNAL_SERVER_ERROR:
            // showSnackBar(errorResponse.meta !== undefined ? errorResponse.meta.message : "Server Error. Please try again.");
            break;
        case Constants.ResponseCode.TOKEN_INVALID:
            store.dispatch(Action.logout());
            DeviceEventEmitter.emit(Constants.notificationKey.LOGOUT, {});
            // showSnackBar(errorResponse.meta !== undefined ? errorResponse.meta.message : "Server Error. Please try again.");
            break;
    }
    return Promise.reject(errorResponse);
};

// user axios interceptors for change response and error as we want
axiosInstance.interceptors.response.use(responseHandler, errorHandler);

export {
    axiosInstance
};
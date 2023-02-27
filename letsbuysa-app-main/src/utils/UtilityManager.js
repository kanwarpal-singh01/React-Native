import React from 'react';
import {
    Platform,
    NativeModules
} from 'react-native';

const IOSNativeUtility = NativeModules.IOSUtility;


export default class UtilityManager{

    static instance = null;

    _statusBarHeight = 24;

    /**
     * @returns {UtilityManager}
     */
    static getInstance() {
        if (UtilityManager.instance === null) {
            UtilityManager.instance = new UtilityManager();
        }
        return this.instance;
    }

    async setiOSStatusBarHeight() {

        if(Platform.OS==='ios'){
           await IOSNativeUtility.getStatusBarHeight((error,item) => {
                if(error){
                    console.log('Error :',error);
                }
                else{
                    this._statusBarHeight = parseInt(item);
                }
            });
        }
        else{
            this._statusBarHeight = 24;
        }
    };

    setStatusBarHeight(height){
       this._statusBarHeight = height;
    }

    getStatusBarHeight = () => {
        return this._statusBarHeight
    }
}

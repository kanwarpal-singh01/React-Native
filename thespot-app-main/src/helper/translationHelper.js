import i18n from "i18n-js";
import memoize from "lodash.memoize";
import * as RNLocalize from "react-native-localize";
import { I18nManager } from 'react-native';
import en from '../translations/en.json';
import ar from '../translations/ar.json'
import AsyncStorage from '@react-native-async-storage/async-storage';
const translationGetters = {
    // lazy requires (metro bundler does not support symlinks)
    ar: () => require("../translations/ar.json"),
    en: () => require("../translations/en.json"),
};

export const translate = memoize(
    (key, config) => i18n.t(key, config),
    (key, config) => (config ? key + JSON.stringify(config) : key)
);

export const setI18nConfig = (customLanguage = null) => {
    console.log(customLanguage,"2321");
    // fallback if no available language fits
    const fallback = { languageTag: "en", isRTL: false };

    // const { languageTag, isRTL } =
    //     customLanguage ? customLanguage : RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) ||
    //         fallback;

    const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(translationGetters)) || fallback;

    // clear translation cache
    translate.cache.clear();
    // update layout direction
    I18nManager.forceRTL(isRTL);
    // set i18n-js config
    i18n.translations = { en, ar };
    i18n.locale = customLanguage.languageTag;
};
export const changeLanguage = async lang => {
    setI18nConfig(lang);
    
     AsyncStorage.setItem('language', lang.languageTag);
  };
  export const isRTL = () => {
    return translate('lang') === 'ar' ? true : false;
  };
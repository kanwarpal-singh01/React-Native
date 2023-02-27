import React from 'react';
import {
    View,
    Image,
    ImageBackground,
    Alert,
    AppState, Linking,
    NativeModules,
    I18nManager
} from 'react-native';
import {connect} from 'react-redux';
import {NavigationActions, StackActions} from "react-navigation";
import Splash from 'react-native-splash-screen';

//Utility
import {styles} from "./styles";
import Routes from "src/router/routes";
import {
    CommonStyle,
    Color,
    Strings,
    IS_IOS,
    Constants,
    UtilityManager,
    ThemeUtils,
    openLinkInBrowser, IS_ANDROID
} from "src/utils";
import {API_APP_CONFIG, APIRequest, ApiURL} from "src/api";
import Action from "src/redux/action";

//third party
import DeviceInfo from "react-native-device-info";
import moment from 'moment';
import firebase from "react-native-firebase";
import {Notification, NotificationOpen} from "react-native-firebase";
import LocalizedStrings from "react-native-localization";
import RNRestart from "react-native-restart";

//Custom component
import {Label} from "src/component";

//Resources
import Logo from 'src/assets/images/Splash_Logo.png';
import BG_Image from 'src/assets/images/1242x2208.png';
import WMTLogo from 'src/assets/images/WMT_Logo.png';


const appUpdateType = {
    optional: 1,
    force: 2
};

class SplashScreen extends React.Component {

    //Server request
    appConfigRequest = () => {
        if (this._ismounted) {
            let param = {
                "device_type": IS_IOS ? 'ios' : 'android',
                "version": DeviceInfo.getVersion()
            };

            new APIRequest.Builder()
                .post()
                .setReqId(API_APP_CONFIG)
                .reqURL(ApiURL.appConfig)
                .formData(param)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        }
    };

    onResponse = (response, reqId) => {
        console.log(reqId);
        switch (reqId) {
            case API_APP_CONFIG:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        this.props.setSynTime(new Date());
                        if (response.data) {
                            if (response.data.server_manage && response.data.server_manage.key_status === 1) {
                                this.alertForMaintenance();
                            } else {
                                this.props.setAppConfig(response.data);
                                if (response.data &&
                                    Array.isArray(response.data.languages) &&
                                    response.data.languages.length > 0) {

                                    let languageConfig = {};
                                    response.data.languages.map(lang => {
                                        languageConfig[lang.code] = {...lang.translations}
                                    });

                                    this.props.setStrings(new LocalizedStrings(languageConfig));
                                    if (this.props.langCode !== null) {
                                        let selectedLang = response.data.languages.find(lang => lang.language_id === this.props.langCode);

                                        if (selectedLang && this.props.localeStrings) {
                                            this.props.localeStrings.setLanguage(selectedLang.code);
                                            console.log("We will not change the language",selectedLang.code);

                                            // Changed by devtechnosys (6 Nov, 2020) to set the default language to arabic when app open for first time. Also changed the inital state in reducers to arabic
                                            if(selectedLang.code === 'ar' && !I18nManager.isRTL){
                                                console.log("We will not change the language");
                                                I18nManager.forceRTL(true);
                                                setTimeout(() => {
                                                    RNRestart.Restart();
                                                }, 100)
                                            }
                                        } else {
                                            this.props.localeStrings.setLanguage('en-gb');
                                        }
                                    }
                                }
                                this.checkAppUpdateAvailable(response.data)
                            }
                        }
                        break;
                    default:
                        break
                }
                break;
            default:
                break;
        }
    };

    onError = (error, reqId) => {
        console.log(error);
        console.log(error.message);
        this.setState({showSplash: true}, () => {
            Splash.hide();

            let message = this.getString("internalServerError");

            if (error.meta && error.meta.message) {
                message = error.meta.message
            }

            Alert.alert(
                this.getString("appName"),
                message,
                [
                    {
                        text: this.getString("retry"), onPress: () => {
                            this.appConfigRequest();
                        }
                    }
                ],
                {
                    cancelable: false
                }
            );
        })
    };


    //navigate to authenticated route
    resetToAuth = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({routeName: Routes.Authenticated}),
        ]
    });

    //navigate to verify code
    resetToVerify = StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.VerifyCode,
                params: {
                    type: Constants.VerifyCodeType.MOBILE_NUMBER
                }
            }),
        ]
    });

    //go to change pswd screen
    resetToChangePswd = () => StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.ChangePswdDeepLink,
                params: {
                    forgotLink: this.state.isOpenedFromUrl
                }
            }),
        ]
    });

    /*resetToProductDetail = () => StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.ProductDetail,
                params: {
                    productSlugLink: this.state.isOpenedFromUrl
                }
            }),
        ]
    });
*/
    resetToMain = StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({routeName: Routes.MainRoute}),
        ]
    });

    resetToOrderDetail = (notificationData) => StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.OrderDetailNotif,
                params: {
                    orderData: {order_id: notificationData.order_id},
                    fromSplash: true
                }
            }),
        ]
    });

    resetToReturnOrders = (notificationData) => StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.ReturnOrderList,
                params: {
                    currentOrderType: {
                        key: '7',
                        type: Constants.OrderTypeReturn
                    },
                    fromRoute: null
                }
            }),
        ]
    });

    resetToProductDetail = (notificationData) => StackActions.reset({
        index: 0,
        key: undefined,
        actions: [
            NavigationActions.navigate({
                routeName: Routes.ProductDetailNotif,
                params: {
                    productData: {product_id: notificationData.product_id},
                    fromSplash: true
                }
            }),
        ]
    });

    //Utility
    handleOpenNotification = (notificationData) => {
        firebase.notifications().removeAllDeliveredNotifications();
        switch (notificationData.type) {
            case 'order':
                if (notificationData.order_id) {
                    this.props.navigation.dispatch(this.resetToOrderDetail(notificationData));
                }
                break;
            case 'return_order':
                if (notificationData.order_id) {
                    this.props.navigation.dispatch(this.resetToReturnOrders(notificationData));
                }
                break;
            case 'product':
                if (notificationData.product_id) {
                    this.props.navigation.dispatch(this.resetToProductDetail(notificationData));
                }
                break;
            case 'cart':
                this.props.navigation.dispatch(StackActions.push({
                    routeName: Routes.CartNotif,
                    params: {
                        fromSplash: false,
                    }
                }));
                break;
        }
    };

    checkInitialNotification = async () => {
        const notificationOpen: NotificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen && this.props.user) {
            // App was opened by a notification
            // Get the action triggered by the notification being opened
            const action = notificationOpen.action;
            // Get information about the notification that was opened
            const notification: Notification = notificationOpen.notification;
            /*console.log(notification.notificationId);
            console.log(this.props.notificationID);*/

            if (notification &&
                notification.data &&
                this.props.notificationID !== notification.notificationId) {
                this.props.setOpenedNotif(notification.notificationId);
                this.handleOpenNotification(notification.data);
                return true;
            }
        }
        return false
    };

    getString = (stringName) => {
        if (this.props.localeStrings && this.props.localeStrings[stringName])
            return this.props.localeStrings[stringName];
        return Strings[stringName]
    };

    appDataCheck = () => {
        if (this.props.synTime) {
            let currentTime = moment(new Date());
            let lastTime = moment(this.props.synTime);

            let duration = moment.duration(currentTime.diff(lastTime));
            let hours = duration.asHours();
            if (hours > 0) {
                this.appConfigRequest();
            } else {
                this.redirectToApp();
            }
        } else {
            this.appConfigRequest();
        }
    };

    checkAppUpdateAvailable = (data) => {
        if (data.appVersion && data.appVersion.forceUpdate !== null && data.appVersion.forceUpdate !== undefined && data.appVersion.forceUpdate) {
            this.currentUpdateType = appUpdateType.force;
            this.appVertionData = data.appVersion;
        } else if (data.appVersion && data.appVersion.recommendedUpdate !== null && data.appVersion.recommendedUpdate !== undefined && data.appVersion.recommendedUpdate) {
            this.appVertionData = data.appVersion;
            if (this.props.optionalUpdateTime) {
                let currentTime = moment(new Date());
                let lastTime = moment(this.props.optionalUpdateTime);

                let duration = moment.duration(currentTime.diff(lastTime));
                let hours = duration.asHours();
                if (hours > Constants.AppUpdateAlertShowHours) {
                    this.props.setOptionalUpdateTime(new Date());
                    this.currentUpdateType = appUpdateType.optional
                }
            } else {
                this.props.setOptionalUpdateTime(new Date());
                this.currentUpdateType = appUpdateType.optional
            }
        }

        if (this.currentUpdateType === null) {
            this.redirectToApp();
        } else {
            Splash.hide();
            this.displayAlertForUpdate()
        }
    };

    redirectToApp = () => {
        setTimeout(() => {
            Splash.hide();
        }, IS_IOS ? 0 : 200);
        let instance = UtilityManager.getInstance();
        instance.setiOSStatusBarHeight();
        setTimeout(async () => {
            if (this.props.user && this.props.user.telephone_status === "not_verified") {
                this.props.navigation.dispatch(this.resetToVerify);
            } else {
                let isRedirect = await this.checkInitialNotification();
                if (!isRedirect) {
                    if (this.state.isOpenedFromUrl &&
                        (IS_IOS || this.state.prevOpenedUrl !== this.state.isOpenedFromUrl)) {
                        IS_ANDROID && NativeModules.GetDeeplink.setOpenedUrl(this.state.isOpenedFromUrl);
                        let URLToDetect =
                            Constants.API_CONFIG.BASE_URL +
                            Constants.API_CONFIG.BASE_ROUTE.replace('restapi', '') +
                            'account/reset&code',

                            URLToDismiss = Constants.API_CONFIG.BASE_URL +
                                Constants.API_CONFIG.BASE_ROUTE.replace('restapi', ''),

                            action = null,
                            isForgot = false;

                        if (this.state.isOpenedFromUrl.indexOf(URLToDetect) !== -1) {
                            action = StackActions.reset({
                                index: 0,
                                key: undefined,
                                actions: [
                                    NavigationActions.navigate({
                                        routeName: Routes.ChangePswdDeepLink,
                                        params: {
                                            forgotLink: this.state.isOpenedFromUrl
                                        }
                                    }),
                                ]
                            });
                            isForgot = true;

                        } else if (this.state.isOpenedFromUrl.indexOf(URLToDismiss) !== -1) {
                            action = null;
                            isForgot = false;
                        } else if (
                            this.state.isOpenedFromUrl.indexOf(Constants.API_CONFIG.BASE_URL) !== -1 &&
                            this.state.isOpenedFromUrl !== Constants.API_CONFIG.BASE_URL) {
                            action = StackActions.reset({
                                index: 0,
                                key: undefined,
                                actions: [
                                    NavigationActions.navigate({
                                        routeName: Routes.ProductDetailDeeplink,
                                        params: {
                                            productSlugLink: this.state.isOpenedFromUrl
                                        }
                                    }),
                                ]
                            });
                            isForgot = false;
                        }
                        if (action) {
                            if (isForgot) {
                                if (!this.props.user) {
                                    this.props.navigation.dispatch(action);
                                } else {
                                    this.props.navigation.dispatch(this.resetToMain);
                                }
                            } else {
                                this.props.navigation.dispatch(action);
                            }
                        } else {
                            this.props.navigation.dispatch(this.resetToMain);
                        }

                    } else {
                        this.props.navigation.dispatch(this.resetToMain);
                    }
                }
            }
        }, IS_IOS ? 1000 : 0);
    };

    displayAlertForUpdate = () => {
        let title = this.appVertionData && this.appVertionData.title ? this.appVertionData.title : this.getString("updateAvailable");
        let message = this.appVertionData && this.appVertionData.message ? this.appVertionData.message : this.getString("updateMessage");

        if (this.currentUpdateType === appUpdateType.force) {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: this.getString("download"), onPress: () => {
                            this.addAppStateEventLister(true);
                            openLinkInBrowser(IS_IOS ? Constants.IOS_APP_STORE_URL : Constants.ANDROID_APP_STORE_URL)
                        }
                    },
                ], {
                    cancelable: false
                }
            );
        } else if (this.currentUpdateType === appUpdateType.optional) {
            Alert.alert(
                title,
                message,
                [
                    {
                        text: this.getString("download"), onPress: () => {
                            openLinkInBrowser(IS_IOS ? Constants.IOS_APP_STORE_URL : Constants.ANDROID_APP_STORE_URL);
                            this.redirectToApp();
                        }
                    },
                    {
                        text: this.getString("remindLater"), onPress: () => {
                            this.redirectToApp();
                        }
                    },
                ], {
                    cancelable: false
                }
            );
        }
    };

    alertForMaintenance = () => {
        let message = this.getString("maintenanceMessage");
        Alert.alert(
            '',
            message,
            [], {
                cancelable: false
            }
        );


    };

    addAppStateEventLister = (isAdd) => {
        if (isAdd) {
            AppState.addEventListener('change', this.handleAppStateChagneEvent);
        } else {
            AppState.removeEventListener('change', this.handleAppStateChagneEvent);
        }
    };

    handleAppStateChagneEvent = (nextAppState) => {
        if (nextAppState === "active" && this.currentUpdateType && this.currentUpdateType === appUpdateType.force) {
            this.displayAlertForUpdate();
            this.addAppStateEventLister(false);
        }
    };

    //Lifecycle
    constructor(props) {
        super(props);
        this.state = {
            showSplash: IS_IOS,
            isOpenedFromUrl: null,
            prevOpenedUrl: ""
        };
        this.currentUpdateType = null;
        this.appVertionData = null;
        this._ismounted = false;
    }

    componentDidMount() {
        this._ismounted = true;
        Linking.getInitialURL().then((url) => {
            if (url) {
                if (url.indexOf('https') === -1) {
                    url = url.replace('http', 'https');
                }

                this.setState({isOpenedFromUrl: url})
            }
        }).catch(err => console.log('An error occurred', err));

        !IS_IOS && this.appDataCheck();
        if (IS_ANDROID) {
            NativeModules.GetDeeplink.getOpenedUrl((url) => {
                if (url) {
                    this.setState({prevOpenedUrl: url})
                }
            })
        }
    }

    componentWillUnmount() {
        this._ismounted = false;
    }

    render() {
        return this.state.showSplash ? (
            <View style={[CommonStyle.container, {
                backgroundColor: Color.TRANSPARENT,
            }]}>
                <ImageBackground
                    source={BG_Image}
                    style={{flex: 1}}
                    onLoadEnd={() => {
                        Splash.hide();
                        this.appDataCheck();
                    }}>
                    {/* <View style={[CommonStyle.content_center, {marginTop: 150}]}>
                        <Image source={Logo}
                               style={styles.logo}/>
                        <Label color={Color.WHITE}
                               mt={15}
                               philosopher
                               style={{fontSize: 40}}>
                            {Strings.appName}
                        </Label>
                    </View> */}
                    <View style={styles.bottomContainer}>
                        {/*<View style={styles.wmtContainer}>
                            <Image source={WMTLogo}
                                   style={styles.wmtLogo}
                                   resizeMode={'contain'}
                            />
                        </View>*/}
                        {/* <View style={[CommonStyle.content_center, styles.tagContainer]}>
                            <Label color={Color.WHITE}
                                   style={{fontSize: 16}}>
                                {Strings.tagLine}
                            </Label>
                        </View> */}
                    </View>
                </ImageBackground>
            </View>
        ) : null
    }
}

//set store values as props
const mapStateToProps = (state) => {
    return {
        user: state.user,
        token: state.token,
        synTime: state.synTime,
        optionalUpdateTime: state.optionalUpdateTime,
        localeStrings: state.localeStrings,
        langCode: state.langCode,
        notificationID: state.notificationID,
        deeplinkUrl: state.deeplinkUrl,
        prevLangCode: state.prevLangCode
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        setAppConfig: (appConfig) => dispatch(Action.setAppConfig(appConfig)),
        setSynTime: (synTime) => dispatch(Action.setAppConfigSynTime(synTime)),
        setOptionalUpdateTime: (time) => dispatch(Action.setOptionalUpdateTime(time)),
        setFCMToken: (fcmToken) => dispatch(Action.setFCMToken(fcmToken)),
        setLanguageCode: (code) => dispatch(Action.setLanguageCode(code)),
        setStrings: (localeStrings) => dispatch(Action.setStrings(localeStrings)),
        setOpenedNotif: (notifId) => dispatch(Action.setOpenedNotif(notifId)),
        setOpenedURL: (deeplink) => dispatch(Action.setOpenedURL(deeplink))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SplashScreen);

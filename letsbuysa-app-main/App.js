import React, {Component} from 'react';
import {StatusBar, View, Linking, NativeModules} from 'react-native';
import {Adjust, AdjustConfig} from 'react-native-adjust';
//Third party
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import DropdownAlert from 'react-native-dropdownalert';
import {NavigationActions, StackActions} from 'react-navigation';
import firebase from 'react-native-firebase';
import type {
    Notification,
    NotificationOpen,
} from 'react-native-firebase/notifications';

//Utility
import {RootNavigator} from 'src/router';
import {store, persistor} from 'src/redux/store';
import {Constants, Color, SnackBarManager, IS_IOS, IS_ANDROID} from 'src/utils';
import CustomerSupportPopup from 'src/component/view/CustomerSupportPopUp';
import SearchPopUp from 'src/component/view/SearchPopUp';
import Routes from 'src/router/routes';
import NavigationRefManager from './src/utils/NavigationRefManager';
import Actions from './src/redux/action';



export default class App extends Component {
    //Utility
    _handleOpenURL = event => {
        let link = event.url,
            action = null;
        console.log('Link from normal deeplink==>', link);
        if (link.indexOf('https') === -1) {
            link = link.replace('http', 'https');
        }
        let URLToDetect =
            Constants.API_CONFIG.BASE_URL +
            Constants.API_CONFIG.BASE_ROUTE.replace('restapi', '') +
            'account/reset&code',
            URLToDismiss =
                Constants.API_CONFIG.BASE_URL +
                Constants.API_CONFIG.BASE_ROUTE.replace('restapi', '');

        if (link.indexOf(URLToDetect) !== -1) {
            action = NavigationActions.navigate({
                routeName: Routes.ChangePswdDeepLink,
                params: {
                    forgotLink: link,
                    appState: 'background',
                },
            });
        } else if (link.indexOf(URLToDismiss) !== -1) {
            action = null;
        } else if (
            link.indexOf(Constants.API_CONFIG.BASE_URL) !== -1 &&
            link !== Constants.API_CONFIG.BASE_URL
        ) {
            action = NavigationActions.navigate({
                routeName: Routes.ProductDetail,
                params: {
                    productSlugLink: link,
                    appState: 'background',
                },
            });
        }

        if (action) {
            this.navigationRef && this.navigationRef.dispatch(action);
        }
    };

    handleOpenNotification = notificationData => {
        firebase.notifications().removeAllDeliveredNotifications();
        switch (notificationData.type) {
            case 'order':
                if (
                    notificationData.order_id &&
                    this.navigationRef &&
                    store.getState().user
                ) {
                    this.navigationRef.dispatch(
                        StackActions.push({
                            routeName: Routes.OrderDetailNotif,
                            params: {
                                orderData: {order_id: notificationData.order_id},
                                fromSplash: false,
                            },
                        }),
                    );
                }
                break;
            case 'return_order':
                if (
                    notificationData.order_id &&
                    this.navigationRef &&
                    store.getState().user
                ) {
                    this.navigationRef.dispatch(
                        StackActions.push({
                            routeName: Routes.ReturnOrderList,
                            params: {
                                currentOrderType: {
                                    key: '7',
                                    type: Constants.OrderTypeReturn,
                                },
                                fromRoute: Routes.MainRoute,
                            },
                        }),
                    );
                }
                break;
            case 'product':
                if (
                    notificationData.product_id &&
                    this.navigationRef &&
                    store.getState().user
                ) {
                    this.navigationRef.dispatch(
                        StackActions.push({
                            routeName: Routes.ProductDetailNotif,
                            params: {
                                productData: {product_id: notificationData.product_id},
                                fromSplash: false,
                            },
                        }),
                    );
                }
                break;
            case 'cart':
                if (this.navigationRef && store.getState().user) {
                    this.navigationRef.dispatch(
                        StackActions.push({
                            routeName: Routes.CartNotif,
                            params: {
                                fromSplash: false,
                            },
                        }),
                    );
                }
                break;
        }
    };

    setRefs = navigatorRef => {
        this.navigationRef = navigatorRef;
        NavigationRefManager.setTopLevelNavigator(navigatorRef);
    };

    getToken = async () => {
        let fcmToken = store.getState().fcmToken;
        console.log(fcmToken);
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                store.dispatch(Actions.setFCMToken(fcmToken));
            }
        }
    };

    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    };

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            this.getToken();
        } catch (error) {
            console.log('permission rejected');
            this.getToken();
        }
    };

    createNotificationListeners = async () => {
        firebase.notifications().onNotification(notification => {
            notification.android
                .setChannelId('default_letsbuy_notification')
                .setSound('default');
            notification.android.setSmallIcon('ic_stat_ic_notification');
            notification.android.setAutoCancel(true);
            notification.android.setColor(Color.PRIMARY);
            firebase
                .notifications()
                .displayNotification(notification)
                .catch(err => {
                    console.log(err);
                });
        });

        this.removeNotificationOpenedListener = firebase
            .notifications()
            .onNotificationOpened((notificationOpen: NotificationOpen) => {
                // Get the action triggered by the notification being opened
                const action = notificationOpen.action;
                // Get information about the notification that was opened
                const notification: Notification = notificationOpen.notification;
                if (notification && notification.data) {
                    console.log(notification.data);
                    this.handleOpenNotification(notification.data);
                }
            });
    };

    constructor(props) {
        super(props);
        this.navigationRef = null;
        const adjustConfig = new AdjustConfig(
            Constants.ADJUST_TRACKING.APP_TOKEN,
            AdjustConfig.EnvironmentProduction,
        );
        // adjustConfig.setShouldLaunchDeeplink(true)
        adjustConfig.setDeferredDeeplinkCallbackListener(deepLink => {
            console.log('Deferred deep link URL content: ' + deepLink);
            this._handleOpenURL({url:deepLink})
        });
        adjustConfig.setLogLevel(AdjustConfig.LogLevelVerbose);
        Adjust.create(adjustConfig);
    }

    componentDidMount() {
        setTimeout(
            () => {
                Linking.addEventListener('url', this._handleOpenURL);
            },
            IS_IOS ? 1000 : 0,
        );

        const channel = new firebase.notifications.Android.Channel(
            'default_letsbuy_notification',
            'App notifications',
            firebase.notifications.Android.Importance.Max,
        );

        firebase.notifications().android.createChannel(channel);
        this.checkPermission();
        this.createNotificationListeners();
    }

    componentWillUnmount() {
        Linking.removeEventListener('url', this._handleOpenURL);
        this.removeNotificationOpenedListener();
        IS_ANDROID && NativeModules.GetDeeplink.setOpenedUrl('');
        Adjust.componentWillUnmount();
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <StatusBar
                            barStyle={'light-content'}
                            backgroundColor={Color.BG_COLOR_DARK}
                        />
                        <RootNavigator ref={this.setRefs}/>
                        <CustomerSupportPopup/>
                        <SearchPopUp/>
                    </PersistGate>
                </Provider>
                <DropdownAlert
                    ref={ref => SnackBarManager.setSnackBar(ref)}
                    useNativeDriver={true}
                    titleStyle={{
                        fontFamily: Constants.FontStyle.bold,
                        color: Color.WHITE,
                    }}
                    messageStyle={{
                        fontFamily: Constants.FontStyle.regular,
                        color: Color.WHITE,
                    }}
                    inactiveStatusBarStyle={'light-content'}
                    inactiveStatusBarBackgroundColor={Color.TEXT_DARK}
                />
            </View>
        );
    }
}

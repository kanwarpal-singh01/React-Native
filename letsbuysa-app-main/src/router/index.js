import React from 'react';
import {
    createStackNavigator,
    createAppContainer,
    NavigationActions,
} from 'react-navigation';

import Splash from 'src/screens/SplashScreen';
import VerifyCode from "src/screens/VerifyCode";
import ChangePhoneNumber from "src/screens/ChangePhoneNumber";
import ChangePassword from 'src/screens/ChangePassword';
import ProductDetail from "src/screens/ProductDetail";
import OrderDetail from "src/screens/OrderDetail";
import TrackOrder from 'src/screens/TrackOrder';
import ReturnOrder from 'src/screens/ReturnOrder';
import OrderTypeList from "src/screens/OrderTypeList";
import Cart from "src/screens/Cart";

import Routes from "./routes";
import MainRoute from "./MainRoute";

const navigator = createStackNavigator(
    {
        [Routes.Splash]: {
            screen: Splash
        },
        [Routes.MainRoute]: {
            screen: MainRoute
        },
        [Routes.VerifyCode]: {
            screen: VerifyCode,
        },
        [Routes.ChangePhoneNumber]: {
            screen: ChangePhoneNumber,
            navigationOptions: {
                header: null
            }
        },
        [Routes.ChangePswdDeepLink]: {
            screen: ChangePassword,
            navigationOptions: {
                header: null
            }
        },
        [Routes.ProductDetailDeeplink]: {
            screen: ProductDetail,
        },

        [Routes.ProductDetailNotif]: {
            screen: ProductDetail,
        },

        [Routes.OrderDetailNotif]: {
            screen: OrderDetail,
        },

        [Routes.TrackOrder]: {
            screen: TrackOrder,
        },

        [Routes.ReturnOrder]: {
            screen: ReturnOrder,
        },

        [Routes.ReturnOrderList]: {
            screen: OrderTypeList,
        },
        [Routes.CartNotif]: {
            screen: Cart,
        },
    },
    {
        initialRouteName: Routes.Splash,
        defaultNavigationOptions: {
            header: null
        }
    }
);

/*const DrawerNavigator = createDrawerNavigator({
    "Drawer1": {
        screen: Home
    },
    "Drawer2": {
        screen: Home
    },
    "Drawer3r": {
        screen: Home
    }
}, {
    drawerPosition: I18nManager.isRTL ? 'right' : 'left',
});*/


export const RootNavigator = createAppContainer(navigator);

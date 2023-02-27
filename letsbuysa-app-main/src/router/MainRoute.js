import React from 'react';
import {
    createStackNavigator
} from "react-navigation";
import Routes from "./routes";
import Login from "src/screens/Login";
import SignUp from "src/screens/SignUp";
import VerifyCode from "src/screens/VerifyCode";
import ForgotPassword from "src/screens/ForgotPassword";
import ChangePhoneNumber from "src/screens/ChangePhoneNumber";
import EditProfile from "src/screens/EditProfile";
import ChangePassword from 'src/screens/ChangePassword'
import ProductDetail from "src/screens/ProductDetail";
import Cart from "src/screens/Cart";
import Wishlist from "src/screens/Wishlist";
import WriteReview from "src/screens/WriteReview";
import AllReviews from "src/screens/AllReviews";
import About from "src/screens/About";
import WebsiteView from "src/screens/WebView";
import Settings from 'src/screens/Settings';
import MyAddress from 'src/screens/MyAddress';
import AddNewAddress from 'src/screens/AddNewAddress'
import Checkout from 'src/screens/Checkout';
import SearchAddressMap from 'src/screens/SearchAddressMap';
import OrderList from 'src/screens/OrderList';
import OrderDetail from 'src/screens/OrderDetail';
import TrackOrder from 'src/screens/TrackOrder';
import ProductList from "src/screens/ProductList";
import BrandList from "src/screens/Brand listing";

import NotificationSettings from 'src/screens/NotificationSettings';
import MyNotifications from 'src/screens/MyNotifications';
import OrderTypeList from 'src/screens/OrderTypeList';
import ReturnOrder from "src/screens/ReturnOrder";
import Wallet from "src/screens/Wallet";
import AddWallet from "src/screens/AddWallet";
import RedemVoucher from "src/screens/RedemVoucher";


import MainTabs from "./MainTabs";
//Utility

const MainRoute = createStackNavigator({
    [Routes.MainTabs]: {
        screen: MainTabs
    },
    [Routes.Login]: {
        screen: Login,
        navigationOptions: {
            header: null
        }
    },
    [Routes.SignUp]: {
        screen: SignUp,
        navigationOptions: {
            header: null

        }
    },
    [Routes.ForgotPassword]: {
        screen: ForgotPassword,
        navigationOptions: {
            header: null

        }
    },
    [Routes.VerifyCode]: {
        screen: VerifyCode,
        navigationOptions: {
            header: null

        }
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
    [Routes.EditProfile]: {
        screen: EditProfile,
        navigationOptions: {
            header: null
        }
    },
    [Routes.ChangePswd]: {
        screen: ChangePassword,
        navigationOptions: {
            header: null
        }
    },
    [Routes.ProductDetail]: {
        screen: ProductDetail,
    },

    [Routes.CartOutside]: {
        screen: Cart
    },

    [Routes.WishlistOutside]: {
        screen: Wishlist
    },
    [Routes.WriteReview]: {
        screen: WriteReview,
    },
    [Routes.AllReviews]: {
        screen: AllReviews,
    },
    [Routes.About]: {
        screen: About
    },
    [Routes.WebsiteView]: {
        screen: WebsiteView
    },
    [Routes.Settings]: {
        screen: Settings
    },
    [Routes.MyAddress]: {
        screen: MyAddress
    },
    [Routes.AddNewAddress]: {
        screen: AddNewAddress
    },
    [Routes.EditAddress]: {
        screen: AddNewAddress
    },
    [Routes.SearchAddressMap]: {
        screen: SearchAddressMap
    },
    [Routes.VerifyAddress]: {
        screen: VerifyCode
    },
    [Routes.Checkout]: {
        screen: Checkout
    },
    [Routes.MyOrders]: {
        screen: OrderList
    },
    [Routes.OrderDetail]: {
        screen: OrderDetail
    },
    [Routes.TrackOrder]: {
        screen: TrackOrder
    },
    [Routes.ReturnOrder]: {
        screen: ReturnOrder,
    },
    [Routes.ProductListSearch]: {
        screen: ProductList,
    },
    [Routes.BrandListHome]: {
        screen: BrandList,
    },
    [Routes.NotificationSettings]: {
        screen: NotificationSettings,
    },
    [Routes.MyNotifications]: {
        screen: MyNotifications,
    },
    [Routes.ReturnOrderList]: {
        screen: OrderTypeList,
    },
    [Routes.Wallet]: {
        screen: Wallet,
    },
    [Routes.AddWallet]: {
        screen: AddWallet,
    },
    [Routes.RedemVoucher]: {
        screen: RedemVoucher,
    },

}, {
    initialRouteName: Routes.MainTabs,
    headerMode: 'screen',
    defaultNavigationOptions: {
        header: null
    },
});

export default MainRoute;
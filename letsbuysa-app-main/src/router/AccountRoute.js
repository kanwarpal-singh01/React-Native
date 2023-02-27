import React from 'react';
import {
    createStackNavigator
} from "react-navigation";
import Routes from "./routes";
import Account from "src/screens/AccountMain";
import MyAccount from "src/screens/MyAccount";

//Utility

const AccountRoute = createStackNavigator({
    [Routes.AccountOption]: {
        screen: Account,
    },
    [Routes.MyAccount]: {
        screen: MyAccount,
    },
}, {
    initialRouteName: Routes.AccountOption,
    defaultNavigationOptions: {
        header: null
    }
});

export default AccountRoute;
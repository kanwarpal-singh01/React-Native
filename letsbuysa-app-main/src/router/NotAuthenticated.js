import React from 'react';
import {
    createStackNavigator
} from "react-navigation";
import Routes from "./routes";
import Start from "src/screens/Start"
import Login from "src/screens/Login";
import SignUp from "src/screens/SignUp";
import VerifyCode from "src/screens/VerifyCode";


const NotAuthenticated = createStackNavigator({
    [Routes.Start]: {
        screen: Start,
        navigationOptions: {
            header: null
        }
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
    [Routes.VerifyCode]: {
        screen: VerifyCode,
        navigationOptions: {
            header: null

        }
    }
}, {
    initialRouteName: Routes.Start
});

export default NotAuthenticated;
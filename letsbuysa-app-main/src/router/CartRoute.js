import React from 'react';
import {createStackNavigator} from "react-navigation";

import Routes from "./routes";
import Cart from "src/screens/Cart";

import {
    Strings
} from "src/utils";

const CartRoute = createStackNavigator({
    [Routes.Cart]: {
        screen: Cart,
    },
}, {
    initialRouteName: Routes.Cart,
});

export default CartRoute;
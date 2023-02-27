import React from 'react';
import {createStackNavigator} from "react-navigation";

import Routes from "./routes";

import Wishlist from "src/screens/Wishlist";

import {
    Strings
} from "src/utils";

const WishlistRoute = createStackNavigator({
    [Routes.Wishlist]: {
        screen: Wishlist,
    },
}, {
    initialRouteName: Routes.Wishlist,
});

export default WishlistRoute;
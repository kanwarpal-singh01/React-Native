import React from 'react';
import {Platform} from "react-native";

import {
    createStackNavigator
} from "react-navigation";
import Routes from "./routes";

import Home from "src/screens/Home";
import ProductList from "src/screens/ProductList";
import BrandList from "src/screens/Brand listing";

import {Color, Constants, Strings, ThemeUtils} from "src/utils";
import CustomNavigationHeader from "src/component/view/CustomNavigationHeader/CustomNavigationHeader";


const HomeRoute = createStackNavigator({
    [Routes.Home]: {
        screen: Home,
    },
    [Routes.ProductListHome]: {
        screen: ProductList,
    },
    [Routes.BrandListHome]: {
        screen: BrandList,
    },
}, {
    initialRouteName: Routes.Home,
    defaultNavigationOptions: {
        title: "appName",
        header: (props) => <CustomNavigationHeader {...props}
        titleCenter={true}
        isMainTitle={false}/>
    }
});

export default HomeRoute;
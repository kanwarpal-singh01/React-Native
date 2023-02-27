import React from 'react';
import {createStackNavigator} from "react-navigation";

import Routes from "./routes";
import CustomNavigationHeader from "src/component/view/CustomNavigationHeader/CustomNavigationHeader";

import ProductList from "src/screens/ProductList";
import ProductDetail from "src/screens/ProductDetail";
import Categories from "src/screens/Categories";
import {
    Strings
} from "src/utils";

const CategoryRoute = createStackNavigator({
    [Routes.Categories]: {
        screen: Categories,
    },
    [Routes.ProductList]: {
        screen: ProductList,
    },
}, {
    initialRouteName: Routes.Categories,
    defaultNavigationOptions: {
        title: "appName",
        header: (props) => <CustomNavigationHeader {...props}/>
    }
});

export default CategoryRoute;
import React from 'react';
import {
    Easing,
    Animated
} from 'react-native';
import {
    createMaterialTopTabNavigator,
    createStackNavigator,
    createBottomTabNavigator
} from "react-navigation";

//Utility
import Routes from "./routes";
import {Strings} from "src/utils";

//Custom component
import {CustomTabBar} from "src/component";
import {CustomNavigationHeader} from 'src/component';

//Screens
import AccountRoute from "./AccountRoute";
import CategoryRoute from "./CategoryRoute";
import HomeRoute from "./HomeRoute";
import WishlistRoute from "./WishlistRoute";
import CartRoute from "./CartRoute";


const HomeTabs = createBottomTabNavigator(
    {
        [Routes.Home]: {
            screen: HomeRoute,
        },
        [Routes.Categories]: {
            screen: CategoryRoute
        },
        [Routes.Cart]: {
            screen: CartRoute
        },
        [Routes.Wishlist]: {
            screen: WishlistRoute
        },
        [Routes.AccountMain]: {
            screen: AccountRoute
        }
    },
    {
        initialRouteName: Routes.Home,
        swipeEnabled: false,
        lazy: true,
        tabBarOptions: {
            keyboardHidesTabBar: true,
            safeAreaInset: {bottom: 'never'}
        },
        tabBarComponent: props => <CustomTabBar {...props}/>,
        defaultNavigationOptions: {
            header: null,
        },
    }
);

/*const Authenticated = createStackNavigator({
    [Routes.HomeTabs]: {
        screen: HomeTabs,
    },
    [Routes.Search]: {
        screen: Search,
    },
}, {
    mode: 'modal',
    headerMode: 'none',
    cardStyle: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    transitionConfig: () => ({
        containerStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
        },
        transitionSpec: {
            duration: 100,
            easing: Easing.inOut(Easing.ease),
            timing: Animated.timing,
        },
        screenInterpolator: sceneProps => {
            const {position, scene} = sceneProps;
            const {index} = scene;

            const opacity = position.interpolate({
                inputRange: [index - 1, index],
                outputRange: [0, 1],
            });

            return {opacity};
        },
    }),
    defaultNavigationOptions: {
        header: null,
    },
    navigationOptions: ({navigation}) => {
        // console.log('navigation state', navigation.state);

        let header = null;
        let currentIndex = navigation.state.index;

        //Home Tabs
        let HomeTabRoute = navigation.state.routes[0];
        let HomeTabIndex = HomeTabRoute.index;

        if (currentIndex === 1 || currentIndex === 0 && HomeTabIndex < 2) {
            header = (props) => <CustomNavigationHeader {...props}/>
        }

        return {
            title: Strings.appName,
            header
        }
    }
});*/


export default HomeTabs;

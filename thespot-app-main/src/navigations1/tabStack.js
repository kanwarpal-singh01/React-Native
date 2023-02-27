import React from 'react';
import { Image, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeStack from '../navigations/homeStack';
import LocationStack from '../navigations/locationStack';
import ChatStack from '../navigations/chatStack';

const Tab = createBottomTabNavigator();

const TabIcon = ({ image, name }) => {
    return (
        <View>
            <Image source={image} style={{ height: name == 1 ? 42 : 26, width: name == 1 ? 26 : 26 }} />
        </View>
    )
}

const MyTabs = ({ route }) => {
     console.log('heyyy',getFocusedRouteNameFromRoute(route) )
    return (
        <Tab.Navigator
            initialRouteName="Location"
            tabBarOptions={{
                showLabel: false, keyboardHidesTabBar: true, style: {
                    backgroundColor: getFocusedRouteNameFromRoute(route) === 'Profile' ? '#F3F4F7' : 'white', elevation: 0,
                    borderTopColor: getFocusedRouteNameFromRoute(route) === 'Profile' ? '#F3F4F7' : 'white',
                }
            }}
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let image;
                    if (route.name === 'Profile') {
                        image = focused ? require("../assets/tabs/profilActive.png") : require("../assets/tabs/profileInactive.png")
                    } else if (route.name === 'Location') {
                        image = focused ? require("../assets/tabs/locationActive.png") : require("../assets/tabs/locationInactive.png")
                    } else if (route.name == 'Chat') {
                        image = focused ? require("../assets/tabs/chatActive.png") : require("../assets/tabs/chatInactive.png")
                    }
                    return <TabIcon image={image} name={route.name == "Location" ? 1 : 0} />;
                },
                // tabBarLabel: ({ focused, color }) => {
                //     let label;
                //     switch (route.name) {
                //         case 'Profile':
                //             return label = focused ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: '#354E5C' }}></View> : <Text>Home</Text>
                //         case 'Locations':
                //             return label = focused ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: '#354E5C' }}></View> : <Text>Notification</Text>
                //         case 'Chat':
                //             return label = focused ? <View style={{ height: 8, width: 8, borderRadius: 4, backgroundColor: '#354E5C' }}></View> : <Text>Ratings</Text>
                //     }
                //     return label
                // }
            })}
        >
            <Tab.Screen name="Profile" component={HomeStack} options={({ route }) => ({ tabBarVisible: getTabBarVisibility(route) })} />
            <Tab.Screen name="Location" component={LocationStack} options={({ route }) => ({ tabBarVisible: getTabBarVisibility(route) })} />
            <Tab.Screen name="Chat" component={ChatStack} options={({ route }) => ({ tabBarVisible: getTabBarVisibility(route) })} />
        </Tab.Navigator>
    );
}

export default MyTabs;


const preRoutes = ['EditSetting', 'EditPushNotifications', 'EditInfo', 'StoryView', 'StoryWithViewButton', 'Report', 'ProfilePhotoView', "Subscription"]
const getTabBarVisibility = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
    if (preRoutes.some(item => routeName == item)) {
        return false;
    }
    return true
}
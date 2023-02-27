import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MyTabs from '../navigations/tabStack';


const Stack = createStackNavigator();

const Routing = () => {

    return (
        <Stack.Navigator initialRouteName="MyTabs" screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="MyTabs" component={MyTabs} />
        </Stack.Navigator>
    )
}

export default Routing;
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Chat from '../componets/Home/Chat/chat';
import ChatScreen from '../componets/Home/Chat/chatScrren';
import ViewUserDeatils from '../componets/Home/Locations/viewUserDetails';
import Report from '../componets/Home/Locations/report';

const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator initialRouteName="Chat" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Chat" component={Chat} />
            <Stack.Screen name="ChatScreen" component={ChatScreen}/>
            <Stack.Screen name="ViewUserDeatils" component={ViewUserDeatils} />
            <Stack.Screen name="Report" component={Report} />
        </Stack.Navigator>
    )
}


export default HomeStack;

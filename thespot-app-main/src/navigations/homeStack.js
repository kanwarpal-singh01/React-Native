import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Profile from '../componets/Home/Profile/profile';
import EditSetting from '../componets/Home/Profile/editSetting';
import EditPushNotifications from '../componets/Home/Profile/pushNotificationSetting';
import EditInfo from '../componets/Home/Profile/editInfo';
import ProfilePhotoView from '../componets/Home/Profile/profilePhotoView';
import ViewUserDeatils from '../componets/Home/Locations/viewUserDetails';
import Subscription from '../componets/Home/Profile/subscription';
import DropMarker from '../componets/Home/Locations/dropMarker';
const Stack = createStackNavigator();

const HomeStack = () => {
    return (
        <Stack.Navigator initialRouteName="Profile" screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="DropMarker" component={DropMarker}  options={{
        animationEnabled: false,
      }}/>
            <Stack.Screen name="EditSetting" component={EditSetting} />
            <Stack.Screen name="EditPushNotifications" component={EditPushNotifications} />
            <Stack.Screen name="EditInfo" component={EditInfo} />
            <Stack.Screen name="ProfilePhotoView" component={ProfilePhotoView} />
            <Stack.Screen name="ViewUserDeatils" component={ViewUserDeatils} />
            <Stack.Screen name="Subscription" component={Subscription} />
        </Stack.Navigator>
    )
}


export default HomeStack;

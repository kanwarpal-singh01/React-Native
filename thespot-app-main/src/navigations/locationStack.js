import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Location from '../componets/Home/Locations/location';
import ChatScreen from '../componets/Home/Chat/chatScrren';
import LocationAccess from '../componets/Home/Chat/locationsAccess';
import ViewUserDeatils from '../componets/Home/Locations/viewUserDetails';
import LikesViews from '../componets/Home/Locations/likesView';
import Story from '../componets/Home/Locations/story';
import StorySettings from '../componets/Home/Locations/storySettings';
import StoryView from '../componets/Home/Locations/storyView';
import StoryWithViewButton from '../componets/Home/Locations/storyWithViewButton';
import Report from '../componets/Home/Locations/report';
import DropMarker from '../componets/Home/Locations/dropMarker';
import Subscription from '../componets/Home/Profile/subscription';
const Stack = createStackNavigator();

const LocationStack = () => {
    return (
        <Stack.Navigator initialRouteName="LocationAccess" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LocationAccess" component={LocationAccess} />
            <Stack.Screen name="Location" component={Location} options={{
        animationEnabled: false,
      }}/>
            <Stack.Screen name="DropMarker" component={DropMarker}  options={{
        animationEnabled: false,
      }}/>
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="ViewUserDeatils" component={ViewUserDeatils} />
            <Stack.Screen name="LikesViews" component={LikesViews} />
            <Stack.Screen name="Story" component={Story} />
            <Stack.Screen name="StorySettings" component={StorySettings} />
            <Stack.Screen name="StoryView" component={StoryView} />
            <Stack.Screen name="StoryWithViewButton" component={StoryWithViewButton} />
            <Stack.Screen name="Report" component={Report} />
            <Stack.Screen name="Subscription" component={Subscription} />
        </Stack.Navigator>
    )
}

export default LocationStack;

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TermsAndConditions from '../componets/login/termsConditions';
import { SiginComponentsss } from '../componets/login/firstScreen';
import MobileNumber from '../componets/login/mobileNumber';
import { SiginComponents } from '../componets/login/otp';
import Email from '../componets/login/email';
import Welcome from '../componets/login/welcome';
import AllowLocations from '../componets/login/allowLocations';
import Name from '../componets/login/name';
import BirthDayDate from '../componets/login/birthdayDate';
import SelectGender from '../componets/login/selectGender';
import Interested from '../componets/login/interested';
import Height from '../componets/login/height';
import Nationality from '../componets/login/nationality';
import UploadPhoto from '../componets/login/uploadPhotos';
import { SiginComponent } from '../componets/login/introuction';
import ConnectAccount from '../componets/login/conncentAccount';
import IntroSlider from '../componets/login/introSlider';


const Stack = createStackNavigator();

const Auth = () => {
    return (
        <Stack.Navigator initialRouteName="IntroSlider" screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="IntroSlider" component={IntroSlider} />
            <Stack.Screen name="FirstScreen" component={SiginComponentsss} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditions} />
            <Stack.Screen name="MobileNumber" component={MobileNumber} />
            <Stack.Screen name="OTP" component={SiginComponents} />
            <Stack.Screen name="Email" component={Email} />
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="AllowLocations" component={AllowLocations}/>
            <Stack.Screen name="Name" component={Name} />
            <Stack.Screen name="BirthDayDate" component={BirthDayDate} />
            <Stack.Screen name="SelectGender" component={SelectGender} />
            <Stack.Screen name="Interested" component={Interested} />
            <Stack.Screen name="Height" component={Height} />
            <Stack.Screen name="Nationality" component={Nationality} />
            <Stack.Screen name="UploadPhoto" component={UploadPhoto} />
            <Stack.Screen name="Intro" component={SiginComponent} />
            <Stack.Screen name="ConnectAccount" component={ConnectAccount} />
        </Stack.Navigator>
    )
}

export default Auth;
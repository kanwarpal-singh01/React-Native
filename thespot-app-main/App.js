import React, { Component } from 'react';
import { StatusBar, Platform,Vibration } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AuthLoading from './src/navigations/authLoding';
import SplashScreen from 'react-native-splash-screen'
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Google Ads 
import admob, { MaxAdContentRating } from '@react-native-firebase/admob';

// Localize library
import * as RNLocalize from "react-native-localize";
import { setI18nConfig } from './src/helper/translationHelper';

import { AuthContext } from './src/navigations/context';
import LocalizeProvider from './src/context/localize';

// Register background handler


const fcmtoken = async () => {
  const fcmToken = await messaging().getToken();
        if (fcmToken) {
          console.log(fcmToken);
          await AsyncStorage.setItem('device_id', fcmToken);
          console.log("Your Firebase Token is2222:", fcmToken);
        } else {
          console.log("Failed", "No token received");
        }
}

// Must be outside of any component LifeCycle (such as `componentDidMount`).asa
PushNotification.configure({
  // (optional) Called when Token is generated (iOS and Android)
  onRegister: function (token) {
    console.log("TOKEN:", token.token);
    Platform.OS == "ios" ? fcmtoken() : AsyncStorage.setItem('device_id', token.token)
    // console.log("Your Firebase Token is2222:", messaging().getToken());
  },

  // (required) Called when a remote is received or opened, or local notification is opened
  onNotification: async function (notification) {
    console.log("NOTIFICATION:ssss", notification);

    PushNotification.createChannel(
      {
        channelId: notification.channelId, // (required)
        channelName: "My channel", // (required)
        channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
        
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );

    if (notification.foreground) {
      console.log('heyyyyy', notification.foreground, notification.channelId)
      PushNotification.localNotification({
        id: 0,
        channelId: notification.channelId,
        title: notification.title,
        message: notification.message,
        showWhen: true, // (optional) default: true
        autoCancel: true,
        vibrate: true,
        
        
      });
    }
    // (required) Called when a remote is received or opened, or local notification is opened
     const val = 1;
     console.log("ggggggggggg")
    //  PushNotificationIOS.setApplicationIconBadgeNumber(val);

     notification.finish(PushNotificationIOS.FetchResult.NoData);
   
   
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function (err) {
    console.error(err.message, err);
  },

  // IOS ONLY (optional): default: all - Permissions to register.
  permissions: {
    alert: true,
    badge: true,
    sound: true,
    
  },

  // Should the initial notification be popped automatically
  // default: true,
  popInitialNotification: true,
  foreground: true,
  requestPermissions: true,
});


export default class App extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      userID: "",
      currentLang: { languageTag: "en", isRTL: false }
    }

    setI18nConfig(this.state.currentLang);
  }

  async componentDidMount() {
    setTimeout(() => {
      SplashScreen.hide();
    }, 2000);
    
    admob()
      .setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,

        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: true,

        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: true,
      })
      .then(() => {
        // Request config successfully set!
      });
    
    RNLocalize.addEventListener("change", this.handleLocalizationChange);
  }

  // async componentDidUpdate() {
  //   this.setState({ userID: await AsyncStorage.getItem('userID') }, () => {
  //     // this.checkLoginStatus();
  //   })
  // }

  componentWillUnmount() {
    RNLocalize.removeEventListener("change",this.handleLocalizationChange);
  }

  handleLocalizationChange = () => {
    setI18nConfig(this.state.currentLang);
    this.forceUpdate();
  };

  setCurrentLanguage = (value) => {
    console.log("Setting Language --->", value);
    this.setState({ currentLang: value });
    setI18nConfig(value);
    this.forceUpdate();
  }

  render() {
    return (
      <NavigationContainer>
        <LocalizeProvider value={{ currentLang: this.state.currentLang, setCurrentLanguage: this.setCurrentLanguage }}>
          {
            Platform.OS == 'android' && <StatusBar StatusBarStyle={'light-content'} />
          }
          {/* {Platform.OS === 'ios' ? (
          <StatusBar barStyle={'dark-content'} />
        ) : (
          <StatusBar StatusBarStyle={'dark-content'} />
        )} */}

          <AuthLoading />
        </LocalizeProvider>
      </NavigationContainer>
    )
  }

}
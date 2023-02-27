/**
 * @format
 */
import React, { useEffect, useState } from 'react';
import { AppRegistry, Alert, Platform } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';

import NotificationProvider from './src/context/notificationCounter';

const Wrapper = () => {
    // sendLocalNotification();
    const [counter, setCounter] = useState(0);
    useEffect(() => {
        
        // PushNotification.popInitialNotification((notification) => {
        //     console.log('Initial Notification', notification);
        // });

      //   PushNotificationIOS.addEventListener("register", (token) => {
      //       console.log("Token form ios----->", token)
            
      //   });

      //   PushNotificationIOS.addEventListener("notification", (token) => {
      //       console.log("Notification received in ios----->", token)
      //   });
       

      //  if(Platform.OS == "android"){
      //   PushNotification.configure({
      //     onRegister: async function (token) {
             
             
      //         await AsyncStorage.setItem('device_id', token.token);
      //     },
      //     onNotification: function (notification) {
      //         console.log("NOTIFICATION:", notification);
      //         // let count = JSON.parse(notification.data.data)?.notification_count;

      //         // console.log("Count -->", count);
      //         // setCounter(count)
      //         // notification.finish(PushNotificationIOS.FetchResult.NoData);
      //     },
      //     onAction: function (notification) {
      //         console.log("ACTION:", notification.action);
      //         console.log("NOTIFICATION:", notification);
      //     },
      //     onRegistrationError: function (err) {
      //         console.error(err.message, err);
      //     },
      //     permissions: {
      //         alert: true,
      //         badge: true,
      //         sound: true,
      //     },
      //     popInitialNotification: true,
      //     requestPermissions: true,
      // });
      // }else{
      //   requestUserPermission();
      //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      //     PushNotification.localNotification({
      //       message: remoteMessage.notification.body,
      //       title: remoteMessage.notification.title,
         
      //       channelId: "channel-id",
      //     });
      //   });
  
  
      //    return unsubscribe;
      // }

     

        // const unsubscribe = messaging().onMessage(async remoteMessage => {
        //     Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
        // });

        // return unsubscribe;
        
    }, []);

    // requestUserPermission = async () => {
    //     const authStatus = await messaging().requestPermission();
    
    //     const enabled =
    //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
    //     if (enabled) {
    //       this.getFcmToken();
    //       console.log('Authorization status:', authStatus);
    //     }
    //   }
    //   getFcmToken = async () => {
    //     const fcmToken = await messaging().getToken();
    //     if (fcmToken) {
    //       console.log(fcmToken);
    //       await AsyncStorage.setItem('device_id', fcmToken);
    //       console.log("Your Firebase Token is:", fcmToken);
    //     } else {
    //       console.log("Failed", "No token received");
    //     }
    //   }
    
    return <NotificationProvider value={{ counter, setCounter }}>
        <App />
    </NotificationProvider>
};

AppRegistry.registerComponent(appName, () => Wrapper);

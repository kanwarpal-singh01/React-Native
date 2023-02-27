import React, { Component } from "react";
import MapView, {
  PROVIDER_GOOGLE,
  Marker,
  Polyline,
  Circle,
} from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Geolocation from "@react-native-community/geolocation";
import Spinner from "../../../helper/spinner";
import Toast from "react-native-simple-toast";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";
import { AuthContext } from "../../../navigations/context";
import { NotificationContext } from "../../../context/notificationCounter";
import { LocalizeContext } from "../../../context/localize";

import { translate } from "../../../helper/translationHelper";
import useCallApi from "../../../helper/useApiCall";
import { useFocusEffect } from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Switch,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
  StatusBar,
  PermissionsAndroid,
  Alert,
} from "react-native";

import {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  BannerAdSize,
} from "@react-native-firebase/admob";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';



class Location extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      userID: "",
      mapListSwitch: false,
      loading: false,
      responseData: [],
      myResponseData: [],
      storyData: null,
      photoURL: "",
      subscription:0,
      userProfileImage: "",
      Lat: 0.0,
      Long: 0.0,
      First: true,
      webService: true,
      otherUserStoryData: null,
      like_view_count: 0,
      drop_pin_status: 0,
      spyMode: 0,
      outOFTheCircle: false,
      tracksViewChanges: true,
    };
    this.mapRef = null;
  }

  async componentDidMount() {
    this.requestUserPermission();
//return unsubscribe;
    this.setState({  userID: await AsyncStorage.getItem("userID") });
    this.setState(
      { drop_pin_status: await AsyncStorage.getItem("drop_pin_status") },
      () => {
        console.log(
          "Drop Pin Location statuys--->",
          this.state.drop_pin_status
        );
      }
    );
    Geolocation.getCurrentPosition((info) =>
      this.setState({
        Lat: info.coords.latitude,
        Long: info.coords.longitude,
      })
    );
    this.dashboard();
    PushNotificationIOS.setApplicationIconBadgeNumber(0);
    if (Platform.OS == "ios") {
      this.circle.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.4)" });
      this.circle1.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.3)" });
      this.circle2.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
      this.circle3.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
    }
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Location' }]
   })
      Geolocation.getCurrentPosition((info) =>{
        this.setState({
          Lat: info.coords.latitude,
          Long: info.coords.longitude,
          outOFTheCircle: false, mapListSwitch: false ,
        });
        this.dashboard(info.coords.latitude,info.coords.longitude);
      }
       
      );
      this.requestUserPermission();
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
      if (Platform.OS == "ios") {
        this.circle.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.4)" });
        this.circle1.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.3)" });
        this.circle2.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
        this.circle3.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
      }
    });
  }
 
  async componentDidUpdate() {
    if (this.state.First) {
      Geolocation.getCurrentPosition((info) =>
        this.setState({
          Lat: info.coords.latitude,
          Long: info.coords.longitude,
        })
      );
      this.setState({ First: false });
    }

    if (this.state.mapListSwitch === false) {
      if (Platform.OS == "ios") {
        this.circle.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.4)" });
        this.circle1.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.3)" });
        this.circle2.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
        this.circle3.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
      }
    }
    if (this.state.webService && this.state.Lat != 0.0 && this.state.Lat != 0) {
      this.setState({ webService: false }, () => {
        this.dashboard();
      });
    }
    this.checkLoginStatus(this.state.userID);
  }

  componentWillUnmount() {
    // this._unsubscribe();
  }


  requestUserPermission = async () => {
  
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
    if (enabled) {
      this.getFcmToken();
      console.log('Authorization status:', authStatus);
    }
  }
  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
   
    if (fcmToken) {
      console.log(fcmToken,"hi i am from location");
      this.UpdateDeviceToken(fcmToken);
      console.log("Your Firebase Token is:", fcmToken);
    } else {
      console.log("Failed", "No token received");
    }
  }
  UpdateDeviceToken = (device_token) => {
    console.log(device_token + "dsaasd");
    let body = {
      token: device_token,
      user_id: this.state.userID,
    };
    axios
      .post(apiUrl + "update_device_token", body)
      .then((response) => {
        console.log(response,"hi i am updated");
        
      })

      .catch(function (error) {
        this.setState({ spinner: false })
        //console.log(error);
      });
  }
  toggleValueChange = (stateName) => {
    this.setState((previousState) => ({
      ...this.state,
      [stateName]: !previousState[stateName],
    
    }));
    this.dashboard()
  };

  markerClick() {
    this.props.navigation.navigate("Story");
  }

  dashboard(lat = null, long = null) {
    this.setState({ loading: true });
    let body = {
      lat: lat ? lat : this.state.Lat,
      lng: long ? long : this.state.Long,
      user_id: this.state.userID,
    };
    console.log(body,"ankit");
    axios
      .post(apiUrl + "dashboard", body)
      .then(async(response) => {
        this.setState({  webService: false });
        // Toast.show(response.data.message)
        console.log(
          "response.data---------------->",
          response.data.login_user_data.lat
        );
        if (response.data.status == 1) {
          await AsyncStorage.setItem('story_save_status', response.data.login_user_data.story_save_status)
          this.setState({
            responseData: response.data.data.filter((data) =>
              data.id != this.state.userID ? data : console.log("not matched")
            ),
            photoURL: response.data.profile_url,
          });
          this.setState(
            { myResponseData: response.data.login_user_data },
            () => {
              this.setState({
                storyData:
                  this.state.myResponseData.length === 0
                    ? null
                    : this.state.myResponseData.story,
                userProfileImage:
                  this.state.myResponseData.length === 0
                    ? null
                    : this.state.myResponseData.profile_image,
              });
            }
          );
          this.setState({
            like_view_count: response.data.login_user_data.like_view_count,
            drop_pin_status: response.data.login_user_data.drop_pin_status,
            spyMode: response.data.login_user_data.spy_mode,
            subscription:response.data.login_user_data.subscription,
          });
          this.props.notification.setCounter(
            response.data.login_user_data.like_view_count
          );
          if (response.data.login_user_data.drop_pin_status == 1) {
            this.setState({
              Lat: response.data.login_user_data.lat,
              Long: response.data.login_user_data.lng,
            });
          }
        } else if (response.data.status == 10) {
          this.context.signOut();
        }
      })
      .catch((erroraa) => { 
        // this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show(translate("Please check your internet connection"));
        }
      });
  }

  listRedirectScreen(id, names) {
    this.props.navigation.navigate("StoryView", { storyId: id, name: names });
  }

  currentLocationButton() {
    this.setState({ Lat: this.state.Lat, Long: this.state.Long });
  }

  checkLoginStatus = (userId) => {
    if (userId) {
      let body = { user_id: userId };

      axios
        .post(apiUrl + "login-status", body)
        .then((response) => {
          if (response.data.status == 1) {
          } else if (response.data.status == 10) {
            this.context.signOut();
            Toast.show(response.data.message);
          }
        })
        .catch((erroraa) => {
          if (erroraa.toJSON().message === "Network Error") {
            Toast.show("Please check your internet connection");
          }
        });
    }
  };
  chatScreenRedirect(arrayVal){
    let body = { user_id: this.state.userID,receiver_id: arrayVal.id}

    console.log("body", body);

    axios
        .post(apiUrl + 'getChatPremiumStatus', body)
        .then((response) => {
            this.setState({ loading: false })
            console.log("Some Response Data ---->", response.data);
            if (response.data.status == 1) {
                if(response.data.data.subscription==1){
                    this.props.navigation.navigate('ChatScreen', arrayVal);
                }else if(response.data.data.totalCountToday < 3){
                    this.props.navigation.navigate('ChatScreen', arrayVal)
                }else{
                    this.props.navigation.navigate('Subscription')
                }
                
            }
        })
        .catch((erroraa) => {
            this.setState({ loading: false })
            if (erroraa.toJSON().message === 'Network Error') {
                Toast.show(translate('Please check your internet connection'))
            }
        });
    
}
  restoreLocation = () => {
    this.setState({ loading: true });

    Geolocation.getCurrentPosition((info) => {
      this.setState({ Lat: info.coords.latitude, Long: info.coords.longitude });

      let body = {
        user_id: this.state.userID,
        lat: this.state.Lat,
        lng: this.state.Long,
        drop_pin_status: 0,
      };
      axios
        .post(apiUrl + "update-location", body)
        .then((response) => {
          this.dashboard();
        })
        .catch((erroraa) => {
          this.setState({ loading: false });
          if (erroraa.toJSON().message === "Network Error") {
            Toast.show(translate("Please check your internet connection"));
          }
        });
    });
  };

  navigateToDropMarker() {
    // if (this.state.drop_pin_status == 1) {
    //     this.setState({ showRestoreButton: !this.state.showRestoreButton })
    // } else {

    // }

    // if (this.state.mapListSwitch) {
    //   this.setState({ mapListSwitch: false });
    // } 
    // else {
      this.props.navigation.navigate("DropMarker", {
        latLoc: this.state.Lat,
        longLoc: this.state.Long,
      }, () =>{
        this.setState({ outOFTheCircle: false, mapListSwitch: true });
      });
 //  }
 
  }

  callSetCurrentLanguage = () => {
    let lang = this.props.localize.currentLang;
    let languageTag = lang?.languageTag == "ar" ? "en" : "ar";
    this.props.localize.setCurrentLanguage({ ...lang, languageTag });
  };

  userOutSideTheMarker = () => {
    return (
      <View style={{ backgroundColor: "#f2f2f6", borderRadius: 16, flex: 1 }}>
        <View style={{ flexDirection: "row", marginLeft: 12, marginTop: 10 }}>
          <Image
            source={require("../../../assets/arrow.png")}
            style={{ height: 25, width: 20 }}
          />
          <Text
            style={{
              marginLeft: 8,
              fontFamily: "Montserrat-Regular",
              fontSize: 12,
              color: "gray",
            }}
          >
              {translate("Use the drop your pin")}
                    {"\n"}
                    {translate("feature by clicking here")}
          </Text>
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              backgroundColor: "#FF5000",
              marginLeft: -100,
              marginBottom: -5,
              height: 18,
              width: 18,
              borderRadius: 9,
            }}
          ></View>
          <Image
            source={require("../../../assets/locations/radius.png")}
            style={{ height: 120, width: 120 }}
          />
          <Text
            style={{
              marginLeft: 8,
              fontFamily: "Montserrat-Bold",
              fontSize: 14,
              color: "#FF5000",
              marginTop: 16,
            }}
          >
             {translate("THIS USER IS OUTSIDE YOUR RADIUS")}
          </Text>
          <Text
            style={{
              fontFamily: "Montserrat-Regular",
              fontSize: 12,
              color: "gray",
              marginHorizontal: 46,
              textAlign: "center",
              marginTop: 4,
            }}
          >
            {translate("But you can still chat with this user by using the drop your pin feature in the top left corner")}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF5000",
            borderRadius: 12,
            height: 42,
            width: 120,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: Dimensions.get("window").width / 2 - 80,
            marginBottom: 12,
          }}
          onPress={() => this.setState({ outOFTheCircle: false })}
        >
          <Text
            style={{
              fontFamily: "Montserrat-Bold",
              color: "white",
              fontSize: 14,
            }}
          >
            {translate("Continue")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return <WebView source={{ uri: 'https://devnode.devtechnosys.tech/tarunmap.php' }} />;
  }
}

const UsingContext = ({ ...props }) => {
  const notification = React.useContext(NotificationContext);
  const localize = React.useContext(LocalizeContext);

  return (
    <Location notification={notification} localize={localize} {...props} />
  );
};

export default UsingContext;

const style = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerImageBorderStyle: {
    height: 52,
    width: 52,
    borderRadius: 26,
    borderWidth: 4,
    borderColor: "#ff5000",
  },
  markerImageBorderStyle1: {
    height: 44,
    width: 44,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: "#ff5000",
    backgroundColor: "white",
    padding: 8,
  },
  markerImageWithoutBoderStyle: {
    height: 52,
    width: 52,
    borderRadius: 24,
  },
  imageBoderStyle: {
    height: 70,
    width: 70,
    borderColor: "#ff5000",
    borderRadius: 35,
    borderWidth: 5,
  },
  imageWithoutBoder: {
    height: 70,
    width: 70,
    borderRadius: 35,
  },
});

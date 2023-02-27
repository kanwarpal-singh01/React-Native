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
  FlatList,
  StatusBar,
  PermissionsAndroid,
  Alert,
} from "react-native";
import * as RNLocalize from "react-native-localize";
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
      subscription: 0,
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
      currentPage: 1,
      lastPage: 0,
      isLoading:false
    };
    this.mapRef = null;
  }

  async componentDidMount() {
  console.log(RNLocalize.getLocales()[0].languageCode,"tarun jain")
    if(this.props.route.params != undefined && this.props.route.params.coming_from != undefined && this.props.route.params.coming_from == "Home_list"){
      this.setState({mapListSwitch:true})
    }else{
      this.setState({mapListSwitch:false})
    }

    this.requestUserPermission();
    //return unsubscribe;
    this.setState({ userID: await AsyncStorage.getItem("userID") });
    this.setState(
      { drop_pin_status: await AsyncStorage.getItem("drop_pin_status") },
      () => {
        console.log(
          "Drop Pin Location statuys--->",
          this.state.drop_pin_status
        );
      }
    );
    
    Geolocation.getCurrentPosition(
      position => {
        this.setState({
          Lat: position.coords.latitude,
          Long: position.coords.longitude,
        })
      },
      error => Alert.alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
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
      Geolocation.getCurrentPosition(
        position => {
          const location = JSON.stringify(position);
      
          this.setState({
            Lat: position.coords.latitude,
            Long: position.coords.longitude,
            outOFTheCircle: false, mapListSwitch: false,
          });
          this.dashboard(position.coords.latitude, position.coords.longitude);
        },
        error => Alert.alert(error.message),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      

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
      console.log(fcmToken, "hi i am from location");
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
        console.log(response, "hi i am updated");

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
    console.log("Tarun jain ")
    this.setState({ loading: true });
    let body = {
      lat: lat ? lat : this.state.Lat,
      lng: long ? long : this.state.Long,
      user_id: this.state.userID,
    };
    console.log(body, "ankit");
    axios
      .post(apiUrl + "dashboard", body)
      .then(async (response) => {
        this.setState({ loading: false });
        this.setState({ webService: false });
        // Toast.show(response.data.message)
        console.log(
          "response.data---------------->",
          this.state.myResponseData.profile_image
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
            subscription: response.data.login_user_data.subscription,
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
        this.setState({ loading: false });
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
  chatScreenRedirect(arrayVal) {
    let body = { user_id: this.state.userID, receiver_id: arrayVal.id }

    console.log("body", body);

    axios
      .post(apiUrl + 'getChatPremiumStatus', body)
      .then((response) => {
        this.setState({ loading: false })
        console.log("Some Response Data ---->", response.data);
        if (response.data.status == 1) {
          if (response.data.data.subscription == 1) {
            this.props.navigation.navigate('ChatScreen', arrayVal);
          } else if (response.data.data.totalCountToday < 3) {
            this.props.navigation.navigate('ChatScreen', arrayVal)
          } else {
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
    }, () => {
      this.setState({ outOFTheCircle: false, mapListSwitch: true, });
      
    });
    //  }

  }
  _onNavigationStateChange(webViewState){
    console.log(webViewState)
    var initial_url = webViewState.url;
    var url = initial_url.split('?');
    console.log(url)
    if(url[1] == 'own'){
      this.state.storyData == null
      ? this.props.navigation.navigate("Story", {
        storyData: this.state.storyData,
      })
      : this.props.navigation.navigate("StoryWithViewButton")
    }
    if(url[1] != 'own' && url[1] != 'returnlocation' && url[1] != 'out' && url.length >1 ){
     var datas = this.state.responseData[parseInt(url[1])];
     console.log(datas);
     datas.radius_status
                            ? datas.story == null
                              ? this.props.navigation.navigate(
                                "ViewUserDeatils",
                                {
                                  id: datas.id,
                                  distance: datas.distance_show_value,
                                  coming: "Home",
                                }
                              )
                              : this.props.navigation.navigate("StoryView", {
                                storyId: datas.id,
                                name: datas.name,
                              })
                            : this.setState({ outOFTheCircle: true })
    }
    if(url[1] == 'out'){
      this.setState({ outOFTheCircle: true })
    }
    if(url[1] == 'returnlocation'){
      this.restoreLocation()
    }
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
    const {currentPage,lastPage,isLoading}=this.state;
    console.log("laaaaaaaaaattttttt--------->", this.state.spyMode);
    return (
      <>
        {this.state.loading && <Spinner />}

        <ImageBackground
          style={{
            flex: 1,
            width: null,
            height: null,
            backgroundColor: "white",
          }}
        >
          <SafeAreaView style={{ backgroundColor: "white" }} />
          <StatusBar barStyle={"dark-content"} />
          {/* <View style={{ backgroundColor: 'white' }}> */}
          <View
            style={{
              flexDirection: "row",
              marginHorizontal: 16,
              marginTop: 16,
            }}
          >
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => this.navigateToDropMarker()}
            >
              {this.state.drop_pin_status == 0 ? (
                <Image
                  source={require("../../../assets/locations/location.png")}
                  style={{ height: 25, width: 16 }}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/location.png")}
                  style={{ height: 25, width: 16 }}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingHorizontal: 10 }}
              onPress={() => this.props.navigation.navigate("LikesViews")}
            >
              <View
                style={{
                  position: "absolute",
                  top: -10,
                  zIndex: 1,
                  backgroundColor: "white",
                  right: 7,
                  padding: 1,
                  borderRadius: 40,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    alignItems: "center",
                    fontFamily: "Montserrat-Bold",
                    justifyContent: "center",
                  }}
                >
                  {this.props.notification.counter}
                </Text>
              </View>
              <Image
                source={require("../../../assets/locations/doubleHeart.png")}
                style={{ height: 22, width: 25 }}
              />
            </TouchableOpacity>
            {/* <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => this.callSetCurrentLanguage()}>
                            <View style={{ backgroundColor: "#E0E0E0", height: 25, width: 25, alignItems: "center", justifyContent: 'center', borderRadius: 30 }}>
                                <Text>{this.props.localize.currentLang.languageTag}</Text>
                            </View>
                        </TouchableOpacity> */}
            <View style={{ flex: 1 }}></View>
            {this.state.outOFTheCircle == false && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ fontSize: 12, fontFamily: "Montserrat-Bold" }}>
                  {translate("Map")}
                </Text>
                <TouchableOpacity
                  onPress={() => this.toggleValueChange("mapListSwitch")}

                >
                  <Image
                    source={
                      this.state.mapListSwitch == false
                        ? require("../../../assets/locations/mapToggel.png")
                        : require("../../../assets/locations/listToggel.png")
                    }
                    style={{ height: 20, width: 36, marginHorizontal: 8 }}
                  />
                </TouchableOpacity>
                <Text style={{ fontSize: 12, fontFamily: "Montserrat-Bold" }}>
                  {translate("List")}
                </Text>
              </View>
            )}
          </View>
          {/* </View> */}
          {this.state.mapListSwitch == false && this.state.outOFTheCircle == true && (
            <View
            style={{
              flex: 1,
              marginTop: 8,
              marginBottom: 16,
              marginHorizontal: 16,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
          <this.userOutSideTheMarker /></View>
          )}
          {this.state.mapListSwitch == false && this.state.outOFTheCircle == false && (
            <View
            style={{
              flex: 1,
              marginTop: 8,
              marginBottom: 16,
              marginHorizontal: 16,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <WebView  onLoad={() => this.setState({loading:false})} onNavigationStateChange={this._onNavigationStateChange.bind(this)} source={{ uri: `https://admin.thespotapplication.com/getMapUser/${this.state.userID}/${this.state.Lat}/${this.state.Long}` }} /></View>
          )}
          {this.state.mapListSwitch == true &&
            this.state.responseData.length == 0 && (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f2f2f6",
                  marginHorizontal: 16,
                  marginTop: 8,
                  borderRadius: 16,
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                <Image
                  source={require("../../../assets/not_found/user.png")}
                  style={{ height: 50, width: 50 }}
                  resizeMode={"contain"}
                />
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "Montserrat-Bold",
                    color: "#FF5000",
                    fontSize: 14,
                    marginTop: 16,
                    textTransform: "uppercase",
                  }}
                >
                  {translate("No User Nearby")}
                </Text>
                <Text
                  style={{
                    textAlign: "center",
                    fontFamily: "Montserrat-Regular",
                    color: "#535253",
                    fontSize: 12,
                    marginTop: 8,
                    marginHorizontal: 100,
                  }}
                >
                  {translate("Keep checking back later")}
                </Text>
              </View>
            )}

          {this.state.mapListSwitch == true &&
            this.state.responseData.length > 0 && (
              <View
                style={{
                  backgroundColor: "#f2f2f6",
                  marginHorizontal: 16,
                  marginTop: 8,
                  borderRadius: 16,
                  flex: 1,
                  marginBottom: 16,
                }}
              >
                {this.state.outOFTheCircle == true ? (
                  <this.userOutSideTheMarker />
                ) : (
                  <View >
                    {this.state.responseData.length != 0 && (
                      <Text
                        style={{
                          color: "#FF5000",
                          marginHorizontal: 16,
                          marginVertical: 16,
                          fontSize: 10,
                          fontFamily: "Montserrat-Bold",
                        }}
                      >
                        {translate("People in the Spot")}
                      </Text>
                    )}
<FlatList
                  data={this.state.responseData}
                  // style={{ flex: 1, margin:"5%"}}
                 
                  keyExtractor={(item, index) => {
                    return String(index);
                  }}
                  extraData={this.state.responseData}
                  // onScroll={e => {
                  //   let paddingToBottom = 10;
                   
                  //   paddingToBottom +=
                  //     e.nativeEvent.layoutMeasurement.height;
                  //   var currentOffset = 
                  //   e.nativeEvent.contentOffset.y;
                  //   var direction =
                  //     currentOffset > this.offset ? 'down' : 'up';
                  //     console.log(direction);
                  //   if (direction === 'up') {
                  //     console.log(paddingToBottom);
                  //     if (
                  //       e.nativeEvent.contentOffset.y >=
                  //       e.nativeEvent.contentSize.height - 
                  //       paddingToBottom
                  //     ) {
                  //       if (!isLoading && currentPage < lastPage)
                  //        {
                  //         console.log('next page');
                  //         // this.setState({isLoading: true});
                  //         setTimeout(() => {
                  //           this.lodeMoreData();
                  //         }, 1000);
                  //       }else{
                  //         console.log("eeeeee")
                  //       }
                  //     }
                  //   }
                  // }}
                  renderItem={({ item, index }) => { 
                    console.log(item,"33232332323");
                    let data = item;
                    return (
                      <>
                      {this.state.userID != data.id && 
                       
                        <React.Fragment key={data.id}>
                                                    <View
                                                      style={{
                                                        flexDirection: "row",
                                                        marginHorizontal: 16,
                                                        alignItems: "center",
                                                        marginBottom: 15,
                                                      }}
                                                    >
                        
                                                      <TouchableOpacity
                                                        disabled={data.story == null ? true : false}
                                                        onPress={() =>
                                                          data.radius_status != 1
                                                            ? console.log("not in radius")
                                                            : data.story == null
                                                              ? this.props.navigation.navigate(
                                                                "ViewUserDeatils",
                                                                {
                                                                  id: data.id,
                                                                  distance: data.distance_show_value,
                                                                  coming: "Home",
                                                                  coming_from: "Home_list",
                                                                }
                                                              )
                                                              : this.listRedirectScreen(
                                                                data.id,
                                                                data.name
                                                              )
                                                        }
                                                      >
                                                        <TouchableOpacity
                                                          onPress={() =>
                                                            data.radius_status != 1 ? this.setState({ outOFTheCircle: true }) : this.props.navigation.navigate(
                                                              "ViewUserDeatils",
                                                              {
                                                                id: data.id,
                                                                distance: data.distance_show_value,
                                                                coming: "Home",
                                                                coming_from: "Home_list",
                                                              }
                                                            )
                                                          }
                                                        >
                                                          <Image
                                                            // blurRadius={data.radius_status ? 0 : 5}
                                                          
                                                            source={{
                                                              uri:
                                                                this.state.photoURL +
                                                                data.profile_image,
                                                            }}
                                                            transition={false}
                                                            style={
                                                              data.radius_status
                                                                ? data.story == null
                                                                  ? style.imageWithoutBoder
                                                                  : style.imageBoderStyle
                                                                : style.imageWithoutBoder
                                                            }
                                                          />
                                                        </TouchableOpacity>
                                                      </TouchableOpacity>
                        
                                                      <TouchableOpacity
                                                        style={{
                                                          marginHorizontal: 14,
                                                          flex: 1,
                                                          justifyContent: "center",
                                                        }}
                                                        onPress={() =>
                                                          data.radius_status != 1 ? this.setState({ outOFTheCircle: true }) : this.props.navigation.navigate(
                                                            "ViewUserDeatils",
                                                            {
                                                              id: data.id,
                                                              distance: data.distance_show_value,
                                                              coming: "Home",
                                                              coming_from: "Home_list",
                                                            }
                                                          )
                                                        }
                                                      >
                                                        <Text
                                                          style={{
                                                            fontSize: 14,
                                                            fontFamily: "Montserrat-Bold",
                                                          }}
                                                        >
                                                          {data.name + ", " + data.age}
                                                        </Text>
                                                        <Text
                                                          style={{
                                                            fontSize: 8,
                                                            fontFamily: "Montserrat-Regular",
                                                          }}
                                                        >
                                                          {data.distance_show_value}
                                                        </Text>
                                                      </TouchableOpacity>
                                                      {data.distance_key < 500 && (
                                                        <View>
                                                          <TouchableOpacity
                                                            disabled={
                                                              data.radius_status == 1 ? false : true
                                                            }
                                                            style={{
                                                              flexDirection: "row",
                                                              alignItems: "center",
                                                            }}
                                                            onPress={() =>
                                                              this.props.navigation.navigate(
                                                                "ViewUserDeatils",
                                                                {
                                                                  id: data.id,
                                                                  distance: data.distance_show_value,
                                                                  coming_from: "Home_map",
                                                                }
                                                              )
                                                            }
                                                          >
                                                            <Image
                                                              source={require("../../../assets/locations/viewIcon.png")}
                                                              style={{
                                                                height: 24,
                                                                width: 24,
                                                                marginRight: 8,
                                                              }}
                                                            />
                                                            <Text
                                                              style={{
                                                                fontSize: 12,
                                                                fontFamily: "Montserrat-Medium",
                                                              }}
                                                            >
                                                              {translate("View")}{" "}
                                                            </Text>
                                                          </TouchableOpacity>
                                                          <TouchableOpacity
                                                            style={{
                                                              flexDirection: "row",
                                                              marginTop: 14,
                                                              alignItems: "center",
                                                            }}
                                                            onPress={() => this.chatScreenRedirect({
                                                              id: data.id,
                                                              name: data.name,
                                                              image:
                                                                this.state.photoURL +
                                                                data.profile_image,
                                                            })}
                        
                                                          >
                                                            {/* <TouchableOpacity style={{ flexDirection: 'row', marginTop: 14, alignItems: 'center' }} onPress={() => alert("Under Maintenance")}> */}
                        
                                                            <Image
                                                              source={require("../../../assets/locations/chatIcon.png")}
                                                              style={{
                                                                height: 24,
                                                                width: 24,
                                                                marginRight: 8,
                                                              }}
                                                            />
                                                            <Text
                                                              style={{
                                                                fontSize: 12,
                                                                fontFamily: "Montserrat-Medium",
                                                              }}
                                                            >
                                                              {translate("Chat")}{" "}
                                                            </Text>
                                                          </TouchableOpacity>
                                                        </View>
                                                      )}
                                                    </View>
                                                    <Text
                                                      style={{
                                                        height:
                                                          this.state.responseData.length - 1 != index ||
                                                            (index + 1) % 6 == 0
                                                            ? 2
                                                            : 0,
                                                        backgroundColor: "white",
                                                        flex: 1,
                                                        marginHorizontal: 16,
                                                        marginBottom:
                                                          this.state.responseData.length - 1 == index
                                                            ? 8
                                                            : 16,
                                                      }}
                                                    ></Text>
                                                    {(index + 1) % 3 == 0 && this.state.subscription == 0 && (
                                                      <>
                                                        <View
                                                          style={{
                                                            alignItems: "center",
                                                            marginBottom: 15,
                                                          }}
                                                        >
                                                          <BannerAd
                                                            // unitId= {"ca-app-pub-3725930665142395/8135550860"}
                                                            unitId={Platform.OS == "ios" ? "ca-app-pub-3725930665142395/8135550860" : "ca-app-pub-3725930665142395/2417471703"}
                                                            size={`${parseInt(
                                                              Dimensions.get("window").width - 70
                                                            )}x80`}
                                                            request={{}}
                                                            onAdLoaded={() => console.log("loaded")}
                                                            onAdFailedToLoad={(e) =>
                                                              console.log("failed to load", e)
                                                            }
                                                            style={{ width: "100%" }}
                                                          />
                                                        </View>
                                                        <Text
                                                          style={{
                                                            height:
                                                              this.state.responseData.length - 1 ==
                                                                index
                                                                ? 0
                                                                : 2,
                                                            backgroundColor: "white",
                                                            flex: 1,
                                                            marginHorizontal: 16,
                                                            marginBottom:
                                                              this.state.responseData.length - 1 ==
                                                                index
                                                                ? 8
                                                                : 16,
                                                          }}
                                                        ></Text>
                                                      </>
                                                    )}
                                                  </React.Fragment>
                       
                      
                      }
                       </>

                    );
                                      }}
                                    />
                  
                  </View>
                )}
              </View>
            )}
        </ImageBackground>
      </>
    );
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

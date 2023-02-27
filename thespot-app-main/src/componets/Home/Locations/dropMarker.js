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
      userProfileImage: "",
      Lat: 0.0,
      Long: 0.0,
      First: true,
      webService: true,
      otherUserStoryData: null,
      dashboardData:[],
      like_view_count: 0,
      drop_pin_status: 0,
      latitudeDelta: 0.018,
      longitudeDelta: 0.001,
      spyMode: 0,
      outOFTheCircle: false,
      permissionState: false,
      subscription_status:0,
    };
    this.mapRef = null;
  }

  async componentDidMount() {
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
    if (Platform.OS == "ios") {
      this.circle.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.4)" });
      this.circle1.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.3)" });
      this.circle2.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
      this.circle3.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
    }
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      Geolocation.getCurrentPosition((info) =>
        this.setState({
          Lat: info.coords.latitude,
          Long: info.coords.longitude,
          outOFTheCircle: false, mapListSwitch: false ,
        })
      );
      this.dashboard();
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

  // componentWillUnmount() {
  //   this._unsubscribe();
  // }

  toggleValueChange = (stateName) => {
    this.setState((previousState) => ({
      ...this.state,
      [stateName]: !previousState[stateName],
    }));
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
    axios
      .post(apiUrl + "dashboard", body)
      .then((response) => {
        setTimeout(() => {
            this.setState({ loading: false })
            this.setState({permissionState: true})
        
        }, 1000)
        // this.setState({ loading: false, webService: false });
        // Toast.show(response.data.message)
        console.log(
          "response.data---------------->",
          response.data.login_user_data.lat
        );
        if (response.data.status == 1) {
          this.setState({dashboardData: response.data.data});
          this.setState({subscription_status: response.data.login_user_data.subscription});
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

  navigateBack = () => {
    this.props.params?.from == "profile" ? this.props.navigation.navigate("Profile") : this.props.navigation.goBack()
    this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Location' }],
    });
}
regionChange = (data) => {
    console.log(data,"Fdsf32432432");
  if (data.latitude === this.state.Lat
      && data.longitude === this.state.Long) {
      return;
  }
  this.setState({Lat: data.latitude, Long: data.longitude, latitudeDelta: data.latitudeDelta, longitudeDelta: data.longitudeDelta})
 
}
confirmLocation(LatSearch,LongSearch) {
    if(this.state.subscription_status == 0){
        this.props.navigation.navigate("Subscription")
        return false;
    }
    
    let body = {
        user_id: this.state.userID,
        lat: LatSearch,
        lng: LongSearch,
        drop_pin_status: 1
    }
    console.log(body,"jainboy");
    axios
        .post(apiUrl + 'update-location', body)
        .then(async (response) => {
            console.log(response);
            // this.setState({ loading: false })
            if (response.data.status == 1) {
                
                 await AsyncStorage.setItem("drop_pin_status", "1");
                 this.navigateBack()
            }
        })
        .catch((erroraa) => {
            this.setState({ loading: false })
            if (erroraa.toJSON().message === 'Network Error') {
                Toast.show('Please check your internet connection')
            }
        });
    
}
_onNavigationStateChange(webViewState){
  console.log(webViewState)
  var initial_url = webViewState.url;
  var url = initial_url.split('?');
  console.log(this.getSearchParams(initial_url))
  console.log(initial_url.includes("?"),"tarun kumar jain");
  if(initial_url.includes("?") == true){
    this.confirmLocation(this.getSearchParams(initial_url).lat,this.getSearchParams(initial_url).lng)
  }
  // 
 
}
 getSearchParams(searchUrl,k){
  var p={};
  var searchUrl = searchUrl;
  searchUrl.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
  return k?p[k]:p;
 }
  render() {
    console.log("laaaaaaaaaattttttt--------->", this.state.spyMode);
    return (
      <>
        {this.state.loading && <Spinner />}

        <ImageBackground style={{ flex: 1, width: null, height: null, backgroundColor: 'white' }}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <View style={{ backgroundColor: 'white' }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
                        <TouchableOpacity onPress={() => this.navigateBack()}>
                            <View style={{ height: 20, width: 50 }}>
                                <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Drop Pin")}</Text>
                        <View style={{ height: 20, width: 50 }}>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000' }}> </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, marginTop: 8, marginBottom: 16, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' }}>
                
                <WebView  onLoad={() => this.setState({loading:false})} onNavigationStateChange={this._onNavigationStateChange.bind(this)} source={{ uri: `https://admin.thespotapplication.com/drop_map/${this.state.userID}/${this.state.Lat}/${this.state.Long}` }} />
                </View>
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
        borderRadius: 24,
        borderWidth: 5,
        borderColor: '#ff5000'
    },
    markerImageWithoutBoderStyle: {
        height: 48,
        width: 48,
        borderRadius: 24
        
    },
    imageBoderStyle: {
        height: 70,
        width: 70,
        borderColor: '#ff5000',
        borderRadius: 35,
        borderWidth: 3
    },
    imageWithoutBoder: {
        height: 70,
        width: 70,
        borderRadius: 35,
    },
    markerFixed: {
        left: '50%',
        marginLeft: -12,
        marginTop: -28,
        position: 'absolute',
        top: '50%'
    },
    marker: {
        height: 37, width: 24
    },
    // markerFixed: {
    //     left: '50%',
    //     marginLeft: -150,
    //     marginTop: -128,
    //     position: 'absolute',
    //     top: '50%',
    //     height:300,
    //     width:300,
    //     borderRadius:300,
    //     borderWidth:1,
    //     borderColor:"rgba(255, 80, 0, 0.5)",
    //     backgroundColor:"rgba(255, 80, 0, 0.4)"
    // },
    // marker: {
    //     height: 37, width: 24,alignSelf:"center",marginTop:120
    // },
})

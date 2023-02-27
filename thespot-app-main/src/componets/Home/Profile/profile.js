import React, { Component } from "react";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";
import Spinner from "../../../helper/spinner";
import Toast from "react-native-simple-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import { AuthContext } from "../../../navigations/context";
import { CommonActions } from "@react-navigation/native";

import { translate } from "../../../helper/translationHelper";
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default class Profile extends Component {
  static contextType = AuthContext;
  constructor(props) {
    super(props);
    this.state = {
      name: "Default",
      age: "0",
      image: "",
      photoURL: "",
      response: "",
      loading: false,
      status: 0,
      color: "",
      latLoc: 0,
      longLoc: 0,
      subscription: 0,
    };
  }

  async componentDidMount() {
    this.setState({ userID: await AsyncStorage.getItem("userID") }, () => {
      this.getProfile();
    });
    this._unsubscribe = this.props.navigation.addListener("focus", async () => {
      this.getProfile(); // this block will call when user come back
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  modelVisible(value) {
    this.setState({ blockModel: value });
  }

  async componentDidUpdate() {
    this.checkLoginStatus(this.state.userID);
  }

  checkLoginStatus = (userId) => {
    if (userId) {
      let body = { user_id: userId };

      axios
        .post(apiUrl + "login-status", body)
        .then((response) => {
          console.log("THIS IS RESPONSE DATE", response.data);

          if (response.data.status == 1) {
          } else if (response.data.status == 10) {
            this.context.signOut();
            Toast.show(response.data.message);
          }
        })
        .catch((erroraa) => {
          console.log("ERROR FOR HERE", erroraa);

          if (erroraa.toJSON().message === "Network Error") {
            Toast.show("Please check your internet connection");
          }
        });
    }
  };

  getProfile() {
    this.setState({ loading: true });
    let body = {
      user_id: this.state.userID,
      detail_user_id: this.state.userID,
    };
    axios
      .post(apiUrl + "user_detail", body)
      .then(async (response) => {
        console.log("ccccccccccccccccccccccc----->", response);
        this.setState({ loading: false });
        if (response.data.status == 1) {
          let filterdImage = response.data.data.images.filter((image) => image);
          this.setState({
            name: response.data.data.name,
            subscription: response.data.data.subscription,
            age: response.data.data.age,
            status: response.data.data.user_detail.spy_mode,
            photoURL: response.data.profile_url,
            latLoc: response.data.data.lat,
            longLoc: response.data.data.lng,
            image:
              filterdImage.length > 0 && filterdImage[0]
                ? filterdImage[0]
                : null,
            response: response.data,
          });
        }
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show("Please check your internet connection");
        }
      });
  }
  spyMode(status = "") {
    this.setState({ loading: true });
    let body = { user_id: this.state.userID, status: status };
    console.log("bofgjlkdfhgkha;lfhfgh;hfg;dsflkjghf;jgh;sfgh", body);
    axios
      .post(apiUrl + "spymode", body)
      .then(async (response) => {
        console.log("11111111----->", response);
        this.setState({ loading: false });
        if (response.data.status == 1) {
          // alert(response.data.message)
          this.getProfile();
        }
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show("Please check your internet connection");
        }
      });
  }

  render() {
    console.log(this.state.latLoc, "Gfdger3453643");
    return (
      <>
        {this.state.loading && <Spinner />}
        <ImageBackground style={{ flex: 1, width: null, height: null }}>
          <SafeAreaView style={{ backgroundColor: "white" }} />
          <ScrollView style={{ backgroundColor: "#F3F4F7" }}>
            <View
              style={{
                flexShrink: 1,
                transform: [{ scaleX: 2 }],
                borderBottomStartRadius: 200,
                borderBottomEndRadius: 200,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  alignItems: "center",
                  transform: [{ scaleX: 0.5 }],
                  overflow: "hidden",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    this.props.navigation.navigate("ViewUserDeatils", {
                      id: this.state.userID,
                      distance: this.state.name,
                      coming: "Profile",
                    })
                  }
                >
                  <Image
                    source={
                      !this.state.image
                        ? { uri: this.state.photoURL + "no_image.jpg" }
                        : { uri: this.state.photoURL + this.state.image }
                    }
                    style={{
                      height: 210,
                      width: 210,
                      marginTop: 36,
                      borderRadius: 105,
                    }}
                  />
                </TouchableOpacity>
                <View style={{ flexDirection: "row", marginTop: 16 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      fontFamily: "Montserrat-Bold",
                    }}
                  >
                    {this.state.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "gray",
                      fontFamily: "Montserrat-Regular",
                      marginLeft: 5,
                    }}
                  >
                    {this.state.age}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 40,
                    marginBottom: 60,
                  }}
                >
                  <TouchableOpacity
                    style={{ alignItems: "center", marginRight: 60 }}
                    onPress={() =>
                      this.props.navigation.navigate("EditSetting", {
                        response: this.state.response,
                      })
                    }
                  >
                    <Image
                      source={require("../../../assets/home/settings.png")}
                      style={{ height: 60, width: 60 }}
                    />
                    <Text
                      style={{
                        fontSize: 9,
                        color: "gray",
                        marginTop: 8,
                        fontFamily: "Montserrat-Bold",
                      }}
                    >
                      {translate("SETTINGS")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ alignItems: "center" }}
                    onPress={() =>
                      this.props.navigation.navigate("EditInfo", {
                        response: this.state.response,
                      })
                    }
                  >
                    <Image
                      source={require("../../../assets/home/editInfo.png")}
                      style={{ height: 60, width: 60 }}
                    />
                    <Text
                      style={{
                        fontSize: 9,
                        color: "gray",
                        marginTop: 8,
                        fontFamily: "Montserrat-Bold",
                      }}
                    >
                      {translate("EDIT INFO")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {this.state.subscription == 0 ? (
              <View
                style={{
                  flexDirection: "row",
                  width: Dimensions.get("window").width,
                  marginTop: 24,
                  justifyContent: "space-between",
                  padding: 30,
                }}
              >
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() =>
                    this.props.navigation.navigate("DropMarker", {
                      from: "profile",
                      latLoc: this.state.latLoc,
                      longLoc: this.state.longLoc,
                    })
                  }
                >
                  <Image
                    source={require("../../../assets/home/dropPin.png")}
                    style={style.fourImageStyle}
                  />
                  <Text style={style.lastFourText}>
                    {translate("Drop Pin")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() => this.props.navigation.navigate("Subscription")}
                >
                  <Image
                    source={require("../../../assets/home/unlimitedChat.png")}
                    style={style.fourImageStyle}
                  />
                  <Text style={style.lastFourText}>
                    {translate("Unlimited Chats")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() => this.props.navigation.navigate("Subscription")}
                >
                  <Image
                    source={require("../../../assets/home/hideAds.png")}
                    style={style.fourImageStyle}
                  />
                  <Text style={style.lastFourText}>
                    {translate("Hide Ads")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ alignItems: "center", marginRight: 16 }}
                  onPress={() => this.props.navigation.navigate("Subscription")}
                >
                  <Image
                    source={require("../../../assets/home/spyMode.png")}
                    style={{ height: 44, width: 44 }}
                  />
                  <Text style={style.lastFourText}>
                    {translate("Spy Mode")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
            {this.state.subscription == 1 ? (
              <View
                style={{
                  flexDirection: "row",
                  width: Dimensions.get("window").width,
                  marginTop: 66,
                  alignSelf: "center",
                  justifyContent: "center",
                }}
              >
                <TouchableOpacity
                  style={{ alignItems: "center" }}
                  onPress={() =>
                    this.props.navigation.navigate("DropMarker", {
                      from: "profile",
                      latLoc: this.state.latLoc,
                      longLoc: this.state.longLoc,
                    })
                  }
                >
                  <Image
                    source={require("../../../assets/home/dropPin.png")}
                    style={{ height: 66.17, width: 66.17 }}
                  />
                  <Text
                    style={{
                      textAlign: "center",
                      fontSize: 12,

                      marginTop: 8,
                      fontFamily: "Montserrat-Bold",
                    }}
                  >
                    {translate("Drop")}
                    {"\n"}
                    {translate("Pin")}
                    {/* {translate("Drop Pin")} */}
                  </Text>
                </TouchableOpacity>
                {this.state.status == 1 ? (
                  <TouchableOpacity
                    style={{ alignItems: "center", marginLeft: 60 }}
                    onPress={() => this.spyMode(0)}
                  >
                    <Image
                      source={require("../../../assets/welcome/spy.png")}
                      style={{ height: 66.17, width: 66.17 }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 12,

                        marginTop: 8,
                        fontFamily: "Montserrat-Bold",
                      }}
                    >
                      {translate("Spy")}
                      {"\n"}
                      {translate("Mode")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
                {this.state.status == 0 ? (
                  <TouchableOpacity
                    style={{ alignItems: "center", marginLeft: 60 }}
                    onPress={() => this.spyMode(1)}
                  >
                    <Image
                      source={require("../../../assets/home/spyMode.png")}
                      style={{ height: 66.17, width: 66.17 }}
                    />
                    <Text
                      style={{
                        textAlign: "center",
                        fontSize: 12,

                        marginTop: 8,
                        fontFamily: "Montserrat-Bold",
                      }}
                    >
                      {translate("Spy")}
                      {"\n"}
                      {translate("Mode")}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
            {this.state.subscription == 0 ? (
              <TouchableOpacity
                style={{
                  marginVertical: 45,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.34,
                  shadowRadius: 6.27,
                  elevation: 10,
                }}
                onPress={() => this.props.navigation.navigate("Subscription")}
              >
                <ImageBackground
                  source={require("../../../assets/btnBackground.png")}
                  resizeMode={"stretch"}
                  style={{
                    height: 42,
                    elevation: 10,
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      alignSelf: "center",
                      marginHorizontal: 30,
                      marginVertical: 10,
                      fontFamily: "Montserrat-Bold",
                    }}
                  >
                    {translate("The Premium Spot")}
                  </Text>
                </ImageBackground>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
          {/* {this.state.blockModel && <Modal isVisible={this.state.blockModel} animationIn={'fadeIn'} coverScreen={true} useNativeDriver={true} style={{ justifyContent: 'flex-start', margin: 0, marginTop: 36 }} onBackdropPress={() => this.modelVisible(false)}>
                        <View style={{ flexShrink: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Image source={this.state.image == null ? require('../../../assets/home/placholder.png') : { uri: this.state.photoURL + this.state.image }} style={{ height: 280, width: 280, borderRadius: 140 }}></Image>
                        </View>
                    </Modal>} */}
        </ImageBackground>
      </>
    );
  }
}

const style = StyleSheet.create({
  lastFourText: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 8,
    fontFamily: "Montserrat-Bold",
  },
  fourImageStyle: {
    height: 44,
    width: 44,
  },
});

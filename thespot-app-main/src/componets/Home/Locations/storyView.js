import React, { Component } from "react";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";
import Spinner from "../../../helper/spinner";
import Toast from "react-native-simple-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Video from "react-native-video";

import Carousel, { Pagination } from "react-native-snap-carousel";

import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";

import { translate } from "../../../helper/translationHelper";

export default class StoryView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      renderImage: "",
      loading: false,
      userID: "",
      vedioURL: "",
      otherUserStoryId: "",
      userName: "",
      storyID: "",
      entries: [],
      baseUrl: "",
      activeSlide: 0,
    };
  }

  async componentDidMount() {
    this.setState({ userID: await AsyncStorage.getItem("userID") }, () => {
      console.log(this.state.userID);
    });
    let { storyId, name } = this.props.route.params;
    this.setState({ otherUserStoryId: storyId, userName: name }, () => {
      this.onStoryDetails();
    });
  }

  onStoryDetails() {
    this.setState({ loading: true });
    let body = {
      user_id: this.state.userID,
      story_user_id: this.state.otherUserStoryId,
    };
    axios
      .post(apiUrl + "stories-detail", body)
      .then((response) => {
        this.setState({ loading: false });
        if (response.data.status == 1) {
          this.setState({
            baseUrl: response.data.url,
            entries: response.data.data,
          });
        }
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show(translate("Please check your internet connection"));
        }
      });
  }

  onStoryView() {
    this.setState({ loading: true });
    let body = { user_id: this.state.userID, story_id: this.state.storyID };
    console.log(body);
    axios
      .post(apiUrl + "increase-stories-views", body)
      .then((response) => {
        this.setState({ loading: false });
        // Toast.show(response.data.message)
        if (response.data.status == 1) {
        }
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show(translate("Please check your internet connection"));
        }
      });
  }

  _renderItem = ({ item, index }) => {
    let ViewJsx = (
      <ImageBackground
        source={{ uri: this.state.baseUrl + item.story }}
        style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}
      ></ImageBackground>
    );
    let ext = item.story.split(".")[1];

    if (ext == "MOV" || ext == "mov" || ext == "mp4") {
      ViewJsx = (
        <Video
          source={{ uri: this.state.baseUrl + item.story }}
          style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}
          muted={true}
          repeat={true}
          volume={4}
          resizeMode={"cover"}
          rate={1.0}
          ignoreSilentSwitch={"obey"}
        />
      );
    }

    return <>{ViewJsx}</>;
  };

  render() {
    return (
      <>
        {this.state.loading && <Spinner />}
        <ImageBackground
          style={{
            flex: 1,
            width: null,
            height: null,
            justifyContent: "center",
          }}
        >
          <SafeAreaView style={{ flexGrow: 0 }} />
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              flexShrink: 1,
              marginHorizontal: 16,
              marginTop: 16,
              marginBottom: 10,
              alignItems: "center",
              width: "90%",
            }}
          >
            <TouchableOpacity onPress={() =>  this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Location' }],
    })}>
              <Image
                source={require("../../../assets/chat/backGray.png")}
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate("ViewUserDeatils", {
                  id: this.state.otherUserStoryId,
                })
              }
            >
              <Text
                style={{ fontSize: 15, fontWeight: "800", color: "#f76128",marginRight:10 }}
              >
                {this.state.userName + "'s " + translate("Story")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={{ fontSize: 15, fontWeight: "700", color: "#f76128" }}
              ></Text>
            </TouchableOpacity>
            
          </View>
          <View
            style={{
              flex: 1,
              marginHorizontal: 16,
              marginBottom: 16,
              marginTop: 6,
            }}
          >
            {/* {this.state.vedioURL != '' &&
                            <Video
                                source={{ uri: this.state.vedioURL }}
                                style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}
                                muted={true}
                                repeat={true}
                                volume={4}
                                resizeMode={"cover"}
                                rate={1.0}
                                ignoreSilentSwitch={"obey"}
                            />}
                        {this.state.vedioURL == '' &&
                            <ImageBackground source={this.state.renderImage == '' ? '' : { uri: this.state.renderImage }} style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                            </ImageBackground>} */}

            <Carousel
              data={this.state.entries}
              renderItem={this._renderItem}
              sliderWidth={Dimensions.get("window").width - 36}
              itemWidth={Dimensions.get("window").width - 36}
              layout={"tinder"}
              layoutCardOffset={`9`}
              style={{ borderWidth: 2 }}
              onSnapToItem={(index) => this.setState({ activeSlide: index })}
            />
            {this.state.entries.length == 1 ? (
              <Pagination
                dotsLength={2}
                activeDotIndex={this.state.activeSlide}
                containerStyle={{
                  backgroundColor: "transparent",
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  paddingTop: 10,
                }}
                dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 14,
                  backgroundColor: "white",
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            ) : null}
            {this.state.entries.length > 1 ? (
              <Pagination
                dotsLength={this.state.entries.length}
                activeDotIndex={this.state.activeSlide}
                containerStyle={{
                  backgroundColor: "transparent",
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  paddingTop: 10,
                }}
                dotStyle={{
                  width: 10,
                  height: 10,
                  borderRadius: 14,
                  backgroundColor: "#1d2b53",
                }}
                inactiveDotOpacity={0.4}
                inactiveDotScale={0.6}
              />
            ) : null}
          </View>
        </ImageBackground>
      </>
    );
  }
}

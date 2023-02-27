import React, { Component } from "react";
import ImagePicker from "react-native-image-picker";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";
import Spinner from "../../../helper/spinner";
import Toast from "react-native-simple-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Modal from "react-native-modal";
import Video from "react-native-video";
import ActionSheet from "react-native-actionsheet";
import Carousel, { Pagination } from "react-native-snap-carousel";
import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";

import { translate } from "../../../helper/translationHelper";

export default class StoryWithViewButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileUri: "",
      renderImage: "",
      uploadingFile: false,
      loading: false,
      userID: "",
      ImageModel: false,
      vedioURL: "",
      storyStatus: 1,
      storySaveStatus: false,
      SeenModel: false,
      storyID: "",
      viewRespnoseData: [],
      viewPhotoURL: "",
      entries: [],
      baseUrl: "",
      activeSlide: 0,
      file: "",
    };
  }

  async componentDidMount() {
    this.setState({ userID: await AsyncStorage.getItem("userID") }, () => {
      this.onStoryDetails();
    });
  }

  showActionSheet = () => {
    this.ActionSheet.show();
  };

  chooseImage = () => {
    console.log("storystatus------>",this.state.storySaveStatus)
    let options = {
      title: translate("Select Image"),
      mediaType: "mixed",
      durationLimit: 10,
      maxHeight: 2000,
      maxWidth: 2000,
      videoQuality: "medium",
      storageOptions: {
        skipBackup: true,
        path: "images",
        cameraRoll: this.state.storySaveStatus,
      },
    };

    if (Platform.OS == "android") {
      this.showActionSheet();
    } else {
      this.openCamera(options);
    }
  };

  openCamera(options) {
    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.customButton) {
        console.log("User tapped custom button: ", response.customButton);
      } else {
        let uriSplit = response.uri.split(".");
        let ext = uriSplit[uriSplit.length - 1];

        this.setState({ file: response });
        ``;
        console.log("REsponseoids ------>", response);

        if (ext == "MOV" || ext == "mp4" || ext == "mov") {
          // vedio call
          this.setState({
            vedioURL: response.uri,
            fileUri: "",
            renderImage: "",
          });
          this.setState({ uploadingFile: true });
        } else {
          // camera call
          this.setState(
            {
              fileUri: Platform.OS === "android" ? response.path : response.uri,
              renderImage: response.uri,
              vedioURL: "",
            },
            () => {
              // Toast.show('Photo is saved in gallery')
              // api call
            }
          );
          this.setState({ uploadingFile: true });
        }
      }
    });
  }

  onActionSheetPress(index) {
    let options = {
      title: translate("Select Image"),
      mediaType: "mixed",
      durationLimit: 10,
      maxHeight: 2000,
      maxWidth: 2000,
      videoQuality: "medium",
      storageOptions: {
        skipBackup: true,
        path: "images",
        cameraRoll:this.state.storySaveStatus,
      },
    };

    if (index == 0) {
      options.mediaType = "photo";
      this.openCamera(options);
    } else if (index == 1) {
      options.mediaType = "video";
      this.openCamera(options);
    } else {
    }
  }

  onStoryDetails() {
    this.setState({ loading: true });
    let body = { user_id: this.state.userID, story_user_id: this.state.userID };
    console.log("storyDetail------------------------>", body);
    axios
      .post(apiUrl + "stories-detail", body)
      .then((response) => {
        if (response.data.status == 1) {
          this.setState({
            baseUrl: response.data.url,
            entries: response.data.data,
          });
          // if (response.data.data.story.split('.').pop() == 'MOV') {
          //     this.setState({ vedioURL: response.data.url + response.data.data.story })
          // } else {
          //     // this.setState({ renderImage: response.data.url + response.data.data.story })
          // }
          this.setState(
            {
              storyStatus: response.data.story_status,
              storySaveStatus:
                response.data.story_save_status == 0 ? false : true,
              storyID: response.data.data[0].id,
            },
            () => {
              this.onViewsList();
            }
          );
        }
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show(translate("Please check your internet connection"));
        }
      });
  }

  onDeleteButton(id) {
    Alert.alert(
      translate("Delete Story"),
      translate("Are you sure_You want to delete your story"),
      [
        {
          text: translate("Cancel"),
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: translate("Delete"),
          onPress: () => {
            this.setState({ loading: true });
            let body = { user_id: this.state.userID, story_id: id };
            axios
              .post(apiUrl + "delete-story", body)
              .then((response) => {
                if (response.data?.data.length < 1) {
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                });
                }

                this.setState({ loading: false });
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                  this.setState({
                    entries: response.data.data,
                    vedioURL: "",
                    renderImage: "",
                  });
                }
              })
              .catch((erroraa) => {
                this.setState({ loading: false });
                if (erroraa.toJSON().message === "Network Error") {
                  Toast.show(
                    translate("Please check your internet connection")
                  );
                }
              });
          },
        },
      ]
    );
  }

  onViewsList() {
    let body = { user_id: this.state.userID, story_id: this.state.storyID };

    axios
      .post(apiUrl + "stories-view-list", body)
      .then((response) => {
        if (response.data.status == 1) {
          this.setState({
            viewRespnoseData: response.data.data,
            viewPhotoURL: response.data.profile_url,
          });
        }
        console.log(response.data);
      })
      .catch((erroraa) => {
        this.setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show(translate("Please check your internet connection"));
        } else {
          Toast.show(erroraa.toJSON().message);
        }
      });
  }
  onImageUpload = () => {
    if (this.state.fileUri != "" || this.state.vedioURL != "") {
      this.setState({ loading: true });
      const formData = new FormData();
      formData.append("user_id", this.state.userID);
      formData.append("access_status", this.state.storyStatus); // 1 = everyone, 2 => only chat
      formData.append("description", "new upload");

      if (this.state.vedioURL != "") {
        let uriSplit = this.state.vedioURL.split(".");
        let ext = uriSplit[uriSplit.length - 1];

        formData.append("story", {
          uri: this.state.vedioURL,
          type: ext,
          name: this.state.vedioURL.split("/").pop(),
        });
      } else {
        console.log("Sendig file image type ---->", {
          uri:
            Platform.OS === "android"
              ? "file://" + this.state.fileUri
              : this.state.fileUri,
          type: "image/jpeg",
          name: this.state.fileUri.split("/").pop(),
        });

        formData.append("story", {
          uri:
            Platform.OS === "android"
              ? "file://" + this.state.fileUri
              : this.state.fileUri,
          type: "image/jpeg",
          name: this.state.fileUri.split("/").pop(),
        });
      }

      axios({
        url: apiUrl + "upload-status",
        method: "POST",
        data: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      })
        .then((response) => {
          console.log("Response ----> Upload", response.data);

          this.setState({ loading: false });
          // Toast.show(response.data.message)
          if (response.data.status == 1) {
            this.setState({
              entries: response.data.data,
              vedioURL: "",
              renderImage: "",
            });
            // this.props.navigation.navigate('LocationAccess')
          }
          this.setState({ uploadingFile: false });
        })
        .catch((erroraa) => {
          this.setState({ loading: false });
          if (erroraa.toJSON().message === "Network Error") {
            Toast.show(translate("Please check your internet connection"));
          }
          this.setState({ uploadingFile: false });
        });
    } else {
      this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                });
    }
  };

  modelVisible(value) {
    this.setState({ SeenModel: value }, () => {
      if (this.state.SeenModel) {
        this.onViewsList();
      }
    });
  }
  profileRedirection(user_id) {
    this.setState({ SeenModel: false }, () => {
      this.props.navigation.navigate("ViewUserDeatils", { id: user_id });
    });
  }

  _renderItem = ({ item, index }) => {
    let ViewJsx = (
      <ImageBackground
        source={{ uri: this.state.baseUrl + item.story }}
        style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}
        onLoadStart={() => this.setState({ loading: true })}
        onLoadEnd={() => this.setState({ loading: false })}
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
          // onLoadStart={() => this.setState({ loading: true })} onEnd={() => this.setState({ loading: false })}
        />
      );
    }

    return (
      <>
        <View
          style={{
            height: 40,
            justifyContent: "space-between",
            zIndex: 999,
            alignItems: "center",
            flexDirection: "row",
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={{ marginLeft: 16 }}
            onPress={() => this.onDeleteButton(item.id)}
          >
            <Image
              source={require("../../../assets/home/delete.png")}
              style={{ width: 28, height: 28, marginTop: 6 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => this.chooseImage()}
            style={{ width: 50 }}
          >
            <Image
              source={require("../../../assets/locations/plusWhite.png")}
              style={{ width: 34, height: 34, marginTop: 6, paddingLeft: -20 }}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Image style={{ width: 28, height: 28, marginTop: 6 }} />
          </TouchableOpacity>
        </View>
        {ViewJsx}
      </>
    );
  };

  returnStoryView = () => {
    if (this.state.vedioURL == "" && this.state.renderImage == "") {
      return (
        <>
          {this.state.entries && (
            <>
              <Carousel
                data={this.state.entries}
                renderItem={this._renderItem}
                sliderWidth={Dimensions.get("window").width - 36}
                itemWidth={Dimensions.get("window").width - 36}
                // layout={'tinder'}
                layoutCardOffset={`9`}
                style={{ borderWidth: 2 }}
                onSnapToItem={(index) => this.setState({ activeSlide: index })}
                useNativeDriver
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

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  position: "absolute",
                  bottom: 30,
                  width: "91%",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    this.state.viewRespnoseData.length != 0
                      ? this.modelVisible(true)
                      : console.log("No views yet")
                  }
                >
                  <Image
                    source={require("../../../assets/locations/seen_by.png")}
                    style={{ width: 32, height: 53 }}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      );
      // }else if(this.state.renderImage != "" && this.state.file.path.split(".")) {
    } else if (this.state.renderImage != "") {
      console.log("hgghfjgjhg0", this.state.renderImage);
      return (
        <Image
          source={{ uri: this.state.renderImage }}
          style={{
            height: Dimensions.get("window").height - 120,
            width: Dimensions.get("window").width - 36,
            borderRadius: 8,
            overflow: "hidden",
          }}
        />
      );
    } else if (this.state.vedioURL != "") {
      return (
        <Video
          source={{ uri: this.state.vedioURL }}
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
  };

  render() {
    return (
      <>
        <ActionSheet
          ref={(o) => (this.ActionSheet = o)}
          title={translate("What type of story do you want to upload")}
          options={[
            translate("Take Photo"),
            translate("Take Video"),
            translate("Cancel"),
          ]}
          cancelButtonIndex={2}
          destructiveButtonIndex={1}
          onPress={(index) => this.onActionSheetPress(index)}
        />

        {/* {this.state.loading && <Spinner />} */}
        <ImageBackground
          style={{
            flex: 1,
            width: null,
            height: null,
            backgroundColor: "white",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SafeAreaView style={{ flexGrow: 0, backgroundColor: "white" }} />
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              alignItems: "center",
              width: "90%",
              height: 40,
              marginTop: "2%",
            }}
          >
            <TouchableOpacity onPress={() => this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Location' }],
    })}>
              <Image
                source={require("../../../assets/chat/backGray.png")}
                style={{ height: 24, width: 24 }}
              />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 13,
                fontFamily: "Montserrat-Bold",
                color: "#FF5000",
                marginLeft: 9,
              }}
            >
              {translate("Edit Your Story")}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (!this.state.uploadingFile) {
                  this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                });
                } else {
                  this.onImageUpload();
                }
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: "Montserrat-Bold",
                  color: "#FF5000",
                }}
              >
                {!this.state.uploadingFile
                  ? translate("Close")
                  : translate("Post")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginTop: "1%", marginBottom: "3%" }}>
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

                        {this.state.vedioURL == '' && this.state.renderImage != "" &&
                            <ImageBackground source={this.state.renderImage != "" ? { uri: this.state.renderImage } : require('../../../assets/home/story.png')} style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                            </ImageBackground>} */}
            {/* <Image source={{ uri: this.state.renderImage }} style={{ flex: 1}}></Image> */}
            {this.returnStoryView()}
          </View>
        </ImageBackground>
        {this.state.SeenModel && (
          <Modal
            isVisible={this.state.SeenModel}
            coverScreen={true}
            useNativeDriver={true}
            style={{
              justifyContent: "flex-end",
              margin: 0,
              marginTop: 200,
              marginHorizontal: 30,
              marginBottom: 33,
            }}
            onBackdropPress={() => this.modelVisible(false)}
            backdropOpacity={0}
          >
            <View
              style={{
                flexShrink: 1,
                backgroundColor: "rgba(255,255,255, 0.9)",
                borderTopRightRadius: 14,
                borderTopLeftRadius: 14,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontFamily: "Montserrat-Bold",
                  color: "#FF3B00",
                  marginVertical: 10,
                  textAlign: "center",
                }}
              >
                {translate("Who Viewed Your Story")}
              </Text>
              <Text
                style={{ backgroundColor: "gray", height: 0.5, width: "100%" }}
              ></Text>
              <ScrollView>
                {/* {this.state.viewRespnoseData.length != 0 && <> */}
                {this.state.viewRespnoseData.map((data, index) => {
                  return (
                    <TouchableOpacity
                      style={{
                        flexGrow: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        marginTop: 8,
                        marginBottom:
                          this.state.viewRespnoseData.length - 1 == index
                            ? 30
                            : 8,
                        marginHorizontal: 8,
                      }}
                      onPress={() => {
                        this.profileRedirection(data.user_id);
                      }}
                    >
                      <Image
                        source={{
                          uri: this.state.viewPhotoURL + data.profile_image,
                        }}
                        style={{
                          height: 60,
                          width: 60,
                          borderRadius: 30,
                          marginHorizontal: 8,
                        }}
                      />
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontFamily: "Montserrat-Bold",
                          }}
                        >
                          {data.name}
                        </Text>
                        {/* <Text style={{ fontSize: 12, marginTop: 2, color: 'gray' }}>5 meter away</Text> */}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {/* </>} */}
              </ScrollView>
              {/* <View style={{ height: 3, paddingHorizontal: 20 }}>
                            <Image source={require("../../../assets/btnBackground.png")} style={{ height: 3, width: "100%" }} />
                        </View> */}
            </View>
          </Modal>
        )}
      </>
    );
  }
}

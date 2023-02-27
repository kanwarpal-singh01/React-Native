import React, { useContext, useEffect, useState } from "react";
import Spinner from "../../../helper/spinner";
import Toast from "react-native-simple-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../../../navigations/context";
import useCallApi from "../../../helper/useApiCall";
import { translate } from "../../../helper/translationHelper";
import { SwipeListView } from "react-native-swipe-list-view";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";

import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  StyleSheet,
} from "react-native";

const Chat = ({ navigation }) => {
  const authContext = useContext(AuthContext);
  const [userId, setUserId] = useState(0);
  const [searchBoxClose, setSearchBoxClose] = useState(false);
  const [search, setSearch] = useState("");
  const {
    call: callChatListApi,
    data: chatList,
    loading: chatListLoading,
  } = useCallApi("chat-lists");
  const {
    call: checkLoginStatus,
    data: loginStatusData,
    loading: loginLoading,
  } = useCallApi("login-status");
  useFocusEffect(
    React.useCallback(() => {
      callChatListApi({ user_id: userId });
    }, [userId])
  );
  useEffect(() => {
    async function getAsyncData() {
      let user_id = await AsyncStorage.getItem("userID");
      callChatListApi({ user_id });
      setUserId(user_id);

      // Login Check for status
      let loginCheck = await checkLoginStatus({ user_id });
      if (loginCheck.data.status == 10) {
        authContext.signOut();
        Toast.show(loginCheck.data.message);
      }
      //--------------------->
    }

    getAsyncData();
  }, []);

  const onChange = (name, value) => {
    //setSearch(value);
    callChatListApi({ user_id: userId, search: value });
    // callChatListApi()
  };

  const onSearchSubmit = () => {
    callChatListApi({ user_id: userId, search: search });
  };

  const searchBoxCloseFn = () => {
    setSearchBoxClose(false);
    setSearch("");
    callChatListApi({ user_id: userId });
    Keyboard.dismiss();
  };

  const renderHiddenItem = (data, rowMap) => (
    <TouchableOpacity
      style={[styles.backRightBtn, styles.backRightBtnRight]}
      onPress={() => deletChat(data.item.room)}
    >
      <Text style={styles.backTextWhite}>Delete</Text>
    </TouchableOpacity>
  );

  const deletChat = (room_id) => {
    let body = { room_id: room_id };
    console.log("bofgjlkdfhgkha;lfhfgh;hfg;dsflkjghf;jgh;sfgh", body);
    axios
      .post(apiUrl + "deleteChatByRoom", body)
      .then(async (response) => {
        console.log("11111111----->", response);

        callChatListApi({ user_id: userId });
      })
      .catch((erroraa) => {
        setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show("Please check your internet connection");
        }
      });
  };

  return (
    <>
      {chatListLoading || loginLoading}
      <SafeAreaView style={{ backgroundColor: "white" }} />
      <View style={{ backgroundColor: "white" }}>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Montserrat-Bold",
              color: "#FF5000",
              marginLeft: 16,
              marginRight: 14,
            }}
          >
            {translate("Your Messages")}
          </Text>
          <View
            style={{
              borderRadius: 16,
              backgroundColor: "#f2f2f6",
              flex: 1,
              marginRight: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <TouchableOpacity>
              <Image
                source={require("../../../assets/chat/searchIcon.png")}
                style={{ height: 24, width: 24, marginLeft: 4 }}
              />
            </TouchableOpacity>

            <TextInput
              style={{ fontSize: 16, padding: 6, flex: 1 }}
              onChangeText={(text) => onChange("password", text)}
            ></TextInput>
            {searchBoxClose && (
              <TouchableOpacity
                style={{ marginHorizontal: 6 }}
                onPress={() => searchBoxCloseFn()}
              >
                <Image
                  source={require("../../../assets/home/blackClose.png")}
                  style={{ height: 14, width: 14 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      {chatList?.data != null && chatList.data.data.length == 0 && (
        <View style={{ flex: 1, backgroundColor: "white" }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#f2f2f6",
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              source={require("../../../assets/grayss.png")}
              style={{ height: 43, width: 27 }}
            />
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Montserrat-Bold",
                color: "#FF5000",
                fontSize: 14,
                marginTop: 16,
              }}
            >
              {translate("NO CHATS YET")}
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
              {translate("Open your Spot to chat with people nearby")}
            </Text>
          </View>
        </View>
      )}
      {chatList?.data != null && chatList.data.data.length > 0 && (
        <ScrollView style={{ backgroundColor: "white", height: "100%" }}>
          <View
            style={{
              backgroundColor: "#F1F1F1",
              marginHorizontal: 16,
              flex: 1,
              marginBottom: 80,
              borderRadius: 8,
            }}
          >
            <SwipeListView
              data={chatList.data.data}
              renderHiddenItem={renderHiddenItem}
              rightOpenValue={-90}
              previewRowKey={"0"}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              renderItem={(post, index) => {
                const chat = post.item;
                let myId =
                  chat?.receiver_id == userId
                    ? chat?.sender_id
                    : chat?.receiver_id;
                let storyColor = "white";
                if (chat?.story_status > 0) {
                  storyColor = "#ff5000";
                }
                return (
                  <View
                    key={myId}
                    style={{
                      flexDirection: "row",
                      width: "97%",
                      marginHorizontal: 16,
                      marginVertical: 16,
                      backgroundColor: "#F1F1F1",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ChatScreen", {
                          id: myId,
                          name: chat?.name,
                          image:
                            chatList?.data?.profile_url + chat?.profile_image,
                        })
                      }
                    >
                      <Image
                        source={{
                          uri:
                            chatList?.data?.profile_url + chat?.profile_image,
                        }}
                        style={{
                          height: 80,
                          width: 80,
                          borderColor: storyColor,
                          borderRadius: 40,
                          borderWidth: 5,
                        }}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        marginHorizontal: 14,
                        flex: 1,
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        navigation.navigate("ChatScreen", {
                          id: myId,
                          name: chat?.name,
                          image:
                            chatList?.data?.profile_url + chat?.profile_image,
                        })
                      }
                    >
                      <Text
                        style={{ fontSize: 19, fontFamily: "Montserrat-Bold" }}
                      >
                        {chat.name}
                      </Text>
                      {chat.chat_status == "Pending" &&
                      userId == chat.receiver_id ? (
                        <View
                          style={{
                            height: 20,
                            backgroundColor: "#FF5000",
                            width: 150,
                            marginRight: 12,
                            borderRadius: 10,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              fontFamily: "Montserrat-Bold",
                              color: "white",
                              overflow: "hidden",
                            }}
                          >
                            Wants to chat with you
                          </Text>
                        </View>
                      ) : null}

                      {chat.chat_status != "Pending" ? (
                        <Text
                          style={{
                            fontSize: 9,
                            fontFamily: "Montserrat-Regular",
                          }}
                        >
                          {chat?.last_message}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                    {chat?.last_sender_id &&
                    chat?.last_sender_id != userId &&
                    chat.chat_status != "Pending" ? (
                      <View
                        style={{
                          height: 20,
                          backgroundColor: "#FF5000",
                          width: 70,
                          marginRight: 12,
                          borderRadius: 10,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontFamily: "Montserrat-Bold",
                            color: "white",
                            overflow: "hidden",
                          }}
                        >
                          {translate("Your Turn")}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              }}
              // renderHiddenItem={ (chat, rowMap) => (

              //     <View style={{height:75,marginTop:"4.5%"}} >

              // <TouchableOpacity
              //     style={[styles.backRightBtn, styles.backRightBtnRight]}
              //     onPress={() => deleteRow(rowMap, data.item.key)}
              // >
              //     <Text style={styles.backTextWhite}>Delete</Text>
              // </TouchableOpacity>
              //     </View>
              // )}
            />

            {/* {
                        chatList?.data?.data.map(chat => {
                            let myId = chat?.receiver_id == userId ? chat?.sender_id : chat?.receiver_id;
                           console.log("myyyyyyyy",myId)
                            return (
                                <TouchableOpacity key={myId} style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 16, alignItems: 'center' }} onPress={() => navigation.navigate('ChatScreen', { id: myId, name: chat?.name, image: chatList?.data?.profile_url + chat?.profile_image })}>
                                    <Image source={{ uri: chatList?.data?.profile_url + chat?.profile_image }} style={{ height: 80, width: 80, borderColor: '#ff5000', borderRadius: 40, borderWidth: 3 }} />
                                    <View style={{ marginHorizontal: 14, flex: 1, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 19, fontFamily: 'Montserrat-Bold' }}>{chat?.name}</Text>
                                        <Text style={{ fontSize: 9, fontFamily: 'Montserrat-Regular' }}>{chat?.last_message}</Text>
                                    </View>
                                    {
                                        chat?.last_sender_id && chat?.last_sender_id != userId && <Text style={{ fontSize: 9, borderRadius: 2, paddingVertical: 2, paddingHorizontal: 10, fontFamily: 'Montserrat-Bold', backgroundColor: '#ff5000', color: 'white', overflow: 'hidden' }}>{translate("Your Turn")}</Text>
                                    }
                                </TouchableOpacity>
                            )
                        })
                    }  */}
          </View>
        </ScrollView>
      )}
    </>
  );
};

export default Chat;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  backTextWhite: {
    color: "#FFF",
  },
  rowFront: {
    alignItems: "center",
    backgroundColor: "#CCC",
    borderBottomColor: "black",
    borderBottomWidth: 1,
    justifyContent: "center",
    height: 50,
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#DDD",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 16,
    width: 75,
    height: 80,
    marginHorizontal: 16,
  },
  backRightBtnLeft: {
    backgroundColor: "blue",
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
  },
});

import React, { Component } from "react";
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";
import Modal from "react-native-modal";
import io from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ApiUrl as apiUrl } from "../../../services/config";
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  ImageBackground,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import useCallApi from "../../../helper/useApiCall";
import Spinner from "../../../helper/spinner";
import { translate } from "../../../helper/translationHelper";
import { TextInput } from "react-native-gesture-handler";

let socketIo = io.connect("https://admin.thespotapplication.com:17301", {
  reconnection: true,
  reconnectionDelay: 500,
  jsonp: false,
  reconnectionAttempts: Infinity,
  transports: ["websocket"],
});

const ChatScreen = ({ route, navigation }) => {
  const [userId, setUserId] = React.useState(0);
  const [state, setState] = React.useState(0);
  const [roomId, setRoomId] = React.useState("");
 
const yourRef = React.createRef(); 
  const [chattingStatus, setChattingStatus] = React.useState({
    status: "Accept",
    sender_id: 0,
    blocked_user_id: 0,
  });
  const {
    call: callUserDetailApi,
    data: userDetailData,
    loading: userDetailLoding,
  } = useCallApi("user_detail");
  const {
    call: callChatApi,
    data: chatList,
    loading: chatListLoading,
  } = useCallApi("get-messages");
  const [messages, setMessages] = React.useState([]);
  const [blockModel, setBlockModel] = React.useState(false);

  React.useEffect(() => {
    // Receiving New Message
   
  
    socketIo.on("newChatMessages", (result) => {
      console.log("New Message Received ---->", result);
      let newMessage = [
        {
          _id: parseInt(result.sender_id),
          text: result.message,
          createdAt: result.created_at,
          user: {
            _id: parseInt(result.sender_id),
            name: route.params.name,
            avatar: route.params.image,
          },
        },
      ];

      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages,newMessage)
      );
    });

    return () => socketIo.removeAllListeners("newChatMessages");
  }, []);

  React.useEffect(() => {
    // let { id, name, image } = route.params

    async function getAsyncData() {
      let user_id = await AsyncStorage.getItem("userID");
      callUserDetailApi({ user_id, detail_user_id: user_id });

      setUserId(user_id);

      console.log("Meri Id -->", user_id);
      console.log("dusreki Id -->", route.params.id);

      // SOCKET
      socketIo.on("connect", function (e) {
        console.log("on Connect");
      });

      socketIo.on("connect_error", (err) => {
        console.log(err);
      });

      // Creating Room Id
      let room_id = createRoomId(user_id, route.params.id);
      setRoomId(room_id);
      //----------------

      // Gettig Messages --
      const chatMessages = await callChatApi({ room_id });
      if (chatMessages?.data?.data?.length > 0) {
        let newMessage = chatMessages.data.data.map((message, index) => ({
          _id: parseInt(index),
          text: message.message,
          createdAt: message.created_at,
          user: {
            _id: parseInt(message.sender_id),
            name: route.params.name,
            avatar: route.params.image,
          },
        }));
        setMessages(newMessage);
      }
      // ------------------->>>>>>>

      // Joining Room
      socketIo.emit("joinroom", user_id, route.params.id, room_id);

      // Getting chatting Status
      socketIo.on("joinedroom", (status, sender_id, blocked_user_id) => {
        setChattingStatus({ status, sender_id, blocked_user_id });
        console.log("Joined room status --->", {
          status,
          sender_id,
          blocked_user_id,
        });
      });

      // Getting chatting after change
      socketIo.on("userBlock", (status) => {
        setChattingStatus(status);
        console.log("User blocked status --->", status);
      });
    }

    getAsyncData();
  }, []);

  const changeChattingStatus = React.useCallback(
    
    (status = "Pending") => {
      let sendStatus = {
        status,
        sender_id: userId,
        blocked_user_id: route.params.id,
      };
      console.log(status,"Fdsfds");
      
      socketIo.emit("changeStatus", roomId, status, userId, sendStatus);
      setBlockModel(false);
      if(status == 'Deleted'){
        deletinsideChat();
      }
    },
    [roomId, userId, chattingStatus, route.params.id]
  );

  const createRoomId = (user_id, member_id) => {
    return user_id < member_id
      ? `${user_id}_${member_id}`
      : `${member_id}_${user_id}`;
  };

  const onSend = React.useCallback(
    (messages = []) => {
      let message = messages[0];

      console.log(
        "New Message Sent ---->",
        userId,
        route.params.id,
        roomId,
        message.text
      );
      socketIo.emit(
        "chatMessage",
        userId,
        route.params.id,
        roomId,
        message.text
      );
    },
    [roomId]
  );
  const handleLoadEarlier = React.useCallback(
    (messages = []) => {
     
      yourRef.current.scrollToBottom()
      console.log(
        "New Message Sent ---->"
      );
     
    },
    [roomId]
  );

  const deletinsideChat = () => {
    let body = { room_id: roomId };
    console.log("bofgjlkdfhgkha;lfhfgh;hfg;dsflkjghf;jgh;sfgh", body);
    axios
      .post(apiUrl + "deleteChatByRoom", body)
      .then(async (response) => { 
        console.log("11111111----->", response);
         
        setBlockModel(false);
        navigation.navigate("Chat")
       
      })
      .catch((erroraa) => {
        setState({ loading: false });
        if (erroraa.toJSON().message === "Network Error") {
          Toast.show("Please check your internet connection");
        }
      });
  };
  const onClickReport = (report_user_id) => {
    setBlockModel(false);
    navigation.navigate("Report",{report_user_id:report_user_id});
  };
console.log(messages,"Fds2343243242");
var heightVal=50;
//  if (chattingStatus.status != "Pending" &&
//  userId == chattingStatus.sender_id) {

// if(messages.length == 0){
//   heightVal=16;
// }
// }

const {bottom} = useSafeAreaInsets();

  return (
    <>
      {(userDetailLoding || chatListLoading) && <Spinner />}
      <ImageBackground
        style={{ flex: 1, width: null, height: null, backgroundColor: "white" }}
      >
        <SafeAreaView style={{ flex: 0, backgroundColor: "white" }} />
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            flex: 1,
            paddingHorizontal: 25,
            alignItems: "flex-end",
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../../assets/chat/backGray.png")}
              resizeMode={"contain"}
              style={{ height: 25, width: 25 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ViewUserDeatils", { id: route.params.id })
            }
            style={{ alignItems: "center" }}
          >
            <Image
              source={{ uri: route.params.image }}
              style={{ height: 50, width: 50, borderRadius: 30 }}
            />
            <Text
              style={{
                color: "#535253",
                fontSize: 8,
                fontFamily: "Montserrat-Regular",
                textAlign: "center",
                marginTop: 3,
              }}
            >
              {route.params.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setBlockModel(true)}
            style={{ width: 30, alignItems: "flex-end" }}
          >
            <Image
              source={require("../../../assets/chat/dotMenu.png")}
              resizeMode={"contain"}
              style={{ height: 24, width: 10 }}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            backgroundColor: "#EDEDED",
            flexGrow: 7,
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 16,
            paddingBottom: 15,
            borderRadius: 16,
            
          }}
        >
          <GiftedChat
            isAnimated
            scrollToBottom={true}
            messages={messages}
             ref={yourRef}
            renderUsernameOnMessage={true}
            
            onSend={onSend}
            // inverted={false}
            isLoadingEarlier={true}
            onLoadEarlier={handleLoadEarlier}
            messagesContainerStyle={{ color: "gray" }}
            keyboardShouldPersistTaps="never"
            // optionTintColor={'pink'}
             minInputToolbarHeight={heightVal}
             bottomOffset={bottom}
            renderAvatarOnTop
            showAvatarForEveryMessage
           
            renderAvatar={(props) => {
              return (
                <View
                  style={{ flex: 1, justifyContent: "center", paddingLeft: 10 }}
                >
                  <Image
                    source={{ uri: props.currentMessage.user.avatar }}
                    style={{ height: 35, width: 35, borderRadius: 50 }}
                  />
                </View>
              );
            }}
            renderBubble={(props) => {
              // console.log("Render Bubble Props -->", props)

              return (
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: -10,
                  }}
                >
                  {props.position == "left" && (
                    <View style={[style.triangle, style.triangleLeft]} />
                  )}

                  <View style={{ flex: 1 }}>
                    <Bubble
                      {...props}
                      textStyle={{
                        right: {
                          color: "white",
                        },
                        left: {
                          color: "#24204F",
                        },
                      }}
                      wrapperStyle={{
                        left: {
                          backgroundColor: "#FFFFFF",
                          borderRadius: 0,
                          marginLeft: 0,
                        },
                        right: {
                          backgroundColor: "#FF3B00", // red
                          borderRadius: 0,
                          marginRight: 0,
                          padding: 0,
                        },
                      }}
                      containerStyle={{
                        left: {
                          marginVertical: 10,
                          // borderWidth: 2
                        },
                        right: {
                          marginVertical: 10,
                        },
                      }}
                      containerToPreviousStyle={{
                        left: {
                          // borderWidth: 2
                        },
                        right: {},
                      }}
                      tickStyle={{ borderWidth: 2 }}
                    />
                  </View>
                  {props.position == "right" && (
                    <View
                      style={[
                        style.triangle,
                        style.triangleRight,
                        { borderBottomColor: "#FF3B00" },
                      ]}
                    />
                  )}
                </View>
              );
            }}
            renderSend={(props) => {
              return (
                <Send
                  {...props}
                  textStyle={{
                    color: "#FF5000",
                    fontWeight: "1",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={require("../../../assets/chat/send.png")}
                    style={{
                      height: 23,
                      width: 23,
                      marginRight: 16,
                      alignSelf: "center",
                      marginTop: -32,
                    }}
                  />
                </Send>
              );
            }}
            renderInputToolbar={(props) => {
              if (
                chattingStatus.status == "Pending" &&
                userId != chattingStatus.sender_id
              ) {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      flex: 1,
                      height: 50,
                      bottom: -14.9,
                      backgroundColor: "#F1F1F1",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => changeChattingStatus("Block")}
                      style={{
                        flex: 1,
                        borderWidth: 4,
                        borderColor: "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        borderLeftWidth: 0,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#FF5000",
                            fontSize: 13,
                            fontFamily: "Montserrat-Medium",
                          }}
                        >
                          {translate("Block")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => changeChattingStatus("Deleted")}
                      style={{
                        flex: 1,
                        borderWidth: 4,
                        borderColor: "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRightWidth: 0,
                        borderLeftWidth: 0,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#FF5000",
                            fontSize: 13,
                            fontFamily: "Montserrat-Medium",
                          }}
                        >
                          {translate("Delete")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => changeChattingStatus("Accept")}
                      style={{
                        flex: 1,
                        borderWidth: 4,
                        borderColor: "#FFFFFF",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRightWidth: 0,
                      }}
                    >
                      <View
                        style={{
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#FF5000",
                            fontSize: 13,
                            fontFamily: "Montserrat-Medium",
                          }}
                        >
                          {translate("Accept")}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              } else if (chattingStatus.status == "Block") {
                if (chattingStatus.blocked_user_id != userId) {
                  return (
                    <View style={{ justifyContent: "center", flex: 1 }}>
                      <Text
                        style={{
                          alignSelf: "center",
                          color: "gray",
                          fontFamily: "Montserrat-Medium",
                        }}
                      >
                        {translate("Youblocked this conversation")}
                      </Text>
                    </View>
                  );
                } else {
                  return (
                    <View style={{ justifyContent: "center", flex: 1 }}>
                      <Text
                        style={{
                          alignSelf: "center",
                          color: "gray",
                          fontFamily: "Montserrat-Medium",
                        }}
                      >
                        {translate("Youbeen blocked in this conversation")}
                      </Text>
                    </View>
                  );
                }
              } else {
                return (
                  <InputToolbar
                    {...props}
                    containerStyle={{
                      backgroundColor: "#e2e2e2",
                      marginHorizontal: 10,
                      borderRadius: 6,
                      alignItems: "center",
                      borderWidth: 0,
                    }}
                  />
                );
              }
            }}
            user={{
              _id: parseInt(userId),
            }}
          />
          {/* {
                        Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />
                    } */}
        </View>
        {blockModel && (
          <Modal
            isVisible={blockModel}
            coverScreen={true}
            useNativeDriver={true}
            style={{ justifyContent: "flex-end", margin: 0 }}
            onBackdropPress={() => setBlockModel(false)}
          >
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 4,
                justifyContent: "center",
                alignItems: "center",
                margin: 0,
              }}
            >
              <TouchableOpacity
                onPress={() => onClickReport(route.params.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  width: "30%",
                  marginTop: "5%",
                }}
              >
                <Image
                  source={require("../../../assets/chat/report.png")}
                  style={{ height: 28, width: 24, marginRight: 16 }}
                ></Image>
                <Text style={style.modelText}>
                  {translate("Report")} {route.params.name}
                </Text>
              </TouchableOpacity>
              {/* chattingStatus.status == "Block" */}

              {chattingStatus.status != "Block" ? (
              <TouchableOpacity
                onPress={() => changeChattingStatus("Block")}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                  width: "30%",
                }}
              >
                <Image
                  source={require("../../../assets/chat/hide.png")}
                  style={{ height: 24, width: 24, marginRight: 16 }}
                ></Image>
                <Text style={style.modelText}>
                  {translate("Block")} {route.params.name}
                </Text>
              </TouchableOpacity>
              ) : null}
              {chattingStatus.status == "Block" ? (
              <TouchableOpacity
                onPress={() => changeChattingStatus("Accept")} 
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                  width: "30%",
                }}
              >
                <Image
                  source={require("../../../assets/chat/hide.png")}
                  style={{ height: 24, width: 24, marginRight: 16 }}
                ></Image>
                <Text style={style.modelText}>
                  Unblock {route.params.name}
                </Text>
              </TouchableOpacity>
                ) : null}
              <TouchableOpacity
                onPress={() => deletinsideChat()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 30,
                  marginBottom: 48,
                  width: "30%",
                }}
              >
                <Image
                  source={require("../../../assets/chat/chatx.png")}
                  style={style.modelImageStyle}
                ></Image>
                <Text style={style.modelText}> {translate("Delete chat")}</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        )}
      </ImageBackground>
    </>
  );
};

const style = StyleSheet.create({
  modelText: {
    fontSize: 11,
    fontFamily: "Montserrat-Medium",
    color: "#FF3B00",
  },
  modelImageStyle: {
    width: 24,
    height: 22,
    marginRight: 16,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 16,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#FFFFFF",
  },
  triangleLeft: {
    transform: [{ rotate: "-90deg" }, { translateY: 6 }],
  },
  triangleRight: {
    transform: [{ rotate: "90deg" }, { translateY: 6 }],
  },
});

export default ChatScreen;

import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Linking
} from "react-native";

import Spinner from "../../../helper/spinner";
import SubmitButton from "../../../helper/SubmitButton";
import useCallApi from "../../../helper/useApiCall";
import { translate } from "../../../helper/translationHelper";
import IAP from "react-native-iap";
import { ApiUrl as apiUrl } from '../../../services/config';
import { useIsFocused } from "@react-navigation/native";
import * as RNIap from "react-native-iap";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { actuatedNormalize as an } from "../../responsiveScreen";

const Subscription = ({ navigation }) => {
  const [state, setState] = useState({
    name: "",
    email: "",
    emailError: "",
    loading: false,
    resetPassword: true,
    title: "",
    description: "",
    slug: "Terms-and-conditions",
    // products: {},
    checkBoxError: "",
    checkBoxState: true,
    price: "",
    subscriptionId: "",
  });
  const { data: subdata, loading, call: callSubscriptionApi } = useCallApi("subscription");
  useEffect(() => {
      callSubscriptionApi();
     
  }, []);

  const itemSubs = Platform.select({
    ios: ["app.thespot.com"],
    android: ["monthly_plan1"],
  });

  let purchaseUpdateSubscription = null;

  let purchaseErrorSubscription = null;

  async function checkSubscription(transaction_id){
    let user_id = await AsyncStorage.getItem("userID");
      let body = { user_id:user_id, price:20,subscription_id:transaction_id  };

      console.log(body);
  
      axios
        .post(apiUrl + "transaction", body)
        .then((response) => {
          console.log("THIS IS RESPONSE DATE", response);
          navigation.navigate("Profile");
          // if (response.data.status == 1) {
          // } 
          // else if (response.data.status == 10) {
          // }
        })
        .catch((erroraa) => {
          console.log("ERROR FOR HERE", erroraa);

          if (erroraa.toJSON().message === "Network Error") {
            Toast.show("Please check your internet connection");
          }
        });
    
  };


  useEffect(() => {
    initilizeIAPConnection();
  
  }, []);

  const initilizeIAPConnection = async () => {
    await RNIap.initConnection()
      .then(async (connection) => {
        console.log("IAP result", connection);
        getItems();
      })
      .catch((err) => {
        console.warn(`IAP ERROR ${err.code}`, err.message);
      });

    await RNIap.flushFailedPurchasesCachedAsPendingAndroid()
      .then(async (consumed) => {
        console.log("consumed all items?", consumed);
      })
      .catch((err) => {
        console.warn(
          `flushFailedPurchasesCachedAsPendingAndroid ERROR ${err.code}`,
          err.message
        );
      });
  };

  
  const getItems = async () => {
    try {
      console.log("itemSubs ", itemSubs);
      const Products = await RNIap.getSubscriptions(itemSubs);
      console.log(" IAP Su", Products);
      if (Products.length !== 0) {
        if (Platform.OS === "android") {
          //Your logic here to save the products in states etc
        } else if (Platform.OS === "ios") {
          // your logic here to save the products in states etc
          // Make sure to check the response differently for android and ios as it is different for both
        }
      }
    } catch (err) {
      console.warn("IAP error", err.code, err.message, err);
      setError(err.message);
    }
  };

  useEffect(() => {
    purchaseUpdateSubscription = RNIap.purchaseUpdatedListener(
      async (purchase) => {
        console.log("purchase", purchase);
        checkSubscription(purchase.transactionId);
        const receipt = purchase.transactionReceipt;
        if (receipt) {
          try {
            if (Platform.OS === "ios") {
              RNIap.finishTransactionIOS(purchase.transactionId);
            } else if (Platform.OS === "android") {
              await RNIap.consumeAllItemsAndroid(purchase.purchaseToken);
              await RNIap.acknowledgePurchaseAndroid(purchase.purchaseToken);
            }
            await RNIap.finishTransaction(purchase, true);
          } catch (ackErr) {
            console.log("ackErr INAPP>>>>", ackErr);
          }
        }
      }
    );
    purchaseErrorSubscription = RNIap.purchaseErrorListener((error) => {
      console.log("purchaseErrorListener INAPP>>>>", error);
    });

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
        purchaseUpdateSubscription = null;
      }

      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
        purchaseErrorSubscription = null;
      }
    };
  }, []);

  const requestSubscription = async (sku) => {
    
    console.log("IAP req", sku);
    try {
      await RNIap.requestSubscription(sku)
        .then(async (result) => {
          console.log("IAP req sub", result);
       
          navigation.navigate("Profile"); //add subscription
          if (Platform.OS === "android") {
            setPurchaseToken(result.purchaseToken);
            setPackageName(result.packageNameAndroid);
            setProductId(result.productId);
            // can do your API call here to save the purchase details of particular user
          } else if (Platform.OS === "ios") { 
            console.log(result.transactionReceipt);
            setProductId(result.productId);
            setReceipt(result.transactionReceipt);
            // can do your API call here to save the purchase details of particular user
          }
          setBuyIsLoading(false);
        })
        .catch((err) => {
          setBuyIsLoading(false);
          console.warn(
            `IAP req ERROR %%%%% ${err.code}`,
            err.message,
            isModalVisible
          );
          setError(err.message);
        });
    } catch (err) {
      setBuyIsLoading(false);
      console.warn(`err ${error.code}`, error.message);
      setError(err.message);
    }
  };

  const checkValidation = () => {
    const checkBoxError =
      state.checkBoxState == false
        ? "Please agree with Terms and Conditions"
        : "";

    if (checkBoxError) {
      setState({
        ...state,
        checkBoxError: checkBoxError,
      });
      return false;
    } else {
      return true;
    }
    
  };

  const onBuyNow = async () => {
    if (!checkValidation()) {
      console.log("hello error");
      return;
    }
    if (Platform.OS == "android") {
      // IAP.requestSubscription("monthly_plan1");
      try {
        requestSubscription("monthly_plan1");
        // IAP.requestSubscription("monthly_plan1");
      } catch (err) {
        console.warn("erororrrr", err.code, err.message);
      }
    } else {
      
      IAP.requestSubscription("app.thespot.com");
    }
  };

  return (
    <>
      {loading && <Spinner />}
      <SafeAreaView style={{ backgroundColor: "white" }} />
      <ScrollView style={{ paddingHorizontal: 30, backgroundColor: "white" }}>
        <View style={{ flex: 2 }}>
          <View
            style={{
              flexDirection: "row",
              height: 120,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Image
              source={require("../../../assets/images/logo.png")}
              style={{ height: 63, width: 60 }}
            />

            <ImageBackground
              source={require("../../../assets/btnBackground01.png")}
              resizeMode={"stretch"}
              style={{
                marginLeft: -30,
                marginTop: 20,
                height:  30,
                width: 120,
                justifyContent: "center",
                transform: [{ skewX: "-10deg" }],
    
              }}
            >
              <Text
                style={[
                  {
                    color: "white",
                    fontSize: an(15),
                    fontFamily: "Montserrat-Bold",
                    alignSelf: "center",
                    textTransform: "uppercase",
                  },
                ]}
              >
                {subdata?.data.data.plan_name}
              </Text>
            </ImageBackground>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignSelf: "flex-end", marginBottom: 20}}
            >
              <Image
                source={require("../../../assets/home/blackClose.png")}
                style={{ height: 18, width: 18 }}
              />
            </TouchableOpacity>
          </View>
          <View style={{ height: 3, marginBottom: 20 }}>
            <Image
              source={require("../../../assets/btnBackground.png")}
              style={{ height: 3, width: "100%" }}
            />
          </View>
          <View>
            <Text
              style={{
                textAlign: "center",
                fontSize: an(20),
                fontFamily: "Montserrat-Bold",
                color: "#424242",
              }}
            >
              {subdata?.data.data.discount_text}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginVertical: 20,
              }}
            >
              <Text
                style={{
                  fontSize: an(43),
                  color: "#424243",
                  fontFamily: "Montserrat-Bold",
                
                }}
              >
                {subdata?.data.data.discount}%{" "}
              </Text>
              <Text
                style={{
                  fontSize: an(20),
                  marginTop: -10,
                  fontFamily: "Montserrat-Bold",
                  color: "#424242",
                }}
              >
                {translate("Off")}
              </Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 3 }}>
          <View
            style={{
              paddingBottom: 30,
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 20,
            }}
          >
            <View>
              <Text
                style={{
                  color: "lightgray",
                  fontSize: an(18),
                  fontFamily: "Montserrat-Bold",
                }}
              >
                SAR {subdata?.data.data.amount} /
                <Text style={{ fontSize: an(12), fontFamily: "Montserrat-Medium" }}>
                  {translate("month")}
                </Text>
              </Text>
              <Text
                style={{
                  color: "lightgray",
                  fontSize: an(9),
                  paddingLeft: 40,
                  marginTop: 10,
                  fontFamily: "Montserrat-Regular",
                }}
              >
                ({translate("before")})
              </Text>
            </View>
            <View>
              <Text
                style={{
                  color: "#00AD00",
                  fontSize: an(18),
                  fontFamily: "Montserrat-Bold",
                }}
              >
                SAR{" "}
                {(subdata?.data.data.amount * subdata?.data.data.discount) /
                  100}{" "}
                /
                <Text style={{ fontSize: an(12), fontFamily: "Montserrat-Medium" }}>
                  {translate("month")}
                </Text>
              </Text>
              <Text
                style={{
                  color: "#00AD00",
                  fontSize: an(9),
                  paddingLeft: 40,
                  marginTop: 10,
                  fontFamily: "Montserrat-Regular",
                }}
              >
                ({translate("now")})
              </Text>
            </View>
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              paddingHorizontal: 10,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Image
                source={require("../../../assets/images/location.png")}
                style={{ height: 40, width: 26 }}
              />
            </View>
            <View style={{ justifyContent: "center", flex: 4 }}>
              <Text
                style={{
                  fontSize: an(13),
                  fontFamily: "Montserrat-Bold",
                  marginBottom: 5,
                }}
              >
                {translate("Drop Pin")}
              </Text>
              <Text
                style={{
                  fontSize: an(8),
                  color: "#919191",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {subdata?.data.data.drop_pin}
              </Text>
            </View>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 25,
              paddingHorizontal: 10,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Image
                source={require("../../../assets/images/chat.png")}
                style={{ height: 29, width: 32 }}
              />
            </View>
            <View style={{ justifyContent: "center", flex: 4 }}>
              <Text
                style={{
                  fontSize: an(13),
                  fontFamily: "Montserrat-Bold",
                  marginBottom: 5,
                }}
              >
                {translate("Unlimited Chats")}
              </Text>
              <Text
                style={{
                  fontSize: an(8),
                  color: "#919191",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {subdata?.data.data.unlimited_chat}
              </Text>
            </View>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 25,
              paddingHorizontal: 10,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                source={require("../../../assets/images/path.png")}
                style={{ height: 32, width: 32 }}
              />
            </View>
            <View style={{ justifyContent: "center", flex: 4 }}>
              <Text
                style={{
                  fontSize: an(13),
                  fontFamily: "Montserrat-Bold",
                  marginBottom: 5,
                }}
              >
                {translate("Hide Ads")}
              </Text>
              <Text
                style={{
                  fontSize: an(8),
                  color: "#919191",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {subdata?.data.data.hide_ads}
              </Text>
            </View>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: 25,
              paddingHorizontal: 10,
            }}
          >
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <Image
                source={require("../../../assets/images/spy.png")}
                style={{ height: 32, width: 32 }}
              />
            </View>
            <View style={{ justifyContent: "center", flex: 4 }}>
              <Text
                style={{
                  fontSize: an(13),
                  fontFamily: "Montserrat-Bold",
                  marginBottom: 5,
                }}
              >
                {translate("Spy Mode")}
              </Text>
              <Text
                style={{
                  fontSize: an(8),
                  color: "#919191",
                  fontFamily: "Montserrat-Regular",
                }}
              >
                {subdata?.data.data.spy_mode}
              </Text>
            </View>
          </View>

          <View style={{ paddingTop: 30 }}>
            <Text
              style={{
                color: "#808080",
                textAlign: "center",
                fontSize: an(9),
                fontFamily: "Montserrat-Medium",
              }}
            >
              {translate("Renew at")} SAR {subdata?.data.data.amount}{" "}
              {translate("after the first month")}
            </Text>
            <Text
              style={{
                color: "#808080",
                textAlign: "center",
                fontSize: an(6),
                paddingTop: 6,
                fontFamily: "Montserrat-Regular",
              }}
            >
              {subdata?.data.data.feature}
            </Text>
          </View>

          <View style={{ paddingTop: 20, paddingHorizontal: 20 }}>
            <Text
              style={{
                color: "#808080",
                textAlign: "center",
                fontSize: an(7),
                fontFamily: "Montserrat-Medium",
                paddingTop: 6,
              }}
            >
              {subdata?.data.data.description}
            </Text>
          </View>
        </View>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 40,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 20,
          }}
        >
          <SubmitButton
            title={translate("Switch to Premium")}  
            onPress={() => onBuyNow()}
            textStyle={{
              textTransform: "none",
              marginHorizontal: 40,
              fontSize: an(14),
            }}
            TouchableStyle={{ margin: 0, marginTop: 0 }}
          />
            {/* <View style={{ flexDirection: "row", marginHorizontal: 36, marginTop: 12, alignContent: 'center'}}>
                                    <Text style={{ fontSize: 14, color: 'black'}}>{translate("You agree to our")} </Text>
                                    <TouchableOpacity onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/terms-of-service') }>
                                        <Text style={{ color: 'black', alignSelf: "center", fontSize: 14, fontWeight: 'bold' }}>{translate("Terms_Conditions")}</Text>
                                    </TouchableOpacity>
                                </View> */}
        </View>
        {/* </ScrollView> */}
      </ScrollView>
    </>
  );
};

export default Subscription;

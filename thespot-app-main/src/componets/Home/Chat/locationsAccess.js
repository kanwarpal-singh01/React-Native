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
  Dimensions,
} from "react-native";

const LocationAccess = ({ navigation }) => {
 
  return (
    <>
     
      <SafeAreaView style={{backgroundColor: "white" }} />
     
      <View
            style={{
              flexDirection: "row",
              backgroundColor:"white",
              height:45,
              alignItems:"center",
              justifyContent:"space-between",
              width:"100%"
              
            }}
          >
            <View>
              
            </View>

            <View style={{flexDirection:"row",width:"40%"}}> 
            <TouchableOpacity
            //  style={{marginLeft:25 }}
             // onPress={() => this.navigateToDropMarker()}
            >
             
                <Image
                  source={require("../../../assets/locations/location.png")}
                  style={{ height: 25, width: 16 }}
                />
             
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingHorizontal: 10, }}
           
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
        
                </Text>
              </View>
              <Image
                source={require("../../../assets/locations/doubleHeart.png")}
                style={{ height: 22, width: 25 }}
              />
            </TouchableOpacity>
            </View>
           
            
          
            {/* <View style={{ flex: 1,backgroundColor:"red" }}></View> */}
           
            <View style={{ flexDirection: "row-reverse", alignItems: "center",width:"45%", }}>
              <Text style={{ fontSize: 12, fontFamily: "Montserrat-Bold",marginRight:25 }}>
                {translate("List")}
              </Text>
              <TouchableOpacity
               // onPress={() => this.toggleValueChange("mapListSwitch")}
              >
                <Image
                  source={
                 //   this.state.mapListSwitch == false
                       require("../../../assets/locations/listToggel.png"),
                       require("../../../assets/locations/mapToggel.png")
                      
                  }
                  style={{ height: 20, width: 36, marginHorizontal: 8 }}
                />
              </TouchableOpacity>
              <Text style={{ fontSize: 12, fontFamily: "Montserrat-Bold"}}>
                {translate("Map")}
              </Text>
            </View>

          </View>
        <View style={{ flex: 1,backgroundColor:"white", }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#f2f2f6",
              marginHorizontal: 16,
              marginBottom: 16,
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              marginTop:5,
            
            }}
          >
            <Image
              source={require("../../../assets/grayLogo.png")}
              style={{ height: 46, width: 30 }}
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
              {translate("CHECK IN")}
            </Text>
            <Text
              style={{
                textAlign: "center",
                fontFamily: "Montserrat-Regular",
                color: "#535253",
                fontSize: 13,
                marginTop: 8,
                marginHorizontal: 100,
              }}
            >
              {translate("Check in to get started!")}
            </Text>
             <View style={{justifyContent:"center",alignItems:"center",width:"100%",position:'absolute',bottom:20}}>
             <TouchableOpacity
          style={{
            backgroundColor: "#FF5000",
            borderRadius: 12,
            height: 42,
            width: 120,
            justifyContent: "center",
            alignItems: "center",
        
          
          }}
          onPress={() => navigation.navigate("Location")}
        >
          <Text
            style={{
              fontFamily: "Montserrat-Bold",
              color: "white",
              fontSize: 14,
            }}
          >
            {translate('Continue')}
          </Text>
        </TouchableOpacity>
             </View>
            
          </View>
          
        </View>
        
    
    </>
  );
};

export default LocationAccess;
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
  },
  
  
 
  
 
});

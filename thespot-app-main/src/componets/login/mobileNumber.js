import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import CountryPicker from 'react-native-country-picker-modal';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import { validations } from '../../helper/validation';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import PushNotification from "react-native-push-notification";
import messaging from '@react-native-firebase/messaging';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Platform,
    StatusBar
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { translate } from '../../helper/translationHelper';

export default class MobileNumber extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countryCode: 'US',
            callingCode: '+1',
            phone: '',
            loading: false,
            userIds: ''
        }
    }

    componentDidMount() {
        let { userId } = this.props.route.params
        console.log(userId)
        this.setState({ userIds: userId })


        // if(Platform.OS == "android"){
        //     PushNotification.configure({
        //       onRegister: async function (token) {
                 
                 
        //           await AsyncStorage.setItem('device_id', token.token);
        //       },
        //       onNotification: function (notification) {
        //           console.log("NOTIFICATION:", notification);
        //           // let count = JSON.parse(notification.data.data)?.notification_count;
    
        //           // console.log("Count -->", count);
        //           // setCounter(count)
        //           // notification.finish(PushNotificationIOS.FetchResult.NoData);
        //       },
        //       onAction: function (notification) {
        //           console.log("ACTION:", notification.action);
        //           console.log("NOTIFICATION:", notification);
        //       },
        //       onRegistrationError: function (err) {
        //           console.error(err.message, err);
        //       },
        //       permissions: {
        //           alert: true,
        //           badge: true,
        //           sound: true,
        //       },
        //       popInitialNotification: true,
        //       requestPermissions: true,
        //   });
        //   }else{
        //     this.requestUserPermission();
        //     const unsubscribe = messaging().onMessage(async (remoteMessage) => {
        //       PushNotification.localNotification({
        //         message: remoteMessage.notification.body,
        //         title: remoteMessage.notification.title,
             
        //         channelId: "channel-id",
        //       });
        //     });
      
      
        //      return unsubscribe;
        //   }
          
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
          console.log(fcmToken);
          await AsyncStorage.setItem('device_id', fcmToken);
          console.log("Your Firebase Token is2222:", fcmToken);
        } else {
          console.log("Failed", "No token received");
        }
      }
    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    onSignUp() {
        this.setState({ loading: true })
        let vaildationBody = { phone: this.state.phone, token: 'abc' }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);
        if (errors == "") {
            let body = { mobile: this.state.callingCode + "-" + this.state.phone, countryCode: this.state.countryCode, user_id: this.state.userIds, facebook_account_id: this.props.route.params?.facebook_account_id, apple_account_id: this.props.route.params?.apple_account_id }
            console.log("Mobile body--->", body)
            axios
                .post(apiUrl + 'register', body)
                .then(async (response) => {
                    console.log("Mobile REsponse --->", response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        await AsyncStorage.setItem('userID', JSON.stringify(response.data.data.id))
                        this.props.navigation.navigate('OTP', { userId: response.data.data })
                    } else if (response.data.status != 1) {
                        Toast.show(response.data.message)
                    }
                })
                .catch((erroraa) => {
                    console.log("Register Error::", erroraa)

                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
            this.setState({ loading: false })
            Toast.show(translate(errors), 6)
        }
    }

    render() {
        let { phone } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <StatusBar barStyle={'dark-content'} />
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70, color: '#535253', letterSpacing: 1 }}>{translate("Enter your mobile number")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 25, marginHorizontal: 40, height: 44 }}>
                                <View style={{ flexShrink: 1, flexDirection: "row", alignItems: "center", backgroundColor: '#e0e0e0' }}>
                                    <View style={{ marginHorizontal: 16 }}>
                                        <CountryPicker
                                            onSelect={(country) => {
                                                if (country.callingCode.length) {
                                                    let hasPlus = country.callingCode[0].includes('+')
                                                    this.setState({
                                                        countryCode: country.cca2,
                                                        callingCode: hasPlus ? country.callingCode[0] : `+${country.callingCode[0]}`
                                                    });
                                                } else {
                                                    this.setState({ showError: 'hi' })
                                                }
                                            }}
                                            filterable={true}
                                            withFlag={true}
                                            withFilter={true}
                                            withCurrency={false}
                                            withFlagButton={true}
                                            withCountryNameButton={false}
                                            countryCode={this.state.countryCode}
                                            withCallingCode={true}
                                            withCallingCodeButton={true}
                                            containerButtonStyle={{ paddingVertical: 1, paddingHorizontal: 0, textAlign: 'center', marginBottom: 'auto', height: 32}}
                                            true
                                        />
                                    </View>
                                </View>
                                <View style={{ flex: 1, marginLeft: 16, alignItems: "flex-start", backgroundColor: '#e0e0e0' }}>
                                    <TextInput style={style.textInputStyle} placeholder={translate("Enter Mobile No")} color={'black'} keyboardType={'number-pad'} placeholderTextColor="gray" onChangeText={text => this.onChange("phone", text)} value={phone}></TextInput>
                                </View>
                            </View>
                            <Text style={{ color: '#9C9B9B', fontSize: 9, fontFamily: 'Montserrat-Regular', marginHorizontal: 80, textAlign: 'center', marginTop: 30 }}>{translate("You will receive a text message")} </Text>
                            <Text style={{ color: '#9C9B9B', fontSize: 9, fontFamily: 'Montserrat-Regular', marginHorizontal: 80, textAlign: 'center' }}>{translate("containing your verification code")}</Text>
                            <SubmitButton title={translate("CONTINUE")} onPress={() => this.onSignUp()} />
                            {/* <TouchableOpacity style={{ marginVertical: 36 }} onPress={() => this.onSignUp()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} style={{ height: 42, alignItems: "center", justifyContent: 'center', paddingHorizontal: 80 }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold' }}>CONTINUE</Text>
                                </ImageBackground>
                            </TouchableOpacity> */}
                        </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </>
        )
    }
}

const style = StyleSheet.create({
    textInputStyle: {
        flex: 1,
        fontSize: 16,
        padding: 6,
        width: "100%"
    }
})
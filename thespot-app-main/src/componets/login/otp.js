import React, { Component, PureComponent } from 'react';
import BackBtn from '../../helper/backBtn';
import CodeInput from 'react-native-confirmation-code-input';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import { BackHandler } from 'react-native';
import { AuthContext } from '../../navigations/context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Keyboard
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';

import { translate } from '../../helper/translationHelper';

class OTP extends PureComponent {
    constructor(props) {
        super(props);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.state = {
            countryCode: 'US',
            callingCode: '+1',
            finalText: "",
            userId: '',
            loading: false,
            mobileNumber: '',
            code: '',
            setfocus: false,
            device_id: ""

        }
        this.codeInputRef = React.createRef();
    }

    async componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
        // console.log('asdasasdas',this.props.getdata.id)
        this.setState({ userId: this.props.getdata.id, mobileNumber: this.props.getdata.mobile, code: this.props.getdata.otp }, () => {
            console.log('this is OTP', this.state.code)
        })
        this.setState({ device_id: await AsyncStorage.getItem('device_id') }, () => {
            console.log("DEVICE_ID   ----->", this.state.device_id)
        })
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.navigate('Login');
        return true;
    }

    _onFulfill(code) {
        this.setState({ finalText: code })
    }

    onbuttonclick = () => {
        console.log("CodeInputRef ----->", this.codeInputRef.current);

        if (this.state.finalText.length >= 4) {
            // this.props.navigation.navigate('ResetPassword')
            this.onSubmit()
        } else {
            Toast.show(translate('Please enter OTP'))
        }
    }

    onSubmit = () => {
        this.setState({ loading: true })
        let body = { user_id: this.state.userId, otp: this.state.finalText, token: this.state.device_id }
        console.log(body,"dsfsd");
        axios
            .post(apiUrl + 'sms_verification', body)
            .then((response) => {
                this.setState({ loading: false })
                Keyboard.dismiss();
               // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    if (response.data.data.status == 1) {
                        this.props.appContext()
                    } else {
                        this.props.navigation.navigate('Email')
                    }
                }else{
                    Toast.show(response.data.message)
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                console.log(erroraa);
                Keyboard.dismiss();
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    ressendOTP = () => {
        this.setState({ loading: true })
        Keyboard.dismiss();
        let body = { user_id: this.state.userId, mobile: this.state.mobileNumber }
        axios
            .post(apiUrl + 'resend_otp', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                this.setState({ finalText: '' })
                this.refs.codeInputRef1.clear();
                Keyboard.dismiss();
                Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.setState({ code: response.data.data.otp })
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                Keyboard.dismiss();
                console.log(erroraa);
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                } else {
                    Toast.show(translate('Server error please try again'))
                }
            });
        Keyboard.dismiss();
    }

    render() {
        console.log(this.props.getdata)
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            {/* <Text style={{ fontSize: 24 }}>Your OTP: - {this.state.code}</Text> */}
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 18, fontFamily: 'Montserrat-SemiBold', marginTop: 70 }}>{translate("Enter your code")}</Text>
                            <CodeInput
                                ref="codeInputRef"
                                // secureTextEntry
                                codeLength={4}
                                className={'border-b'}
                                space={5}
                                size={"18%"}
                                size={40}
                                autoFocus={false}
                                inputPosition='left'
                                activeColor='#000'
                                inactiveColor='#000'
                                keyboardType={'number-pad'}
                                containerStyle={{ justifyContent: 'center', alignItems: 'center', marginTop: 40 }}
                                codeInputStyle={{ height: 40, fontSize: 20, borderRadius: 2, }}
                                onFulfill={(code) => this._onFulfill(code)}
                            />
                            <SubmitButton title={translate("Continue")} TouchableStyle={{ marginTop: 70 }} onPress={() => this.onbuttonclick()} />
                            {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onbuttonclick()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>CONTINUE</Text>
                                </ImageBackground>
                            </TouchableOpacity> */}
                            <View style={{ flexGrow: 1, marginTop: 16, marginLeft: 36, marginRight: 36, flexDirection: "row", alignSelf: "center", marginBottom: 24 }}>
                                <Text style={{ fontSize: 16, alignSelf: "center", marginLeft: 10, lineHeight: 18, color: "gray", fontFamily: 'Montserrat-SemiBold', }}>{translate("Did not receive OTP yet")} </Text>
                                <TouchableOpacity onPress={() => this.ressendOTP()}>
                                    <Text style={{ color: "#f95721", fontWeight: "bold", fontSize: 17, textDecorationLine: "underline", fontFamily: 'Montserrat-SemiBold' }}>{translate("Resend OTP")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </>
        )
    }
}

export function SiginComponents({ navigation, route }) {
    const { signIn } = React.useContext(AuthContext)
    return <OTP appContext={signIn} navigation={navigation} getdata={route.params.userId} />
}

const style = StyleSheet.create({
    textInputStyle: {
        flex: 1,
        fontSize: 16,
        padding: 6,
        width: "100%"
    }
})
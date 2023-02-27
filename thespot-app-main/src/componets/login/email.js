import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import { validations } from '../../helper/validation';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ScrollView,
    Platform
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';

import { translate } from '../../helper/translationHelper';

export default class Email extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            loading: false,
            userID: ''
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID')})
        this.getProfile()
    }

    onChange = (name, value) => {
        this.setState({[name]: value })
    }
    getProfile() {
        this.setState({ loading: true });
        let body = {
          user_id: this.state.userID,
        };
        axios
          .post(apiUrl + "user_detail", body)
          .then(async (response) => {
            this.setState({ loading: false });
            if (response.data.status == 1) {
             
              this.setState({
                email: response.data.data.email,
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
    onSubmit() {
        this.setState({ loading: true })
        let vaildationBody = { email: this.state.email }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);
        if (errors == "") {
            let body = { email: this.state.email, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        if (Platform.OS == "android") {
                            if (response.data.data.facebook_account_id) {
                                this.props.navigation.navigate('Welcome')
                            } else {
                                this.props.navigation.navigate('ConnectAccount', { response: response.data })
                            }
                        } else {
                            if (response.data.data.facebook_account_id && response.data.data.apple_account_id) {
                                this.props.navigation.navigate('Welcome')
                            } else {
                                this.props.navigation.navigate('ConnectAccount', { response: response.data })
                            }
                        }

                    }
                })
                .catch((erroraa) => {
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
        let { email } = this.state
        return (
            <>
                {this.state.loading && <Spinner/>}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 18, fontFamily: 'Montserrat-SemiBold', marginTop: 70, marginBottom: 40 }}>{translate("Enter your Email")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 24, marginHorizontal: 54, height: 44, backgroundColor: '#e0e0e0' }}>
                                <TextInput style={style.textInputStyle} keyboardType='email-address' onChangeText={text => this.onChange("email", text)} maxLength={40} value={email}></TextInput>
                            </View>
                            <SubmitButton title={translate("Continue")} onPress={() => this.onSubmit()} />
                            {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onSubmit()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>CONTINUE</Text>
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
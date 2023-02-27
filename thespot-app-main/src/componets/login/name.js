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
    ScrollView
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { translate } from '../../helper/translationHelper';

export default class Name extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            loading: false,
            userID: ''
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    onSubmit() {
        this.setState({ loading: true })
        let vaildationBody = { name: this.state.name }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);
        if (errors == "") {
            let body = { name: this.state.name, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        // console.log('you data is here', response.data)
                        this.props.navigation.navigate('BirthDayDate')
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    // console.log(erroraa);
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
        let { name } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70, letterSpacing: 2 }}>{translate("Enter your Name")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 60, marginHorizontal: 54, height: 44, backgroundColor: '#e0e0e0' }}>
                                <TextInput style={style.textInputStyle} onChangeText={text => this.onChange("name", text)} maxLength={30} value={name}></TextInput>
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
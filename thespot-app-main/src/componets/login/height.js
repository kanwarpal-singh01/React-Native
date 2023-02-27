import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { validations } from '../../helper/validation';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { translate } from '../../helper/translationHelper';

export default class Height extends Component {
    constructor(props) {
        super(props);
        this.state = {
            height: '',
            loading: false,
            userID: ''
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    increment() {
        console.log(this.state.height)
        if (this.state.height) {
            this.setState((prevState) => ({ ...prevState, height: parseInt(prevState.height) + 1 }))
        } else {
            this.setState((prevState) => ({ ...prevState, height: 1 }))
        }

    }

    decrement() {
        if (this.state.height > 0) {
            this.setState((prevState) => ({ ...prevState, height: parseInt(prevState.height) - 1 }))
        }
    }

    onChange = (name, value) => {
        if (value) {
            if (value != 0) {
                if (/^([0-9]{0,3})$/gm.test(value)) {
                    this.setState({ [name]: parseInt(value) })
                }
            } else {
                this.setState({ [name]: '' })
            }
        } else {
            this.setState({ [name]: '' })
        }

    }

    onSubmit() {
        this.setState({ loading: true })
        let body = { height: this.state.height, user_id: this.state.userID }
        let error = ""
        let errors = validations.signUpValidation(error, body);
        if (errors == "") {
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.navigation.navigate('Nationality')
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
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70 }}>{translate("Enter your Height")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 40, marginHorizontal: 8, alignItems: 'center' }}>
                                {/* <View style={{ marginRight: 16 }}>
                                    <TouchableOpacity style={{ marginBottom: 8 }} onPress={() => this.increment()}>
                                        <Image source={require('../../assets/firstScreen/topArrow.png')} style={{ height: 18, width: 24 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{}} onPress={() => this.decrement()}>
                                        <Image source={require('../../assets/firstScreen/bottomArrow.png')} style={{ height: 18, width: 24 }} />
                                    </TouchableOpacity>
                                </View> */}
                                <View style={{ justifyContent: 'space-between', marginRight: 20 }}>
                                    <TouchableOpacity onPress={() => this.increment()}>
                                        <Image source={require('../../assets/firstScreen/topArrow.png')} style={{ height: 12, width: 28, marginBottom: 10 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => this.decrement()}>
                                        <Image source={require('../../assets/firstScreen/bottomArrow.png')} style={{ height: 12, width: 28 }} />
                                    </TouchableOpacity>
                                </View>
                                <TextInput style={{ fontSize: 16, padding: 6, width: 70, backgroundColor: '#e0e0e0', height: 46, textAlign: 'center' }} onChangeText={text => this.onChange("height", text)} keyboardType={'number-pad'} value={this.state.height.toString()} maxLength={3}></TextInput>
                                <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 8 }}>{translate("CM")}</Text>
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
        fontSize: 16,
        padding: 6,
        width: 80
    }
})
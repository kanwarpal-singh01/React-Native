import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validations } from '../../helper/validation';
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

export default class Nationality extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nationality: '',
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
        let vaildationBody = { nationality: this.state.nationality }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);
        if (errors == "") {
            this.setState({ loading: true })
            let body = { nationality: this.state.nationality, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.navigation.navigate('UploadPhoto')
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
        let { nationality } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70 }}>{translate("Enter your Nationality")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 50, marginHorizontal: 54, height: 44, backgroundColor: '#e0e0e0' }}>
                                <TextInput style={style.textInputStyle} onChangeText={text => this.onChange("nationality", text)} maxLength={50} value={nationality}></TextInput>
                            </View>
                            <SubmitButton title={translate("Continue")} onPress={() => this.onSubmit()} />
                            {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onSubmit()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 46, justifyContent: 'center' }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 60 }}>CONTINUE</Text>
                                </ImageBackground>
                            </TouchableOpacity> */}
                            <TouchableOpacity style={{ marginTop: 36 }} onPress={() => this.props.navigation.navigate('UploadPhoto')}>
                                <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Regular', alignSelf: "center", color: 'gray' }}>{translate("Skip")}</Text>
                            </TouchableOpacity>
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
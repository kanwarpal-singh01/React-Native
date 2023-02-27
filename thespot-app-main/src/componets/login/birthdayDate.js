import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import DatePicker from 'react-native-datepicker'

import {
    SafeAreaView,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';

import { translate } from '../../helper/translationHelper';

const getCurrentDate = () => {

    var date = new Date().getDate();
    var month = new Date().getMonth() + 1;
    var year = new Date().getFullYear() - 18;

    return year + '-' + month + '-' + date;//format: dd-mm-yyyy;
}

export default class BirthDayDate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            day: '',
            month: '',
            year: '',
            loading: false,
            userID: '',
            date: '',
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    _onFulfill(name, value) {
        this.setState({ [name]: value })

    }

    onSubmit() {
        if (this.state.date == '') {
            Toast.show(translate('Please select date'))
        } else {
            this.setState({ loading: true })
            let body = { dob: this.state.date, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.navigation.navigate('SelectGender')
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        }

    }


    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView />
                <KeyboardAwareScrollView>
                    <View style={{ flexGrow: 1, alignItems: 'center' }}>
                        <BackBtn navigation={this.props.navigation} />
                        <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                        <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70, letterSpacing: 1 }}>{translate("Enter your Birthday")}</Text>
                        <View style={{ flexDirection: 'row', width: 280, backgroundColor: '#e0e0e0', marginTop: 40 }}>
                            <DatePicker
                                style={{ width: "100%" }}
                                date={this.state.date}
                                mode="date"
                                placeholder={translate("Select Date")}
                                format="YYYY-MM-DD"
                                maxDate={getCurrentDate()}
                                confirmBtnText={translate("Confirm")}
                                cancelBtnText={translate("Cancel")}
                                showIcon={true}
                                customStyles={{
                                    dateInput: {
                                        borderColor: '#e0e0e0'
                                    },
                                    dateText: {
                                        left: 0,
                                        position: "absolute",
                                        padding: 4,
                                    },
                                    placeholderText: {
                                        left: 4,
                                        position: "absolute",
                                        display: "flex",
                                        color: 'gray',
                                        fontSize: 16
                                    }
                                }}
                                onDateChange={(date) => { this.setState({ date: date }) }}
                            />
                            {/* <View style={{ backgroundColor: '#e0e0e0', height: 80 }}> */}
                            {/* <CodeInput
                                    ref="codeInputRef1"
                                    // secureTextEntry
                                    codeLength={2}
                                    className={'border-b'}
                                    space={5}
                                    // size={"18%"}
                                    size={30}
                                    inputPosition='left'
                                    activeColor='#000'
                                    inactiveColor='#000'
                                    autoFocus={true}
                                    keyboardType={'number-pad'}
                                    // containerStyle={{ justifyContent: 'center', alignItems: 'center'}}
                                    codeInputStyle={{ height: 30, fontSize: 20 }}
                                    onFulfill={(code) => this._onFulfill('day', code)}
                                />
                                <Text style={{ fontSize: 14, marginTop: 34, textAlign: 'center' }}>Day</Text>
                            </View>
                            <View style={{ backgroundColor: '#e0e0e0', height: 80, marginLeft: 12 }}>
                                <CodeInput
                                    // ref="codeInputRef1"
                                    // secureTextEntry
                                    codeLength={2}
                                    className={'border-b'}
                                    space={5}
                                    // size={"18%"}
                                    size={30}
                                    autoFocus={false}
                                    inputPosition='left'
                                    activeColor='#000'
                                    inactiveColor='#000'
                                    keyboardType={'number-pad'}
                                    // containerStyle={{ justifyContent: 'center', alignItems: 'center'}}
                                    codeInputStyle={{ height: 30, fontSize: 20 }}
                                    onFulfill={(code) => this._onFulfill('month', code)}
                                />
                                <Text style={{ fontSize: 14, marginTop: 34, textAlign: 'center' }}>Month</Text>
                            </View>
                            <View style={{ backgroundColor: '#e0e0e0', height: 80, marginLeft: 12 }}>
                                <CodeInput
                                    // ref="codeIn/putRef2"
                                    // secureTextEntry
                                    codeLength={4}
                                    className={'border-b'}
                                    space={5}
                                    // size={"18%"}
                                    size={30}
                                    autoFocus={false}
                                    inputPosition='left'
                                    activeColor='#000'
                                    inactiveColor='#000'
                                    keyboardType={'number-pad'}
                                    // containerStyle={{ justifyContent: 'center', alignItems: 'center'}}
                                    codeInputStyle={{ height: 30, fontSize: 20 }}
                                    onFulfill={(code) => this._onFulfill('year', code)}
                                />
                                <Text style={{ fontSize: 14, marginTop: 34, textAlign: 'center' }}>Year</Text> */}
                            {/* </View> */}
                        </View>
                        <SubmitButton title={translate("Continue")} onPress={() => this.onSubmit()} />
                        {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onSubmit()}>
                            <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>CONTINUE</Text>
                            </ImageBackground>
                        </TouchableOpacity> */}
                    </View>
                </KeyboardAwareScrollView>
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
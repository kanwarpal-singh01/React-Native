import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    FlatList
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { translate } from '../../helper/translationHelper';

export default class Interested extends Component {
    constructor(props) {
        super(props);
        this.state = {
            male: true,
            women: false,
            both: false,
            loading: false,
            userID: ''

        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    onclick(first, second, third) {
        this.setState({ male: first, women: second, both: third })
    }

    onSubmit() {
        let abc
        if (this.state.male == true) {
            abc = 'Male'
        } else if (this.state.women == true) {
            abc = 'Female'
        } else if (this.state.both == true) {
            abc = 'Both'
        }
        this.setState({ loading: true })
        let body = { intrested_in: abc, user_id: this.state.userID }
        console.log(body)
        axios
            .post(apiUrl + 'profile-completion', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.props.navigation.navigate('Height')
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <View style={{ flexGrow: 1, alignItems: 'center' }}>
                        <BackBtn navigation={this.props.navigation} />
                        <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                        <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70, letterSpacing: 1 }}>{translate("Who are you interested in")}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 40, marginHorizontal: 8, alignItems: 'center' }}>
                            <TouchableOpacity style={{}} onPress={() => this.onclick(true, false, false)}>
                                <Image source={this.state.male == true ? require('../../assets/Ellipse.png') : require('../../assets/firstScreen/radioInActive.png')} style={{ height: 28, width: 28 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 8, marginRight: 24 }}>{translate("Men")}</Text>
                            <TouchableOpacity style={{}} onPress={() => this.onclick(false, true, false)}>
                                <Image source={this.state.women == true ? require('../../assets/Ellipse.png') : require('../../assets/firstScreen/radioInActive.png')} style={{ height: 28, width: 28 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 8, marginRight: 16 }}>{translate("Women")}</Text>
                            <TouchableOpacity style={{}} onPress={() => this.onclick(false, false, true)}>
                                <Image source={this.state.both == true ? require('../../assets/Ellipse.png') : require('../../assets/firstScreen/radioInActive.png')} style={{ height: 28, width: 28 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 8 }}>{translate("Both")}</Text>
                        </View>
                        <SubmitButton title={translate("Continue")} onPress={() => this.onSubmit()} />
                        {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onSubmit()}>
                            <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>CONTINUE</Text>
                            </ImageBackground>
                        </TouchableOpacity> */}
                    </View>
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
import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    PermissionsAndroid,
    Alert,
    Platform
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';

import { translate } from '../../helper/translationHelper';


export default class AllowLocations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Lat: null,
            Long: null,
            userID: '',
            loading: false,
            permission: false,
        }
    }

    async componentDidMount() {
        this.checkPermission();
        this.setState({ userID: await AsyncStorage.getItem('userID') })
        Geolocation.getCurrentPosition(info => this.setState({ Lat: info.coords.latitude, Long: info.coords.longitude }));
    }

    checkPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: translate('Storage Permission Required'),
                    message:
                        translate('Application needs access to your storage to download File'),
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED || Platform.OS == "ios") {
                this.setState({ permission: true });
                if (!this.state.Lat || !this.state.Long) {
                    Geolocation.getCurrentPosition(info => this.setState({ Lat: info.coords.latitude, Long: info.coords.longitude }));
                }
                console.log('Storage Permission Granted.');
            } else {
                this.setState({ permission: false });
                // If permission denied then show alert
                Alert.alert('Error', translate('Storage Permission Not Granted'));
            }
        } catch (err) {
            // To handle permission related exception
            console.log("++++" + err);
        }
    }

    enableButton() {
        if (this.state.permission || Platform.OS == "ios") {
            this.setState({ loading: true })
            let body = { lat: this.state.Lat, lng: this.state.Long, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.navigation.navigate('Name')
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
            this.checkPermission();
        }
    }


    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
                    <View style={{ flexGrow: 1, alignItems: 'center' }}>
                        <BackBtn navigation={this.props.navigation} />
                        <Image source={require('../../assets/firstScreen/location.png')} resizeMode={'contain'} style={{ height: 150, marginHorizontal: 16, marginTop: 70 }} />
                        <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 60, letterSpacing: 2 }}>{translate("Enable Location")}</Text>
                        <Text style={{ color: 'gray', fontSize: 12, fontFamily: 'Montserrat-Regular', marginHorizontal: 60, textAlign: 'center', marginTop: 16 }}>{translate("Youneed to enable your location in order to use The Spot")}</Text>
                        <SubmitButton title={translate("ALLOW location")} onPress={() => this.enableButton()} />
                        {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.enableButton()}>
                            <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>ALLOW LOCATION</Text>
>>>>>>> f18dab226c480c57ae47ce0ac6299c1ce2509041
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
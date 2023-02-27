import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from "react-native-video";
import ActionSheet from 'react-native-actionsheet'

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';

import { translate } from '../../../helper/translationHelper';

import Geolocation from '@react-native-community/geolocation';
export default class LocationOffScreen extends Component {
    constructor(props) {
        console.log("------story component")
        super(props);
        this.state = {
            fileUri: "",
            renderImage: '',
            loading: false,
            userID: '',
            vedioURL: '',
            storyStatus: 1,
            storySaveStatus: false,
            video: null
        }
    }

    async componentDidMount() {
        Geolocation.getCurrentPosition(async info => {
            console.log("Location Info--->", info);
         this.props.navigation.navigate('Location');
        })
    }

   
    render() {

        return (
            <>
                <ImageBackground style={{ flex: 1, width: null, height: null,}}>
                    <SafeAreaView style={{ flexGrow: 0, backgroundColor: 'white' }} />
                  
                    <View style={{ flex: 1, backgroundColor: '#f2f2f6', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={require('../../../assets/grayss.png')} style={{ height: 43, width: 27 }} />
                    <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Bold', color: '#FF5000', fontSize: 14, marginTop: 16 }}>Please allow location to access this application</Text>
                    <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Regular', color: '#535253', fontSize: 12, marginTop: 8, marginHorizontal: 100 }}>Open Your Application Settings To Turn On Your Location If Location Is Never</Text>
                </View>
                </ImageBackground>
            </>
        )

    }
}


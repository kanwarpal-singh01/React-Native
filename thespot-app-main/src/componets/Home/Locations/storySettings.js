import React, { Component } from 'react';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Switch
} from 'react-native';

import { translate } from '../../../helper/translationHelper';


export default class StorySettings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            storySave: false,
            everyone: true,
            chat: false
        }
    }

    async componentDidMount() {
        let { storyStatuss, storySveStatuss } = this.props.route.params
        console.log(storyStatuss, storySveStatuss)
        this.setState({ storySave: storySveStatuss == 0 ? false : true, everyone: storyStatuss == 1 ? true : false, chat: storyStatuss == 2 ? true : false })
        this.setState({ userID: await AsyncStorage.getItem('userID') }, () => {
            // this.SettingDetails()
        })
    }

    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    valueChange(first, second) {
        this.setState({ everyone: first, chat: second })
    }

    SettingDetails() {
        this.setState({ loading: true }) //1= everyone , 2 = only chats
        let body = { user_id: this.state.userID, story_status: this.state.everyone == true ? 1 : 2, story_save_status: this.state.storySave == true ? 1 : 0 } //0 = not save , 1= save
        console.log("status mai kya ja rha h",body)
        axios
            .post(apiUrl + 'stories-status', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.props.navigation.goBack()
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
                <ImageBackground style={{ flex: 1, width: null, height: null, backgroundColor: 'white' }}>
                    <SafeAreaView style={{ flexGrow: 0, backgroundColor: 'white' }} />
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', flexShrink: 1, marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Image source={require('../../../assets/chat/backGray.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF3B00' }}>{translate("Story Settings")}</Text>
                        {/* <TouchableOpacity style={{}} onPress={() => this.props.navigation.goBack()}>
                        <Image source={require('../../../assets/locations/grayClose.png')} style={{ height: 18, width: 18 }} />
                    </TouchableOpacity> */}
                        <TouchableOpacity onPress={() => this.SettingDetails()}>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#f76128' }}>{translate("Done")}</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={{ flex: 1, backgroundColor: '#EDEDED', marginHorizontal: 24, marginVertical: 8, borderRadius: 16 }}>
                        {/* <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%',backgroundColor:"green" }}>
                            <View style={{ marginLeft: 16, marginVertical: 16,backgroundColor:"red" }}>
                                <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Medium', color: '#262626', width: '80%' }}>{translate("Save stories to camera roll automatically")}</Text>
                            </View>
                            <Switch style={{ right: 24, transform: [{ scaleX: .8 }, { scaleY: .7 }] }}
                                value={this.state.storySave}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.onChange('storySave', newValue)} />
                        </View> */}
                        {/* <Text style={{ backgroundColor: '#b4b4b4', flex: 1, height: 1, marginHorizontal: 60, marginVertical: 16 }}></Text> */}
                        <View style={{ marginVertical: 16, marginHorizontal: 16 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Medium', color: '#262626', }}>{translate("Story is visible to")}</Text>
                            <TouchableOpacity style={{ flexDirection: 'row', marginVertical: 16, marginHorizontal: 12, alignItems: 'center' }} onPress={() => this.valueChange(true, false)}>
                                <Image source={this.state.everyone == true ? require('../../../assets/locations/radioActive.png') : require('../../../assets/home/radio.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#262626' }}>{translate("Everyone")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', marginHorizontal: 12, alignItems: 'center' }} onPress={() => this.valueChange(false, true)}>
                                <Image source={this.state.chat == true ? require('../../../assets/locations/radioActive.png') : require('../../../assets/home/radio.png')} style={{ width: 20, height: 20, marginRight: 8 }} />
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#262626', }}>{translate("People from chat")}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </>
        )
    }
}
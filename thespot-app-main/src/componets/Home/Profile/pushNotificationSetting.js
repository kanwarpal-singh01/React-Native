import React, { Component } from 'react';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { translate } from '../../../helper/translationHelper';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Switch,
    StyleSheet
} from 'react-native';


export default class EditPushNotifications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            newMessage: '',
            messagesss: '',
            hotSpot: '',
            inYourSpot: '',
            likes: '',
            views: '',
            userID: '',
            loading: false
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') }, () => {
            this.getNotificationsSetting()
        })
    }

    toggleValueChange = (name, value) => {
        this.setState({ [name]: value })
    }

    incognitoModeChange() {
        this.state.incognito == true ? this.setState({ incognito: false }) : this.setState({ incognito: true })
    }

    onInterestedClick(first, second, third) {
        this.setState({ men: first, women: second, both: third })
    }

    getNotificationsSetting() {
        this.setState({ loading: true })
        let body = { user_id: this.state.userID }
        console.log(body)
        axios
            .post(apiUrl + 'notification-setting-list', body)
            .then((response) => {
                console.log(response.data.data.messages == 1 ? true : false)
                this.setState({ loading: false })
                if (response.data.status == 1) {
                    this.setState({
                        messagesss: response.data.data.messages == 1 ? true : false, hotSpot: response.data.data.hot_spot == 1 ? true : false,
                        likes: response.data.data.likes == 1 ? true : false, views: response.data.data.views == 1 ? true : false,
                        newMessage: response.data.data.new_messages == 1 ? true : false, inYourSpot: response.data.data.in_hotspot == 1 ? true : false
                    })
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    onNotifications() {
        this.setState({ loading: true })
        let body = {
            user_id: this.state.userID, hot_spot: this.state.hotSpot == true ? 1 : 0, likes: this.state.likes == true ? 1 : 0, views: this.state.views == true ? 1 : 0,
            new_messages: this.state.newMessage == true ? 1 : 0, messages: this.state.messagesss == true ? 1 : 0, in_hotspot: this.state.inYourSpot == true ? 1 : 0
        }
        console.log(body)
        axios
            .post(apiUrl + 'notification-setting', body)
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

    toggleValueChange = (stateName) => {
        this.setState((previousState) => ({ ...this.state, [stateName]: !previousState[stateName] }))
    }

    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <ImageBackground style={{ flex: 1, width: null, height: null }}>
                    <SafeAreaView style={{ backgroundColor: 'white' }} />
                    <View style={{ backgroundColor: 'white' }}>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginVertical: 16 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                                <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Push Notifications")}</Text>
                            <TouchableOpacity onPress={() => this.onNotifications()}>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000' }}>{translate("Done")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("New Messages")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.newMessage}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('newMessage', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('newMessage')}>
                                <Image source={this.state.newMessage == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever someone wants to start a chat with you")}</Text>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("Messages")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.messagesss}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('messagesss', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('messagesss')}>
                                <Image source={this.state.messagesss == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever you receive a message")}</Text>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("Hot-Spots")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.hotSpot}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('hotSpot', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('hotSpot')}>
                                <Image source={this.state.hotSpot == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever you're in a hot-spot (a radius with many spotters)")}</Text>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("In Your Spot")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.inYourSpot}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('inYourSpot', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('inYourSpot')}>
                                <Image source={this.state.inYourSpot == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever someone you've chatted with enters your spot")}</Text>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("Likes")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.likes}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('likes', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('likes')}>
                                <Image source={this.state.likes == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever someone has liked your profile")}</Text>
                        <View style={style.mainViewStyle}>
                            <Text style={style.viewTitleText}>{translate("Views")}</Text>
                            {/* <Switch style={style.switchStyle}
                                value={this.state.views}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('views', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('views')}>
                                <Image source={this.state.views == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <Text style={style.smallText}>{translate("Whenever someone has viewed your profile")}</Text>
                    </ScrollView>
                </ImageBackground>
            </>
        )
    }
}

const style = StyleSheet.create({
    mainViewStyle: {
        height: 40,
        marginTop: 16,
        backgroundColor: 'white',
        flexDirection: 'row',
        marginHorizontal: 18,
        alignItems: 'center'
    },
    viewTitleText: {
        fontSize: 14,
        fontFamily: 'Montserrat-Regular',
        marginLeft: 14,
        flex: 1,
        color: '#262626'
    },
    switchStyle: {
        transform: [{ scaleX: .8 },
        { scaleY: .7 }],
        marginRight: 16,
        alignSelf: 'center'
    },
    smallText: {
        fontSize: 8,
        fontFamily: 'Montserrat-Light',
        marginLeft: 32,
        marginTop: 8
    }

})
import React, { Component } from 'react';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions
} from 'react-native';

import { translate } from '../../../helper/translationHelper';

export default class LikesViews extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: '',
            responseData: [],
            photoURL: ''
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') }, () => {
            console.log(this.state.userID)
            this.viewLikes()
        })
        this._unsubscribe = this.props.navigation.addListener('focus', async () => {
            // this.fetchChatData()// this block will call when user come back
            this.viewLikes()
          });
    }

    viewLikes() {
        this.setState({ loading: true })
        let body = { user_id: this.state.userID }
        console.log("like and view body ", body)
        axios
            .post(apiUrl + 'like-views-list', body)
            .then((response) => {
                console.log("LIke and View data", response.data.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.setState({ responseData: response.data.data, photoURL: response.data.profile_url })
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
                <SafeAreaView style={{ flexGrow: 0, backgroundColor: 'white' }} />
                <View style={{ backgroundColor: 'white' }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                        <TouchableOpacity onPress={() =>  this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Location' }]
      })}>
                            <Image source={require('../../../assets/chat/backGray.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, color: '#FF5000', fontFamily: 'Montserrat-Bold' }}>{translate("Likes_Views")}</Text>
                        <TouchableOpacity style={{}}>
                            <Image style={{ height: 24, width: 26 }} />
                        </TouchableOpacity>
                    </View>
                </View>
                {this.state.responseData.length == 0 && <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <View style={{ flex: 1, backgroundColor: '#f2f2f6', marginHorizontal: 16, marginBottom: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ flexDirection: "row" }}>
                            <Image source={require('../../../assets/not_found/grayHeart.png')} style={{ height: 31, width: 35, marginRight: 10 }} resizeMode="cover" />
                            <Image source={require('../../../assets/not_found/view.png')} style={{ height: 22, width: 35, marginLeft: 10 }} resizeMode="cover" />
                        </View>

                        <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Bold', color: '#FF5000', fontSize: 14, marginTop: 16, textTransform: "uppercase" }}>{translate("No Notifications Yet")}</Text>
                        <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Regular', color: '#535253', fontSize: 12, marginTop: 8, marginHorizontal: 100 }}>{translate("Open your Spot to chat with people nearby")}</Text>
                    </View>
                </View>}
                {this.state.responseData.length != 0 && <ScrollView style={{ backgroundColor: 'white', flex: 1 }}>
                    <View style={{ backgroundColor: '#f2f2f6', marginHorizontal: 16, flex: 1, borderRadius: 16, marginTop: 8, marginBottom: 16, }}>
                        {this.state.responseData.map((data) => {
                              let storyColor = "white";
                              if (data?.story_status > 0) {
                                storyColor = "#ff5000";
                              }
                            return <TouchableOpacity
                                onPress={() => this.props.navigation.navigate('ViewUserDeatils', { id: data.user_id, distance: data?.distance_show_value, coming: 'Home' })}
                                style={{ flexDirection: 'row', marginHorizontal: 16, marginVertical: 16, alignItems: 'center' }}
                            >
                                <Image source={{ uri: this.state.photoURL + data.profile_image }} style={{ height: 80, width: 80, borderColor: storyColor, borderRadius: 40, borderWidth: 3, }} />
                                <View style={{width:"66%",justifyContent:"center"}}>
                                <Text style={{ fontSize: 19, marginHorizontal: 14,  fontFamily: 'Montserrat-Bold',}}>{data.name}</Text>
                                <Text style={{ fontSize: 10, marginHorizontal: 14, fontFamily: "Montserrat-Regular",}}>{data.created_at}</Text>
                                </View>
                              
                                <Image source={data.type == 'View' ? require('../../../assets/locations/viewEye.png') : require('../../../assets/locations/doubleHeart.png')} style={data.type == "View" ? style.viewImageStyle : style.likeImageStyle} />
                            </TouchableOpacity>
                            
                        })}
                    </View>
                </ScrollView>}
            </>
        )
    }
}

const style = StyleSheet.create({
    viewImageStyle: {
        height: 22,
        width: 34
    },
    likeImageStyle: {
        height: 25,
        width: 28
    }
})
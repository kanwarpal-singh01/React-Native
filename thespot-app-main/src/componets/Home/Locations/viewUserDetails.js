import React, { Component } from 'react';
import { SliderBox } from "react-native-image-slider-box";
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
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
} from 'react-native';

import { translate } from '../../../helper/translationHelper';


export default class ViewUserDeatils extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: '',
            viewUserId: '',
            heartChange: false,
            userName: '',
            userAge: '',
            userPhotoURL: '',
            userBio: '',
            userHeight: '',
            userDistance: '',
            imageBannerData: [],
            profileUserID: '',
            comingFrom: '',
            userNationality: "",
        }
    }

    async componentDidMount() {

        this.setState({ userID: await AsyncStorage.getItem('userID') }, () => {
            this.getProfile()
        })
        let { id, distance, coming } = this.props.route.params
        console.log(id, distance, coming);
        this.setState({ viewUserId: id, userDistance: distance, comingFrom: coming })

    }

    likesAndUnlikeUser() {
        this.setState({ loading: true })
        let body = { user_id: this.state.userID, like_user_id: this.state.viewUserId }

        console.log("body", body);

        axios
            .post(apiUrl + 'like-unlike-user', body)
            .then((response) => {
                this.setState({ loading: false })
                // Toast.show(response.data.message)

                console.log("Some Response Data ---->", response.data);

                if (response.data.status == 1) {
                    response.data.message == "Liked" ? this.setState({ heartChange: true }) : this.setState({ heartChange: false })
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }
    chatScreenRedirect(arrayVal){
        let body = { user_id: this.state.userID,receiver_id: arrayVal.id}

        console.log("body", body);

        axios
            .post(apiUrl + 'getChatPremiumStatus', body)
            .then((response) => {
                this.setState({ loading: false })
                console.log("Some Response Data ---->", response.data);
                if (response.data.status == 1) {
                    if(response.data.data.subscription==1){
                        this.props.navigation.navigate('ChatScreen', arrayVal);
                    }else if(response.data.data.totalCountToday < 3){
                        this.props.navigation.navigate('ChatScreen', arrayVal)
                    }else{
                        this.props.navigation.navigate('Subscription')
                    }
                    
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
        
    }
    getProfile() {
        this.setState({ loading: true })
        let body = { user_id: this.state.userID, detail_user_id: this.props.route.params.id }
        console.log("User detail body --->", body);
        axios
            .post(apiUrl + 'user_detail', body)
            .then(async (response) => {
                this.setState({ loading: false })

                if (response.data.status == 1) {
                    let bannerImage = [];
                    let filteredImage = response.data.data.images.filter(image => image);
                    if (filteredImage.length > 0) {
                        filteredImage.forEach(image => {
                            bannerImage.push(response.data.profile_url + image);
                        })
                    } else {
                        bannerImage.push(response.data.profile_url + "no_image.jpg");
                    }
                    console.log(bannerImage,"tarun");
                    this.setState({
                        userNationality: response.data.data.user_detail.nationality,
                        userName: response.data.data.name, userAge: response.data.data.age, userPhotoURL: response.data.profile_url,
                        userBio: response.data.data.user_detail.bio, userHeight: response.data.data.user_detail.height, profileUserID: response.data.data.id,
                        imageBannerData: bannerImage,
                        heartChange: response.data.data.isLiked == 1 ? true : false
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

    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <ImageBackground style={{ flex: 1, width: null, height: null, backgroundColor: 'white' }}>
                    <SafeAreaView style={{ backgroundColor: 'white' }} />
                    <View style={{ backgroundColor: 'white' }}>
                        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                            <TouchableOpacity onPress={() => this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' , params: { coming_from: this.props.route.params.coming_from }}],
                })}>
                                <Image source={require('../../../assets/chat/backGray.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            {
                                this.state.userDistance ? <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{this.state.comingFrom == 'Profile' ? '' : this.state.userDistance ? this.state.userDistance + " " + translate('Away') : ""}</Text> : console.log('--', this.state.userDistance)
                            }
                            {this.state.comingFrom == 'Profile' &&
                                <Image style={{ height: 24, width: 24 }}/>}
                            {this.state.comingFrom != 'Profile' &&
                                <TouchableOpacity style={{}} onPress={() => this.likesAndUnlikeUser()}>
                                    <Image source={this.state.heartChange == true ? require('../../../assets/locations/doubleHeart.png') : require('../../../assets/locations/grayHeart.png')} style={{ height: 25, width: 28 }} />
                                </TouchableOpacity>}
                        </View>
                    </View>
                    <ScrollView>
                        <View style={{ marginHorizontal: 16, backgroundColor: '#f2f2f6', marginTop: 12, borderRadius: 16, flex: 1 }}>
                            <View style={{ flex: 4, alignItems: 'center', borderRadius: 4, borderColor: '#ff5000', borderWidth: 4, overflow: "hidden" }}>
                                <SliderBox
                                    images={this.state.imageBannerData}
                                    ImageComponentStyle={{ height: Dimensions.get('screen').height - 380, width: Dimensions.get('screen').width - 40 }}
                                    // sliderBoxHeight={60}
                                    imageLoadingColor="#55B647"
                                    dotColor="white"
                                    inactiveDotColor="black"
                                    dotStyle={{ width: 10, height: 10, borderRadius: 5, borderColor: 'white', borderWidth: 1 }}
                                    // circleLoop
                                    disableOnPress={false}
                                // autoplay
                                // onCurrentImagePressed={index => console.log()}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ marginHorizontal: 24, marginVertical: 16, flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={{ flex: 2 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-Bold' }}>{this.state.userName}</Text>
                                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-Regular' }}> {this.state.userAge}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'Montserrat-Light', marginTop: 6, marginRight: 8 }}>{this.state.userNationality}</Text>
                                            <Text style={{ fontSize: 10, fontFamily: 'Montserrat-Light', marginTop: 6 }}>{this.state.userHeight + " " + translate('cm')}</Text>
                                        </View>

                                    </View>
                                    {this.state.comingFrom != 'Profile' && <TouchableOpacity style={{ flex: 1, flexDirection: 'row', justifyContent: "center", alignItems: 'center' }} onPress={() => this.chatScreenRedirect({ id: this.props.route.params.id, name: this.state.userName, image: this.state.imageBannerData[0] })}>
                                        <Image source={require('../../../assets/locations/chatIcon.png')} style={{ height: 25, width: 25, marginRight: 8 }} />
                                        <Text style={{ fontSize: 15, fontFamily: 'Montserrat-Medium' }}>{translate("Chat")} </Text>
                                    </TouchableOpacity>}
                                </View>
                                <Text style={{ flex: 1, backgroundColor: '#e2e2e2', height: 2, marginHorizontal: 36 }}></Text>
                                <Text style={{ marginHorizontal: 24, marginVertical: 12, textAlign: 'center' }}>{this.state.userBio}</Text>
                                <Text style={{ flex: 1, backgroundColor: '#e2e2e2', height: 2, marginHorizontal: 36, marginBottom: this.state.comingFrom == 'Profile' ? 36 : 0 }}></Text>
                                {this.state.comingFrom != 'Profile' &&
                                    <TouchableOpacity style={{ marginVertical: 24 }} onPress={() => this.props.navigation.navigate('Report', { report_user_id: this.state.profileUserID })}>
                                        <Text style={{ marginHorizontal: 36, textAlign: 'center', color: '#FF5000', fontSize: 12, fontFamily: 'Montserrat-Bold' }}>{translate('Report') + " " + this.state.userName}</Text>
                                    </TouchableOpacity>}
                            </View>

                        </View>
                    </ScrollView>
                </ImageBackground>
            </>
        )
    }
}

import React, { Component, useCallback } from 'react';
import { AuthContext } from '../../../navigations/context';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MulitSdiler from '@ptomasroos/react-native-multi-slider';

import { translate,changeLanguage } from '../../../helper/translationHelper';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    Linking
} from 'react-native';

class EditSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            incognito: false,
            men: false,
            women: true,
            both: false,
            Sound: false,
            Vibration: false,
            silderValue: [18, 30],
            loading: false,
            userID: '',
            languageTagVal:"en",
            storySave: false,
        }
    }

    async componentDidMount() {
       
        let languageVal=await AsyncStorage.getItem('language');
        if(languageVal != null){
            this.setState({ languageTagVal: await AsyncStorage.getItem('language')})
        }
        let { response } = this.props.getdata
        console.log('hello data', response.data.user_detail.intrested_in)
        if (response.data.user_detail.intrested_in == 'Male') {
            this.setState({ men: true, women: false, both: false })
        } else if (response.data.user_detail.intrested_in == 'Female') {
            this.setState({ men: false, women: true, both: false })
        } else if (response.data.user_detail.intrested_in == 'Both') {
            this.setState({ men: false, women: false, both: true })
        }
        this.setState({
            incognito: response.data.user_detail.incognito_mode == 1 ? true : false, Sound: response.data.user_detail.notification_sound == 1 ? true : false,storySave: response.data.user_detail.story_save_status == 0 ? false : true,
            Vibration: response.data.user_detail.notification_vibration == 1 ? true : false, silderValue: [Number(response.data.user_detail.age_group.split('-')[0]), Number(response.data.user_detail.age_group.split('-')[1])]
        })
        this.setState({ userID: await AsyncStorage.getItem('userID') })
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

    logoutButtonAction() {
        AsyncStorage.getAllKeys()
            .then(keys => {
                console.log(keys,"#21321312321");
                AsyncStorage.multiRemove(["device_id", "userID", "token"])
            }
            )
            .then(() => (''))
        this.props.appContext()
    }

    alertSignout = () => Alert.alert(
        translate("Confirmation"),
        translate("Are you sure_You want to logout"),
        [ 
            {
                text: translate("Cancel"),
                style: "Cancel"
            },
            { text: translate("Logout"), onPress: () => this.logoutButtonAction() }
        ],
        { cancelable: false }
    );

    alertDeleteAccount = () => Alert.alert(
        translate("Confirmation"),
        translate("Are you sure_You want to Delete this Account"),
        [
            {
                text: translate("Cancel"),
                style: translate("Cancel"),
            },
            {
                text: translate("Delete"), onPress: () => {
                    this.onDeleteAccount()
                }
            }
        ],
        { cancelable: false }
    );

    onSubmit() {
        this.setState({ loading: true })
        
        let abc
        if (this.state.men == true) {
            abc = 'Male'
        } else if (this.state.women == true) {
            abc = 'Female'
        } else if (this.state.both == true) {
            abc = 'Both'
        }
        let body = {
            user_id: this.state.userID, story_save_status: this.state.storySave == true ? 1 : 0, notification_sound: this.state.Sound == true ? 1 : 0, notification_vibration: this.state.Vibration == true ? 1 : 0, incognito_mode: this.state.incognito == true ? 1 : 0,
            age_group: this.state.silderValue[0] + '-' + this.state.silderValue[1], intrested_in: abc
        } //0 = off 1= on // 0 = normal model 1= mode on 
        console.log(body)
        axios
            .post(apiUrl + 'profile-completion', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    if(this.state.languageTagVal == "ar"){
                    changeLanguage({languageTag:"ar", isRTL: false})
                    }else{
                    changeLanguage({languageTag:"en", isRTL: false})
                    }
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

    onDeleteAccount() {
        let body = { user_id: this.state.userID }
        console.log(body)
        axios
            .post(apiUrl + 'delete-account', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.logoutButtonAction()
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
        this.setState((previousState) => ({ ...this.state, [stateName]: !previousState[stateName]}))
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
                                <View style={{ height: 20, width: 50 }}>
                                    <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                                </View>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Edit Settings")}</Text>
                            <TouchableOpacity onPress={() => this.onSubmit()}>
                                <View style={{ height: 20, width: 60 }}>
                                    <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000', textAlign: 'right' }}>{translate("Done")}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 36, marginHorizontal: 20 }}>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253' }}>{translate("Go Incognito")} </Text>
                            {/* <Text style={{ fontSize: 9, fontFamily: 'Montserrat-Regular', color: '#535253' }}>(Don't appear on map)</Text> */}
                        </View>
                        <View style={{ height: 40, marginTop: 20, backgroundColor: 'white', flexDirection: 'row', marginHorizontal: 18, alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>{translate("Appear On The Map")}</Text>
                            <TouchableOpacity onPress={() => this.incognitoModeChange()}>
                                <Image source={this.state.incognito == false ? require('../../../assets/locations/listToggel.png') : require('../../../assets/locations/toggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', marginHorizontal: 25, marginTop: 5, alignItems: 'center' }}>
                            <Text style={{ fontSize: 9, fontFamily: 'Montserrat-Regular', color: '#535253' }}>({translate("if you turn off then you will become invisible on the map and you will also not be able to see any other user")})</Text>
                        </View>

                        {/* <TouchableOpacity onPress={() => this.incognitoModeChange()}>
                            <View style={{ height: 40, marginTop: 10, backgroundColor: 'white', marginHorizontal: 16, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 16, fontWeight: '400', marginLeft: 14, color: 'gray' }}>{this.state.incognito == false ? 'Invisible On Map' : 'Visible On Map'}</Text>
                            </View>
                        </TouchableOpacity> */}
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginHorizontal: 20, marginTop: 24 }}>{translate("Age Group")}</Text>
                        <View style={{ height: 80, marginTop: 10, flex: 1, backgroundColor: 'white', marginHorizontal: 16, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626' }}>{translate('Between') + ' ' + this.state.silderValue[0] + " " + translate('and') + " " + this.state.silderValue[1]}{this.state.silderValue[1] == 60 ? "+" : ""}</Text>
                            <MulitSdiler
                                sliderLength={Dimensions.get("window").width - 70}
                                min={18}
                                max={60}
                                values={this.state.silderValue}
                                allowOverlap={true}
                                onValuesChange={value => this.setState({ silderValue: value })}
                                containerStyle={{ marginHorizontal: 18, height: 40 }}
                                selectedStyle={{ backgroundColor: '#f87a49' }}
                                unselectedStyle={{ backgroundColor: '#e0e0e0' }}
                                markerStyle={{ backgroundColor: '#f87a49', borderColor: '#f87a49', height: 26, width: 26 }}
                                enabledTwo={true}
                            />
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginHorizontal: 20, marginTop: 24 }}>{translate("Language")}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 10, marginHorizontal: 16,alignItems:"center" }}>
                            <TouchableOpacity style={{}} onPress={() => {;
                            this.setState({languageTagVal:"en"});
                        }}>
                                <Image source={this.state.languageTagVal == "en" ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 24 }}>{translate("English")}</Text>
                            <TouchableOpacity style={{}} onPress={() => {;
                        this.setState({languageTagVal:"ar"});
                        }}>
                                <Image source={this.state.languageTagVal == "ar" ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 16 }}>{translate("Arabic")}</Text>
                           
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginHorizontal: 20, marginTop: 22 }}>{translate("Interested In")}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 10, marginHorizontal: 16,alignItems:"center"}}>
                            <TouchableOpacity style={{}} onPress={() => this.onInterestedClick(true, false, false)}>
                                <Image source={this.state.men == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 24, }}>{translate("Men")}</Text>
                            <TouchableOpacity style={{}} onPress={() => this.onInterestedClick(false, true, false)}>
                                <Image source={this.state.women == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 16 }}>{translate("Women")}</Text>
                            <TouchableOpacity style={{}} onPress={() => this.onInterestedClick(false, false, true)}>
                                <Image source={this.state.both == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                            </TouchableOpacity>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8 }}>{translate("Both")}</Text>
                        </View>
                        <View style={{ height: 40, marginTop: 24, backgroundColor: 'white', marginHorizontal: 16, alignItems: 'center', flexDirection: 'row', }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>{translate("Notification Sounds")}</Text>
                            {/* <Switch style={{ transform: [{ scaleX: .8 }, { scaleY: .7 }], marginRight: 16, alignSelf: 'center' }}
                                value={this.state.Sound}
                                trackColor={{ true: '#f76128', false: 'gray'}}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('Sound', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('Sound')}>
                                <Image source={this.state.Sound == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40, marginTop: 24, backgroundColor: 'white', flexDirection: 'row', marginHorizontal: 18, alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>{translate("Notification Vibrations")}</Text>
                            {/* <Switch style={{ transform: [{ scaleX: .8 }, { scaleY: .7 }], marginRight: 16, alignSelf: 'center'}}
                                value={this.state.Vibration}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('Vibration', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('Vibration')}>
                                <Image source={this.state.Vibration == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ height: 40, marginTop: 24, backgroundColor: 'white', flexDirection: 'row', marginHorizontal: 18, alignItems: 'center' }}>
                            <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>{translate("Save stories to camera roll automatically")}</Text>
                            {/* <Switch style={{ transform: [{ scaleX: .8 }, { scaleY: .7 }], marginRight: 16, alignSelf: 'center'}}
                                value={this.state.Vibration}
                                trackColor={{ true: '#f76128', false: 'gray' }}
                                thumbColor={'white'}
                                onValueChange={(newValue) => this.toggleValueChange('Vibration', newValue)} /> */}
                            <TouchableOpacity onPress={() => this.toggleValueChange('storySave')}>
                                <Image source={this.state.storySave == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={{ height: 40, marginTop: 24, backgroundColor: 'white', marginHorizontal: 18, justifyContent: 'center' }} onPress={() => this.props.navigation.navigate('EditPushNotifications')}>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginLeft: 14 }}>{translate("Edit Your Notification Settings")}</Text>
                        </TouchableOpacity>

                         {/* <View style={{flexDirection:"row", justifyContent:"space-between",marginHorizontal: 16,marginTop: 24,backgroundColor:"red" }}>
                         <TouchableOpacity style={{ height: 40, width: 182, backgroundColor: 'white', justifyContent: "center", alignSelf: "center", alignItems: "center" }} onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/contact') }>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Contact Us")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ height: 40, width: 182, backgroundColor: 'white', justifyContent: "center", alignSelf: "center", alignItems: "center" }} onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/privacy-policy') }>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Privacy policy")}</Text>
                        </TouchableOpacity>
                         </View> */}
                        <View style={{ flexDirection: 'row', marginTop: 24, justifyContent: 'space-between', marginHorizontal: 16 }}>
                            <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1, marginRight: 16 }} onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/contact')}>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Contact Us")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1 }} onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/privacy-policy') }>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Privacy policy")}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', marginTop: 24, justifyContent: 'space-between', marginHorizontal: 16 }}>
                            <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1, marginRight: 16 }} onPress={() => this.alertSignout()}>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Log Out")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1 }} onPress={() => this.alertDeleteAccount()}>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', color: '#000000', textAlign: 'center' }}>{translate("Delete Account")}</Text>
                            </TouchableOpacity>
                        </View>
                        <Image source={require('../../../assets/home/logoGray.png')} resizeMode={'contain'} style={{ height: 60, width: "90%", marginHorizontal: 16, marginTop: 36 }} />
                        <Text style={{ fontSize: 16, fontWeight: '400', color: 'gray', textAlign: 'center', marginBottom: 40, marginTop: 12 }}>Version 1.0</Text>
                    </ScrollView>
                </ImageBackground>
            </>
        )
    }
}

export default function SignOutComponent({ navigation, route }) {
    const { signOut } = React.useContext(AuthContext)
    return <EditSetting appContext={signOut} navigation={navigation} getdata={route.params} />
}
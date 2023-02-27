import React, { Component, useState } from 'react';
import { AuthContext } from '../../../navigations/context';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MulitSdiler from '@ptomasroos/react-native-multi-slider';

import useCallApi from '../../../helper/useApiCall';

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
} from 'react-native';


const EditSetting = ({ navigation, route }) => {
    const { response: data } = route.params;
    const { signOut } = React.useContext(AuthContext)
    const [gender, setGender] = useState(data?.data.user_detail.intrested_in);
    const [userId, setUserId] = useState(0);
    const [settings, setSettings] = useState({
        sound: data?.data.user_detail.notification_sound == 1 ? true : false,
        vibration: data?.data.user_detail.notification_vibration == 1 ? true : false
    });


    const [incognito, setIncognito] = useState(data?.data.user_detail.incognito_mode == 1 ? true : false);
    const [slider, setSlider] = useState([Number(data?.data.user_detail.age_group.split('-')[0]), Number(data?.data.user_detail.age_group.split('-')[1])]);
    const { call: callProfileApi, data: profileData, loading: profileLoading } = useCallApi('profile-completion');
    const { call: callDeleteApi, data: deleteData, loading: deleteLoading } = useCallApi('delete-account');
    React.useEffect(() => {
        async function getAsyncData() {
            let user_id = await AsyncStorage.getItem('userID');
            setUserId(user_id);
            callProfileApi()
        }

        getAsyncData();
    }, []);

    const toggleSettings = (name, value) => setSettings({ ...settings, [name]: value });
    const incognitoModeChange = () => setIncognito(!incognito);

    const logoutButtonAction = async () => {
        await AsyncStorage.getAllKeys()
            .then(async keys => {
                await AsyncStorage.multiRemove(keys);
            })
            .then(() => (''))
        signOut()
    }

    const alertSignout = () => Alert.alert(
        "Confirmation",
        "Are you sure. You want to logout?",
        [
            {
                text: "Cancel",
                style: "Cancel"
            },
            { text: "Logout", onPress: () => logoutButtonAction() }
        ],
        { cancelable: false }
    );

    const alertDeleteAccount = () => Alert.alert(
        "Confirmation",
        "Are you sure. You want to Delete this Account?",
        [
            {
                text: "Cancel",
                style: "Cancel",
            },
            {
                text: "Delete", onPress: () => onDeleteAccount()
            }
        ],
        { cancelable: false }
    );

    const onSubmit = () => {
        let body = {
            user_id: userId,
            notification_sound: settings.sound ? 1 : 0, //0 = off 1= on // 0 = normal model 1= mode on 
            notification_vibration: settings.vibration ? 1 : 0, //0 = off 1= on // 0 = normal model 1= mode on 
            incognito_mode: incognito ? 1 : 0,//0 = off 1= on // 0 = normal model 1= mode on 
            age_group: slider[0] + '-' + slider[1],
            intrested_in: gender
        }

        console.log({ body })
        callProfileApi(body, (responseData) => {

            console.log(responseData.data);

            if (responseData.data.status == 1) navigation.goBack();
        });
    }

    const onDeleteAccount = () => {
        logoutButtonAction()
        callDeleteApi({ user_id: userId }, (responseData) => {
            Toast.show(responseData.data.message)

            // console.log({ responseData })
            // if (responseData.data.status == 1) {
            logoutButtonAction()
            // }
        })
    }

    return (
        <>
            {deleteLoading && profileLoading && <Spinner />}
            <ImageBackground style={{ flex: 1, width: null, height: null }}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <View style={{ backgroundColor: 'white' }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginVertical: 16 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <View style={{ height: 20, width: 50 }}>
                                <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>Edit Settings</Text>
                        <TouchableOpacity onPress={() => onSubmit()}>
                            <View style={{ height: 20, width: 60 }}>
                                <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000', textAlign: 'right' }}>Done</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <ScrollView>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 36, marginHorizontal: 20 }}>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253' }}>Go Incognito </Text>
                    </View>
                    <View style={{ height: 40, marginTop: 20, backgroundColor: 'white', flexDirection: 'row', marginHorizontal: 18, alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>Appear On The Map</Text>
                        <TouchableOpacity onPress={() => incognitoModeChange()}>
                            <Image source={incognito == false ? require('../../../assets/locations/listToggel.png') : require('../../../assets/locations/toggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 25, marginTop: 5, alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontFamily: 'Montserrat-Regular', color: '#535253' }}>(if you turn off then you will become invisible on the map and you will also not be able to see any other user)</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginHorizontal: 20, marginTop: 24 }}>Age Group</Text>
                    <View style={{ height: 80, marginTop: 10, flex: 1, backgroundColor: 'white', marginHorizontal: 16, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626' }}>{'Between ' + slider[0] + ' and ' + slider[1]}{slider[1] == 60 ? "+" : ""}</Text>
                        <MulitSdiler
                            sliderLength={Dimensions.get("window").width - 70}
                            min={18}
                            max={60}
                            values={slider}
                            allowOverlap={true}
                            onValuesChange={value => setSlider(value)}
                            containerStyle={{ marginHorizontal: 18, height: 40 }}
                            selectedStyle={{ backgroundColor: '#f87a49' }}
                            unselectedStyle={{ backgroundColor: '#e0e0e0' }}
                            markerStyle={{ backgroundColor: '#f87a49', borderColor: '#f87a49', height: 26, width: 26 }}
                            enabledTwo={true}
                        />
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginHorizontal: 20, marginTop: 24 }}>Interested In</Text>
                    <View style={{ flexDirection: 'row', marginTop: 10, marginHorizontal: 16 }}>
                        <TouchableOpacity style={{}} onPress={() => setGender('Male')}>
                            <Image source={gender == 'Male' ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 24 }}>Men</Text>
                        <TouchableOpacity style={{}} onPress={() => setGender('Female')}>
                            <Image source={gender == 'Female' == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 16 }}>Women</Text>
                        <TouchableOpacity style={{}} onPress={() => setGender('Both')}>
                            <Image source={gender == 'Both' == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8 }}>Both</Text>
                    </View>
                    <View style={{ height: 40, marginTop: 24, backgroundColor: 'white', marginHorizontal: 16, alignItems: 'center', flexDirection: 'row', }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>Notification Sounds</Text>
                        <TouchableOpacity onPress={() => toggleSettings('sound', !settings.sound)}>
                            <Image source={settings.sound == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40, marginTop: 24, backgroundColor: 'white', flexDirection: 'row', marginHorizontal: 18, alignItems: 'center' }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#262626', flex: 1 }}>Notification Vibrations</Text>
                        <TouchableOpacity onPress={() => toggleSettings('vibration', !settings.vibration)}>
                            <Image source={settings.vibration == false ? require('../../../assets/locations/toggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 22, width: 40, marginRight: 16 }} />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={{ height: 40, marginTop: 24, backgroundColor: 'white', marginHorizontal: 18, justifyContent: 'center' }} onPress={() => navigation.navigate('EditPushNotifications')}>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginLeft: 14 }}>Edit Your Notification Settings</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', marginTop: 24, justifyContent: 'space-between', marginHorizontal: 16 }}>
                        <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1, marginRight: 16 }} onPress={() => alertSignout()}>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#000000', textAlign: 'center' }}>Log Out</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ height: 40, backgroundColor: 'white', justifyContent: 'center', flex: 1 }} onPress={() => alertDeleteAccount()}>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Regular', marginLeft: 14, color: '#000000', textAlign: 'center' }}>Delete Account</Text>
                        </TouchableOpacity>
                    </View>
                    <Image source={require('../../../assets/home/logoGray.png')} resizeMode={'contain'} style={{ height: 60, width: "90%", marginHorizontal: 16, marginTop: 36 }} />
                    <Text style={{ fontSize: 16, fontWeight: '400', color: 'gray', textAlign: 'center', marginBottom: 40, marginTop: 12 }}>Version 1.0</Text>
                </ScrollView>
            </ImageBackground>
        </>
    )
}

export default EditSetting;


// class EditSetting extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             incognito: false,
//             men: false,
//             women: true,
//             both: false,
//             Sound: false,
//             Vibration: false,
//             silderValue: [18, 30],
//             loading: false,
//             userID: ''
//         }
//     }

//     async componentDidMount() {
//         let { response } = this.props.getdata
//         console.log('hello data', response.data.user_detail.intrested_in)
//         if (response.data.user_detail.intrested_in == 'Male') {
//             this.setState({ men: true, women: false, both: false })
//         } else if (response.data.user_detail.intrested_in == 'Female') {
//             this.setState({ men: false, women: true, both: false })
//         } else if (response.data.user_detail.intrested_in == 'Both') {
//             this.setState({ men: false, women: false, both: true })
//         }
//         this.setState({
//             incognito: response.data.user_detail.incognito_mode == 1 ? true : false, Sound: response.data.user_detail.notification_sound == 1 ? true : false,
//             Vibration: response.data.user_detail.notification_vibration == 1 ? true : false, silderValue: [Number(response.data.user_detail.age_group.split('-')[0]), Number(response.data.user_detail.age_group.split('-')[1])]
//         })
//         this.setState({ userID: await AsyncStorage.getItem('userID') })
//     }



//     render() {
//         return (

//         )
//     }
// }

// export function SignOutComponent({ navigation, route }) {

//     return <EditSetting appContext={signOut} navigation={navigation} getdata={route.params} />
// }
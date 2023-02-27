import React, { Component } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Circle } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import { AuthContext } from '../../../navigations/context';
import { NotificationContext } from '../../../context/notificationCounter';
import { LocalizeContext } from '../../../context/localize';

import { translate } from '../../../helper/translationHelper';
import useCallApi from '../../../helper/useApiCall';
import { useFocusEffect } from '@react-navigation/native';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Switch,
    StyleSheet,
    ScrollView,
    Dimensions,
    Platform,
    StatusBar,
    PermissionsAndroid
} from 'react-native';

import { InterstitialAd, RewardedAd, BannerAd, TestIds, BannerAdSize } from '@react-native-firebase/admob';

const Location = ({ navigation }) => {
    const circle1 = React.useRef();
    const circle2 = React.useRef();
    const circle3 = React.useRef();
    const circle4 = React.useRef();
    const authContext = React.useContext(AuthContext);
    const notification = React.useContext(NotificationContext);
    const localize = React.useContext(LocalizeContext);
    const [userId, setUserId] = React.useState(0);
    const [mapSwitch, setMapSwitch] = React.useState(false);
    const [location, setLocation] = React.useState({ latitude: 26.849028099999998, longitude: 75.80441649999999, latitudeDelta: 0.011, longitudeDelta: 0.001 });
    const { call: callDashboardApi, data: dashboardData, error, loading } = useCallApi('dashboard');
    const { call: callLoginStatus, data: loginStatus, loading: loginStatusLogin } = useCallApi('login-status');
    const { call: callUpdateStatus, data: updateStatus, loading: updateLocationLoding } = useCallApi('update-location');
    React.useEffect(() => {
        async function getAsyncData() {
            let user_id = await AsyncStorage.getItem('userID');
            setUserId(user_id);

            const loginRes = await callLoginStatus({ user_id });
            if (loginRes.data.status == 10) {
                authContext.signOut();
                Toast.show(loginRes.data.message)
            }
        }
        setCircleColors();
        getAsyncData();
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            setCircleColors();
            dashboard(userId);
        }, [userId])
    );

    React.useEffect(() => {
        setCircleColors();
    }, [circle1, circle2, circle3, circle4, mapSwitch]);

    const setCircleColors = () => {
        if (Platform.OS == 'ios' && !mapSwitch) {
            circle1?.current?.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.4)" });
            circle2?.current?.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.3)" });
            circle3?.current?.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
            circle4?.current?.setNativeProps({ fillColor: "rgba(255, 80, 0, 0.2)" });
        }
    }

    const dashboard = (user_id = null) => {
        console.log("dashboard called -0-------0000---0-0-0-0-0---->")

        Geolocation.getCurrentPosition(async info => {
            let body = { lat: info.coords.latitude, lng: info.coords.longitude, user_id: user_id ? user_id : userId };

            const dashboardResult = await callDashboardApi(body);
            console.log(dashboardResult.data.login_user_data)
            setLocation({ ...location, latitude: parseFloat(dashboardResult.data.login_user_data?.lat), longitude: parseFloat(dashboardResult.data.login_user_data?.lng) });
        })
    }
    const navigateToDropMarker = () => {
        if (mapSwitch) {
            setMapSwitch(false);
        } else {
            navigation.navigate('DropMarker')
        }
    }
    const callSetCurrentLanguage = () => {
        let lang = localize.currentLang;
        let languageTag = lang?.languageTag == "ar" ? "en" : "ar";
        localize.setCurrentLanguage({ ...lang, languageTag })
    }
    const currentLocationButton = () => {
        setLocation({ ...location });
    }
    const restoreLocation = () => {
        Geolocation.getCurrentPosition(async info => {
            await callUpdateStatus({ user_id: userId, lat: info.coords.latitude, lng: info.coords.longitude, drop_pin_status: 0 });
            dashboard();
        })
    }
    const listRedirectScreen = (id, names) => {
        navigation.navigate('StoryView', { storyId: id, name: names })
    }

    return (
        <>
            {(loading || loginStatusLogin || updateLocationLoding) && <Spinner />}

            <ImageBackground style={{ flex: 1, width: null, height: null, backgroundColor: 'white' }}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <StatusBar barStyle={'dark-content'} />
                <View style={{ flexDirection: 'row', marginHorizontal: 16, marginTop: 16 }}>
                    <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => navigateToDropMarker()}>
                        {dashboardData?.data?.login_user_data.drop_pin_status == 0 ? <Image source={require('../../../assets/locations/location.png')} style={{ height: 25, width: 16 }} /> : <Image source={require('../../../assets/images/location.png')} style={{ height: 25, width: 16 }} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => navigation.navigate('LikesViews')}>
                        <View style={{ position: "absolute", top: -10, zIndex: 1, backgroundColor: "white", right: 7, padding: 1, borderRadius: 40 }}><Text style={{ fontSize: 12, alignItems: 'center', fontFamily: 'Montserrat-Bold', justifyContent: 'center' }}>{notification.counter}</Text></View>
                        <Image source={require('../../../assets/locations/doubleHeart.png')} style={{ height: 22, width: 25 }} />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={{ paddingHorizontal: 10 }} onPress={() => callSetCurrentLanguage()}>
                        <View style={{ backgroundColor: "#E0E0E0", height: 25, width: 25, alignItems: "center", justifyContent: 'center', borderRadius: 30 }}>
                            <Text>{localize.currentLang.languageTag == "ar" ? "en" : "ar"}</Text>
                        </View>
                    </TouchableOpacity> */}
                    <View style={{ flex: 1 }}></View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Bold' }}>{translate("Map")}</Text>
                        <TouchableOpacity onPress={() => setMapSwitch(currentSwitch => !currentSwitch)}>
                            <Image source={!mapSwitch ? require('../../../assets/locations/mapToggel.png') : require('../../../assets/locations/listToggel.png')} style={{ height: 20, width: 36, marginHorizontal: 8 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Bold' }}>{translate("List")}</Text>
                    </View>
                </View>

                {/* Map View */}
                {!mapSwitch && <View style={{ flex: 1, marginTop: 8, marginBottom: 16, marginHorizontal: 16, borderRadius: 8, overflow: 'hidden' }}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        region={location}
                        onPress={(point) => console.log('point', point)}
                        style={[style.map, { borderRadius: 16 }]}
                    >
                        <Circle
                            ref={circle1}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={100}
                            strokeWidth={0}
                            strokeColor="rgba(252,157,110,255)"
                            fillColor={Platform.OS == 'ios' ? '' : "rgba(255, 80, 0, 0.4)"}
                        />
                        <Circle
                            ref={circle2}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={150}
                            strokeWidth={0}
                            strokeColor="rgba(252,157,110,255)"
                            fillColor={Platform.OS == 'ios' ? '' : "rgba(255, 80, 0, 0.3)"}
                        />
                        <Circle
                            ref={circle3}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={200}
                            strokeWidth={0}
                            strokeColor="rgba(252,157,110,255)"
                            fillColor={Platform.OS == 'ios' ? '' : "rgba(255, 80, 0, 0.2)"}
                        />
                        <Circle
                            ref={circle4}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={250}
                            strokeWidth={3}
                            strokeColor="rgba(255, 80, 0, 0.5)"
                            fillColor={Platform.OS == 'ios' ? '' : "rgba(255, 80, 0, 0.2)"}
                        />
                        <Marker
                            coordinate={{ latitude: parseFloat(location.latitude), longitude: parseFloat(location.longitude) }}
                            zIndex={9999}
                            anchor={{ x: .5, y: .5 }}
                            onPress={() => dashboardData?.data?.login_user_data.story == null ? navigation.navigate('Story', { storyData: dashboardData?.data?.login_user_data.story }) : navigation.navigate('StoryWithViewButton')}
                        >
                            <View style={{ alignItems: 'center' }}>
                                <Image source={dashboardData?.data?.login_user_data.profile_image == null ? { uri: dashboardData?.data.profile_url + "no_image.jpg" } : { uri: dashboardData?.data.profile_url + dashboardData?.data?.login_user_data.profile_image }} style={dashboardData?.data?.login_user_data.story == null ? { height: 52, width: 52, borderRadius: 26 } : style.markerImageBorderStyle} />

                                {dashboardData?.data?.login_user_data.story == null && <Image source={require('../../../assets/locations/plusAdd.png')} style={{ height: 16, width: 16, marginTop: -12, marginLeft: 28 }} />}
                            </View>
                        </Marker>
                        {dashboardData?.data.data.map((data, index) => {
                            return <Marker
                                key={data.id}
                                coordinate={{ latitude: parseFloat(data.lat), longitude: parseFloat(data.lng) }}
                                anchor={{ x: .5, y: .5 }}
                                onPress={() => data.radius_status ? data.story == null ? navigation.navigate('ViewUserDeatils', { id: data.id, distance: data.distance_show_value, coming: 'Home' }) : navigation.navigate('StoryView', { storyId: data.id, name: data.name }) : {}}
                            >
                                <Image blurRadius={data.radius_status ? 0 : 5} source={{ uri: dashboardData?.data.profile_url + data.profile_image }} style={data.story == null ? style.markerImageWithoutBoderStyle : style.markerImageBorderStyle} />
                            </Marker>
                        })}
                    </MapView>
                    <TouchableOpacity style={{ position: 'absolute', bottom: 8, right: 12, zIndex: 1 }} onPress={() => currentLocationButton()}>
                        <Image source={require('../../../assets/locationss.png')} style={{ height: 54, width: 54 }}></Image>
                    </TouchableOpacity>
                    {
                        dashboardData?.data?.login_user_data.drop_pin_status == "1" &&
                        <View style={{ height: 50, width: Dimensions.get('window').width - 33, alignItems: "center", position: "absolute", bottom: 10, }}>
                            <TouchableOpacity style={{
                                alignItems: 'center', justifyContent: 'center',
                                shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.34, shadowRadius: 6.27, elevation: 10,
                                backgroundColor: "white",
                                borderRadius: 12,
                                borderWidth: 2,
                                borderColor: "#FF5000"
                            }} onPress={() => restoreLocation()}>
                                <Text style={{ color: "white", fontSize: 14, alignSelf: "center", marginHorizontal: 20, marginVertical: 10, fontFamily: 'Montserrat-Bold', color: "#FF5000" }}>{translate("Return to your Location")}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                </View>}

                {/* List View */}
                {mapSwitch && dashboardData?.data?.data.length == 0 &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f6', marginHorizontal: 16, marginTop: 8, borderRadius: 16, flex: 1, marginBottom: 16 }}>
                        <Image source={require('../../../assets/not_found/user.png')} style={{ height: 50, width: 50 }} resizeMode={'contain'} />
                        <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Bold', color: '#FF5000', fontSize: 14, marginTop: 16, textTransform: "uppercase" }}>{translate("No User Nearby")}</Text>
                        <Text style={{ textAlign: 'center', fontFamily: 'Montserrat-Regular', color: '#535253', fontSize: 12, marginTop: 8, marginHorizontal: 100 }}>{translate("Keep checking back later")}</Text>
                    </View>}
                {mapSwitch && dashboardData?.data?.data.length > 0 &&
                    <View style={{ backgroundColor: '#f2f2f6', marginHorizontal: 16, marginTop: 8, borderRadius: 16, flex: 1, marginBottom: 16 }}>
                        <ScrollView>

                            {dashboardData?.data?.data.length != 0 &&
                                <Text style={{ color: '#FF5000', marginHorizontal: 16, marginVertical: 16, fontSize: 10, fontFamily: 'Montserrat-Bold' }}>{translate("People in the Spot")}</Text>}

                            {dashboardData?.data?.data.map((data, index) => {
                                if (userId != data.id) {
                                    return <React.Fragment key={data.id}>
                                        <View style={{ flexDirection: 'row', marginHorizontal: 16, alignItems: 'center', marginBottom: 15 }}>
                                            <TouchableOpacity disabled={data.story == null ? true : false} onPress={() => data.radius_status != 1 ? console.log('not in radius') : data.story == null ? navigation.navigate('ViewUserDeatils', { id: data.id, distance: data.distance_show_value, coming: 'Home' }) : listRedirectScreen(data.id, data.name)}>
                                                <Image blurRadius={data.radius_status ? 0 : 5} source={{ uri: dashboardData?.data?.profile_url + data.profile_image }} style={data.radius_status ? data.story == null ? style.imageWithoutBoder : style.imageBoderStyle : style.imageWithoutBoder} />
                                            </TouchableOpacity>
                                            <View style={{ marginHorizontal: 14, flex: 1, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Bold' }}>{data.name + ", " + data.age}</Text>
                                                <Text style={{ fontSize: 8, fontFamily: 'Montserrat-Regular' }}>{data.distance_show_value}</Text>
                                            </View>
                                            {
                                                data.distance_key < 250 && <View>
                                                    <TouchableOpacity disabled={data.radius_status == 1 ? false : true} style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => navigation.navigate('ViewUserDeatils', { id: data.id, distance: data.distance_show_value })}>
                                                        <Image source={require('../../../assets/locations/viewIcon.png')} style={{ height: 24, width: 24, marginRight: 8 }} />
                                                        <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Medium' }}>{translate("View")} </Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={{ flexDirection: 'row', marginTop: 14, alignItems: 'center' }} onPress={() => navigation.navigate('ChatScreen', { id: data.id, name: data.name, image: dashboardData?.data?.profile_url + data.profile_image })}>
                                                        {/* <TouchableOpacity style={{ flexDirection: 'row', marginTop: 14, alignItems: 'center' }} onPress={() => alert("Under Maintenance")}> */}

                                                        <Image source={require('../../../assets/locations/chatIcon.png')} style={{ height: 24, width: 24, marginRight: 8 }} />
                                                        <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Medium' }}>{translate("Chat")} </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            }

                                        </View>
                                        <Text style={{ height: (dashboardData?.data?.data.length - 1 != index || ((index + 1) % 6 == 0)) ? 2 : 0, backgroundColor: 'white', flex: 1, marginHorizontal: 16, marginBottom: (dashboardData?.data?.data.length - 1 == index) ? 8 : 16 }}></Text>
                                        {
                                            ((index + 1) % 6 == 0) &&
                                            <>
                                                <View style={{ alignItems: 'center', marginBottom: 15 }}>
                                                    <BannerAd
                                                        unitId={BannerAd.BANNER}
                                                        size={`${parseInt(Dimensions.get('window').width - 70)}x80`}
                                                        request={{}}
                                                        onAdLoaded={() => console.log('loaded')}
                                                        onAdFailedToLoad={e => console.log('failed to load', e)}
                                                        style={{ width: "100%" }}
                                                    />
                                                </View>
                                                <Text style={{ height: (dashboardData?.data.data.length - 1 == index) ? 0 : 2, backgroundColor: 'white', flex: 1, marginHorizontal: 16, marginBottom: (dashboardData?.data.data.length - 1 == index) ? 8 : 16 }}></Text>
                                            </>
                                        }

                                    </React.Fragment>
                                }
                            })}
                        </ScrollView>
                    </View>}
            </ImageBackground>
        </>
    )
}

export default Location;

const style = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerImageBorderStyle: {
        height: 52,
        width: 52,
        borderRadius: 24,
        borderWidth: 3,
        borderColor: '#ff5000'
    },
    markerImageWithoutBoderStyle: {
        height: 48,
        width: 48,
        borderRadius: 24
    },
    imageBoderStyle: {
        height: 70,
        width: 70,
        borderColor: '#ff5000',
        borderRadius: 35,
        borderWidth: 3
    },
    imageWithoutBoder: {
        height: 70,
        width: 70,
        borderRadius: 35,
    }
})
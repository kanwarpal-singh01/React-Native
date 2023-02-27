import React, { Component, useRef } from 'react';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, Circle } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';

import useCallApi from '../../../helper/useApiCall';
import Spinner from '../../../helper/spinner';
import { translate } from '../../../helper/translationHelper';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';

export default DropMarker = ({ navigation, route }) => {

    const circle = useRef();
    const circle1 = useRef();
    const circle2 = useRef();
    const circle3 = useRef();
    const mapRef = useRef();
    const [userId, setUserId] = React.useState(0);
    const [location, setLocation] = React.useState({ latitude: parseFloat(route?.params?.latLoc), longitude: parseFloat(route?.params?.longLoc), latitudeDelta: 0.011, longitudeDelta: 0.001 });
    const { call: callDashboardApi, data: dashboardData, error, loading } = useCallApi('dashboard');
    const { call: callUpdateLocationApi, data: newLoacationData, loading: newLocationLoading } = useCallApi('update-location');

    React.useEffect(() => {
        async function getAsyncData() {
            let user_id = await AsyncStorage.getItem('userID');
            setUserId(user_id);
            getCurrentLocation(user_id);
        }

        getAsyncData();
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            
            console.log("pppppppppppppcdpppppppp")
            if (userId != 0) {
                
                getCurrentLocation(userId);
            }
        });

        return unsubscribe;
    }, [navigation, userId]);
    // React.useEffect(() => {
    //     console.log("Location Set--->", location);

    // }, [location]);

    // // const changeMarkerLatLng = (coordinate) => {
    // //     callDashboardApi({ lat: coordinate.latitude, lng: coordinate.longitude, user_id: userId });
    // //     setLocation({ ...location, latitude: coordinate.latitude, longitude: coordinate.longitude });
    // // }

    const getCurrentLocation = async (user_id = null) => {
        Geolocation.getCurrentPosition(async (info) => {
            let { latitude, longitude } = info.coords;

            let result = await callDashboardApi({ lat: latitude, lng: longitude, user_id: user_id ? user_id : userId });

            console.log("Result --->", result.data.login_user_data.lat, result.data.login_user_data.lng);

            if (result.data?.login_user_data?.lat && result?.data?.login_user_data?.lng) {
                setLocation({ ...location, latitude: parseFloat(result.data.login_user_data.lat), longitude: parseFloat(result.data.login_user_data.lng) });
            }

        })
    }

    const regionChange = (data) => {
        
        if (data.latitude === location.latitude
            && data.longitude === location.longitude) {
            return;
        }
        
        setLocation(data)
    }

    const confirmLocation = () => {
        callUpdateLocationApi({
            user_id: userId,
            lat: location.latitude,
            lng: location.longitude,
            drop_pin_status: 1
        }, async (data) => {
            await AsyncStorage.setItem("drop_pin_status", "1");
            navigation.navigate("Location")
        });
    }

    const navigateBack = () => {
        route?.params?.from == "profile" ? navigation.navigate("Profile") : navigation.goBack()
        navigation.reset({
            index: 0,
            routes: [{ name: 'Location' }],
        });
    }

    return (
        <>
            {(loading || newLocationLoading) && <Spinner />}
            <ImageBackground style={{ flex: 1, width: null, height: null, backgroundColor: 'white' }}>
                <SafeAreaView style={{ backgroundColor: 'white' }} />
                <View style={{ backgroundColor: 'white' }}>
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 4 }}>
                        <TouchableOpacity onPress={() => navigateBack()}>
                            <View style={{ height: 20, width: 50 }}>
                                <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                            </View>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Drop Pin")}</Text>
                        <View style={{ height: 20, width: 50 }}>
                            <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000' }}> </Text>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, marginTop: 8, marginBottom: 16, marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' }}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        region={location}
                        showsUserLocation={false}
                        style={[style.map, { borderRadius: 16 }]}
                        initialRegion={location}
                        onRegionChangeComplete={regionChange}

                        zoomEnabled
                        zoomControlEnabled
                        zoomTapEnabled
                    >
                        <Circle
                            ref={circle}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={100}
                            strokeWidth={0}
                            onLayout={() => (circle.current.setNativeProps({
                                strokeColor:"rgba(252,157,110,255)",
                            fillColor:"rgba(255, 80, 0, 0.4)",
                              }))}
                            strokeColor={"rgba(252,157,110,255)"}
                            fillColor={"rgba(255, 80, 0, 0.4)"}
                        />
                        <Circle
                            ref={circle1}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={150}
                            strokeWidth={0}
                            onLayout={() => (circle1.current.setNativeProps({
                                strokeColor:"rgba(252,157,110,255)",
                            fillColor:"rgba(255, 80, 0, 0.3)",
                              }))}
                            strokeColor={"rgba(252,157,110,255)"}
                            fillColor={"rgba(255, 80, 0, 0.3)"}
                        />
                        <Circle
                            ref={circle2}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={200}
                            strokeWidth={0}
                            onLayout={() => (circle2.current.setNativeProps({
                                strokeColor:"rgba(252,157,110,255)",
                            fillColor:"rgba(255, 80, 0, 0.2)",
                              }))}
                            strokeColor={"rgba(252,157,110,255)"}
                            fillColor={"rgba(255, 80, 0, 0.2)"}
                        />
                        <Circle
                            ref={circle3}
                            center={{ latitude: location.latitude, longitude: location.longitude }}
                            radius={250}
                            strokeWidth={3}
                            onLayout={() => (circle3.current.setNativeProps({
                                strokeColor:"rgba(255, 80, 0, 0.5)",
                            fillColor:"rgba(255, 80, 0, 0.2)",
                              }))}
                            strokeColor={"rgba(255, 80, 0, 0.5)"}
                            fillColor={"rgba(255, 80, 0, 0.2)"}
                        />
                        {/* <Marker
                            ref={mapRef}
                            coordinate={{ latitude: location.latitude, longitude: location.longitude, }}
                            zIndex={9999}
                            draggable={true}
                            anchor={{ x: .5, y: .5 }}
                            onPress={() => console.log('hei')}
                            onDragEnd={e => changeMarkerLatLng(e.nativeEvent.coordinate)}
                        >
                           <View style={style.markerFixed}>
                        <Image style={style.marker} source={require('../../../assets/Droppin.png')} />
                    </View>
                        </Marker> */}
                        {dashboardData?.data.data?.filter(user => user.id != userId).map((data, index) => {
                            return <Marker
                                key={data.id}
                                ref={mapRef}
                                zIndex={999}
                                coordinate={{ latitude: parseFloat(data.lat), longitude: parseFloat(data.lng) }}
                                anchor={{ x: .5, y: .5 }}
                                onPress={() => data.radius_status ? data.story == null ? console.log('storyy null') : navigation.navigate('StoryView', { storyId: data.id, name: data.name }) : {}}
                            >
                                <Image blurRadius={data.radius_status ? 0 : 5} source={{ uri: dashboardData.data.profile_url + data.profile_image }} style={data.radius_status ? data.story == null ? style.markerImageWithoutBoderStyle : style.markerImageBorderStyle : style.markerImageWithoutBoderStyle} />
                            </Marker>
                        })}
                        5
                    </MapView>
                    <View style={style.markerFixed}>
                        <Image style={style.marker} source={require('../../../assets/Droppin.png')} />
                    </View>
                    <TouchableOpacity style={{
                        marginVertical: 50, alignItems: 'center', justifyContent: 'center',
                        shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.34, shadowRadius: 6.27, elevation: 10,
                        position: "absolute", bottom: -30, left: "50%", transform: [{ translateX: -60 }],
                        backgroundColor: "white",
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: "#FF5000"
                    }} onPress={() => confirmLocation()}>
                        <Text style={{ color: "white", fontSize: 14, alignSelf: "center", marginHorizontal: 30, marginVertical: 10, fontFamily: 'Montserrat-Bold', color: "#FF5000" }}>{translate("Confirm")}</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </>
    )
}

const style = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    markerImageBorderStyle: {
        height: 52,
        width: 52,
        borderRadius: 24,
        borderWidth: 5,
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
    },
    markerFixed: {
        left: '50%',
        marginLeft: -12,
        marginTop: -28,
        position: 'absolute',
        top: '50%'
    },
    marker: {
        height: 37, width: 24
    },
})
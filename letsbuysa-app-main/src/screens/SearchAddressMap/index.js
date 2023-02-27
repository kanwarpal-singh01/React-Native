import React from 'react';
import {
    View,
    SafeAreaView,
    Alert,
    NativeModules,
    Image,    Keyboard,
    Dimensions,
    Switch,

    TouchableOpacity, I18nManager
} from 'react-native';

// Utility
import Routes from "src/router/routes";
import {
    Color,
    Constants,
    ThemeUtils,
    CommonStyle,
    validation,

    Icon,
    IS_IOS,
    Strings,
    showErrorSnackBar,
    handleReverseGeocodeAddress,
    capitalizeLetters,
    showSuccessSnackBar,

} from "src/utils";

import style from './styles';
import {
    API_ADDRESS_UPDATE,
    API_ADD_ADDRESS,
    API_VERIFY_ADDRESS,
    APIRequest,
    ApiURL
} from 'src/api';
import {connect} from 'react-redux';

// Custom component
import {
    Label,
    RoundButton,
    CustomNavigationHeader,
    FloatingInputText
} from 'src/component';

// Thired Party Component
import MapView, {PROVIDER_GOOGLE, Circle, Marker} from "react-native-maps";
import Permission from "react-native-permissions";
import Spinner from 'react-native-loading-spinner-overlay';
import RNGooglePlaces from 'react-native-google-places';
import Geocoder from 'react-native-geocoder-reborn';
import Geolocation from 'react-native-geolocation-service'
import { Modalize } from 'react-native-modalize';

// Resource
const LOCAITON_MARKER = require('src/assets/images/Marker.png');
const { height} = Dimensions.get('window');

class SearchAddressMap extends React.Component {

    // Server Request

    updateAddressRequest = () => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            console.log('state is',this.state.selectedStateObj,this.state.selectedState)
            params = {
                "customer_id": this.props.user.customer_id,
                "fulladdress": this.state.fullAddress,
                "fullname": this.state.fullName,
                "address_details": this.state.streetName,
                "telephone": `${this.state.mobileNumber}`,
                "default": this.state.defaultAddress ? 1 : 0,
                "lat":parseFloat(this.state.addressLat),
                "long":parseFloat(this.state.addressLong),
                "address_id": this.state.addressId,
            };
            new APIRequest.Builder()
                .post()
                .setReqId(API_ADDRESS_UPDATE)
                .reqURL(ApiURL.updateAddressRequest)
                .formData(params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        }
    };

    addNewAddressRequest = () => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id,
                "fulladdress": this.state.fullAddress,
                "fullname": this.state.fullName,
                "address_details": this.state.streetName,
                "telephone": `${this.state.mobileNumber}`,
                "default": this.state.defaultAddress ? 1 : 0,
                "lat":parseFloat(this.state.addressLat),
                "long":parseFloat(this.state.addressLong),
               
            };
            new APIRequest.Builder()
                .post()
                .setReqId(API_ADD_ADDRESS)
                .reqURL(ApiURL.addAddress)
                .formData(params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        }

    };
    verifyAddressRequest = (item) => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id,
                "address_id": item.id,
            };
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_VERIFY_ADDRESS)
            .reqURL(ApiURL.addressVerify)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };
    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_ADDRESS_UPDATE :
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            showSuccessSnackBar(response.data.success.message)
                        }
                        // this.props.navigation.navigate(Routes.MyAddress)
                        this.props.navigation.pop();
                        break
                }
                break;
            case API_ADD_ADDRESS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        
                        if (response.data && response.data.success) {
                            console.log('got response')
                            showSuccessSnackBar(response.data.success.message);
                        }
                        // this.props.navigation.navigate(Routes.MyAddress)
                        this.handleNavigation(response.data);
                        break;
                }
                break;

            case API_VERIFY_ADDRESS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        let params = {
                            type: Constants.VerifyCodeType.ADDRESS_MOBILE,
                            addressData: this.currentSelectedAddress,
                            isFromRoute:Routes.MyAddress
                        };
                        if (this.props.navigation.state && this.props.navigation.state.params) {
                            if (this.props.navigation.state.params.isFromCheckout) {
                                params.isFromCheckout = true;
                                params.toRoute = Routes.Checkout;
                            }

                            if (this.props.navigation.state.params.isFromRoute) {
                                params.isFromRoute = this.props.navigation.state.params.isFromRoute;
                            }
                        }
                        this.props.navigation.navigate(Routes.VerifyAddress,params);
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_ADDRESS_UPDATE :
            case API_ADD_ADDRESS:
            case API_VERIFY_ADDRESS:
                if (error && error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    // User Interaction Method
    btnSearchLocationClick = () => {
        RNGooglePlaces.openAutocompleteModal({
            country: Constants.GoogleSearchRestriction.country,
            latitude: this.state.currentLatitude,
            longitude: this.state.currentLongitude
        }, ['placeID', 'location', 'name', 'address', 'types'])
            .then((place) => {
                this.setState({
                    addressLat: place.location.latitude,
                    addressLong: place.location.longitude
                }, () => {
                    this.mapRef.animateToRegion(this.getMapRegionOnSearch(this.state.addressLat, this.state.addressLong), 250);
                });
            })
            .catch(error => console.log("ereror", error.message));
    };

    handleNavigation = (responseData) => {
        if (this.state.isFromCheckout) {
            // if (responseData.address && !responseData.address.is_telephone_approved) {
            //     this.currentSelectedAddress = responseData.address;
            //     this.verifyAddressRequest(responseData.address);
            // } else {
                let fromRoute = this.props.navigation.getParam('isFromRoute', null),
                    toRoute = this.props.navigation.getParam('toRoute', null);
                if (toRoute) {
                    this.props.navigation.navigate(toRoute, {isFromRoute: fromRoute});
                } else if (fromRoute) {
                    this.props.navigation.navigate(fromRoute);
                } else {
                    this.props.navigation.pop();
                }
           // }
        } else {
            console.log('pop')
            this.props.navigation.pop();
        }
    };

    onClickAddLocation = () => {
        console.log("Address string",this.state.searchAddressString)
        console.log("ADDRESS data",this.state.searchAddressData)
   
        this.openModel()
        //this.props.navigation.navigate(Routes.AddNewAddress,{mapAddress:this.state.searchAddressData})

    };

    openModel = ()=>{
        this.modalizeRef?.open();
    }
    closeModel = ()=>{
        this.modalizeRef?.close();
    }

    onSave = ()=>{

    }

    onClickBackBtn = () => {
        this.props.navigation.pop();
    }

    onClickClearBtn = () => {
        this.setState({
            searchAddressData: undefined,
            searchAddressString: this.props.localeStrings.dragMap
        })
    }

    // Utility Method
    checkLocationPermission = () => {
        Permission.request('location', {type: 'whenInUse'}).then(response => {
            console.log(response);
            if (response === 'authorized') {
                this.getCurrentLocation();
            } else {
                this.setState({isLoaderVisible: false}, () => {
                    setTimeout(() => {
                        Alert.alert(
                            this.props.localeStrings.locationDisabled,
                            this.props.localeStrings.locationDisabledMessage,
                            [
                                {
                                    text: this.props.localeStrings.cancel,
                                    onPress: () => {
                                        this.props.navigation.pop()
                                    }
                                },
                                {
                                    text: this.props.localeStrings.openSetting,
                                    onPress: () => {
                                        IS_IOS ? Permission.openSettings() :
                                            NativeModules.OpenSettings.openNetworkSettings(() => {
                                                console.log('settings opened');
                                            })
                                    }
                                },
                            ],
                            {
                                cancelable: false
                            }
                        );
                    }, 200);
                });
            }
        });
    };

    getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            (position) => {
                const addLat = this.state.isEdit ? this.state.addressLat : position.coords.latitude
                const addLong = this.state.isEdit ? this.state.addressLong : position.coords.longitude

                this.setState({
                    isGetCurrentLocation: true,
                    currentLatitude: position.coords.latitude,
                    currentLongitude: position.coords.longitude,
                    addressLat: addLat,
                    addressLong: addLong,
                }, () => {

                    setTimeout(() => {
                        this.ignoreRegionEvent = false;
                        if (this.mapRef) {
                            this.mapRef.animateToRegion(this.getMapRegionOnSearch(this.state.addressLat, this.state.addressLong), 250)
                        }
                    }, 500);
                });
            },
            (err) => {
                this.setState({isLoaderVisible: false});
                console.log('location error', err);
                showErrorSnackBar('location error');
            }, Constants.locationConfigWatchAndroid);
    };

    onSelectLocation = () => {
        let old = this.state.searchAddressString;
        this.setState({
            searchAddressString: this.props.localeStrings.loading
        }, () => {
            Geocoder.geocodePosition({
                lat: parseFloat(this.state.addressLat),
                lng: parseFloat(this.state.addressLong)
            }).then(res => {
                // console.log('geocoding response ::', JSON.stringify(res));
                let addressObject = handleReverseGeocodeAddress(res);
                console.log('address formatted',addressObject)

                if (addressObject) {
                    this.setState({
                        isLoaderVisible: false,
                        fullAddress:addressObject.fullAddress,
                        searchAddressString: addressObject.formatedAddress,
                        searchAddressData: addressObject.searchAddressData,
                    });
                }
                else {
                    this.setState({
                        isLoaderVisible: false,
                        searchAddressData: undefined,
                        searchAddressString: this.props.localeStrings.dragMap
                    })
                }
            }).catch(err => {
                this.setState({
                    isLoaderVisible: false,
                    searchAddressString: this.props.localeStrings.dragMap
                });
                console.log('geocoding response ::', err)
            });
        });
    };
    onClickAddAddress = () => {
        this.setState(prevState => ({
            fullName: prevState.fullName ? prevState.fullName.trim() : "",
            addressLabel: prevState.addressLabel ? prevState.addressLabel.trim() : "",
            streetName: prevState.streetName ? prevState.streetName.trim() : "",
            cityName: prevState.cityName ? prevState.cityName.trim() : "",
            mobileNumber: prevState.mobileNumber ? prevState.mobileNumber.trim() : "",

        }), () => {
            if (this.validateForm()) {
                this.addNewAddressRequest()
            }
        });
    };

    onClickUpdateAddress = () => {
        if (this.validateForm()) {
            this.updateAddressRequest()
        }
    };

    validateForm = () => {
        Keyboard.dismiss();
        let fullNameError, mobileNumberError, streetNameError,zipCodeError;
        let isValid = true;

        fullNameError = validation("name", this.state.fullName);
        mobileNumberError = validation("phoneNo", this.state.mobileNumber);
        streetNameError = validation('streetName', this.state.streetName);

        if (fullNameError !== null ||
            mobileNumberError !== null ||
            streetNameError !== null 
             ) {
            this.setState({
                fullNameError,
                mobileNumberError,
                streetNameError,
            });
            isValid = false;
        } else {
            this.setState({
                fullNameError: "",
                mobileNumberError: "",
                streetNameError: "",
            });
            isValid = true;
        }

        return isValid;
    };

    getMapRegionOnSearch = (lat, lng) => {
        if (this.mapCurrentRegion) {
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                latitudeDelta: this.mapCurrentRegion.latitudeDelta,
                longitudeDelta: this.mapCurrentRegion.longitudeDelta,
            }
        }
        else {
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
                latitudeDelta: 0.0100,
                longitudeDelta: 0.0100 * (ThemeUtils.relativeWidth(100) / ThemeUtils.relativeHeight(100)),
            }
        }
    };

    // MapView Method
    onMapRegionChanging = (region) => {
        this.setState({
            hideOnRegionChange: true
        });
    };

    onMapRegionChangeComplete = (region) => {
        console.log("Region added",region)
        this.setState({
            hideOnRegionChange: false
        }, () => {
            if (this.ignoreRegionEvent === false) {
                console.log("Map Region Changes Complete ::", region);
                this.mapCurrentRegion = region;
                this.setState({
                    addressLat: region.latitude,
                    addressLong: region.longitude
                }, () => {
                    this.onSelectLocation();
                });
            }
            else {
                this.onSelectLocation();
            }
        });
    };

    // model view 

    renderModelView=()=>{
        console.log('route is',this.props.navigation.state.routeName)
        return (
          <View style={style.modelContainer}>
              <View
                style={[
                  CommonStyle.content_center,
                  {backgroundColor: Color.WHITE},
                ]}>
                <View style={{width: ThemeUtils.relativeWidth(90)}}>
                  <View style={style.modelSubContainer}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}>
                      <Icon
                        name={'my_addresses'}
                        style={{marginVertical: 15}}
                        size={ThemeUtils.fontLarge}
                        color={Color.BLACK}
                      />
                      <Label
                        color={Color.TEXT_DARK}
                        small
                        mt={15}
                        mb={15}
                        ms={8}>
                        {this.state.fullAddress}
                      </Label>
                    </View>
                  </View>

                  <FloatingInputText
                    icon={'account_normal'}
                    autoCapitalize={'words'}
                    value={this.state.fullName}
                    label={this.props.localeStrings.fullName}
                    error={this.state.fullNameError}
                    onFocus={() => {
                      this.setState({fullNameError: ''});
                    }}
                    onBlur={() => {
                      if (this.state.fullName) {
                        this.setState(prevState => ({
                          fullName: capitalizeLetters(
                            prevState.fullName,
                          ),
                        }));
                      }
                    }}
                    onChangeText={fullName => this.setState({fullName})}
                  />
                  <View style={style.mobileContainer}>
                    <View style={style.countryCodeContainer}>
                      <FloatingInputText
                        icon={'call'}
                        label={''}
                        style={style.countryCode}
                        isConstant={true}
                        editable={false}
                        showFlag={Constants.SA_FLAG_ICON}
                        value={`+${this.state.countryCode}`}
                      />
                    </View>
                    <FloatingInputText
                      keyboardType={'numeric'}
                      returnKeyType={'done'}
                      showIcon={false}
                      style={style.mobileNumber}
                      label={this.props.localeStrings.mobileNumber}
                      helpersNumberOfLines={2}
                      error={this.state.mobileNumberError}
                      onFocus={() => {
                        this.setState({mobileNumberError: ''});
                      }}
                      value={this.state.mobileNumber}
                      onChangeText={mobileNumber =>
                        this.setState({mobileNumber})
                      }
                    />
                  </View>

                  <FloatingInputText
                    icon={'my_addresses'}
                    autoCapitalize={'none'}
                    label={this.props.localeStrings.addressdetail}
                    value={this.state.streetName}
                    error={this.state.streetNameError}
                    onFocus={() => {
                      this.setState({streetNameError: ''});
                    }}
                    onChangeText={streetName =>
                      this.setState({streetName})
                    }
                  />

                  <View style={style.switchView}>
                    <Label large color={Color.TEXT_LIGHT}>
                      {this.props.localeStrings.makeDefault}
                    </Label>
                    <Switch
                      value={this.state.defaultAddress}
                      thumbColor={
                        this.state.defaultAddress
                          ? Color.PRIMARY
                          : Color.TEXT_LIGHT
                      }
                      trackColor={{
                        false: Color.LIGHT_GRAY,
                        true: Color.LIGHT_GRAY,
                      }}
                      onValueChange={() =>
                        this.setState({
                          defaultAddress: !this.state.defaultAddress,
                        })
                      }
                    />
                  </View>
                  <TouchableOpacity
                  activeOpacity={0.5}
                  style={[
                    style.bottomContainer,
                    {backgroundColor: Color.PRIMARY},
                  ]}
                  onPress={
                    this.state.isEdit
                      ? this.onClickUpdateAddress
                      : this.onClickAddAddress
                  }>
                  <Label
                    color={Color.WHITE}
                    nunito_bold
                    bolder={IS_IOS}
                    ms={5}>
                    {this.state.isEdit
                      ? this.props.localeStrings.saveUpdate
                      : this.props.localeStrings.saveAddress}
                  </Label>
                </TouchableOpacity>
                </View>
                
              </View>
          </View>
        );
    }

    // Life Cycle Method

    componentWillReceiveProps(props) {
        /*if (props.activeScreen && props.activeScreen.active && props.activeScreen.active === Routes.BookingParking
            && props.activeScreen.active !== this.props.activeScreen.active) {
            this._ismounted = true;
            this.checkLocationPermission();
            setTimeout(() => {
                this.setState(prevState => ({showTapLabel: !prevState.showTapLabel}))
            }, Constants.locationFetchTapAgainInterval)
        }
        else if (props.activeScreen && props.activeScreen.previous && props.activeScreen.previous === Routes.BookingParking) {
            this._ismounted = false;
        }*/
    }

    componentDidMount() {
        this.checkLocationPermission();
        if(this.state.isEdit){
            this.openModel()
        }
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
      }
    
      componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }
    
      _keyboardDidShow = () => {
        this.setState({
            keyboardState: true
        });
      }
    
      _keyboardDidHide = () => {
        this.setState({
            keyboardState: false
        });
      }

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const data = navigation.getParam('selectedVehicle', undefined);
        this.modalizeRef = null;
        this.mapCurrentRegion = undefined;
        this.ignoreRegionEvent = true;

        //android location watch
        this.locationWatchListener = null;
        let address = this.props.navigation.getParam('userAddress', null),
        isFromCheckout = this.props.navigation.getParam('isFromCheckout', false);
        console.log('edit data',address,isFromCheckout)
    this.state = {
        fullName: address ? address?.fullname : "",
        streetName: address ? address.address_details : "",
        mobileNumber: address ? address?.telephone?.replace(`${Constants.CountryCode}`, '') : "",
        addressId: address ? address?.id : "",
        countryCode: Constants?.CountryCode,
        fullNameError: "",
        mobileNumberError: "",
        streetNameError:'',
        isLoaderVisible: false,
        defaultAddress: address ? address?.is_default ? true : false : false,
        isFromCheckout,
        isEdit: address !== null && address !== undefined,
        keyboardState: false,


            isGetCurrentLocation: false,
            isLoaderVisible: false,
            currentLatitude: 0,
            currentLongitude: 0,
            addressLat: address ? parseFloat(address?.lat) :0,
            addressLong: address ? parseFloat(address?.long) :0,
            searchAddressString: this.props.localeStrings.dragMap,
            searchAddressData: null,
            fullAddress:address ? address?.fulladdress : null,
            userSelectedVehicle: data,
            hideOnRegionChange: true,
            showTapLabel: false,
        };
    }

    render() {

        const initialLat = this.state.isEdit ? this.state.addressLat : this.state.currentLatitude
        const initialLong = this.state.isEdit ? this.state.addressLong : this.state.currentLongitude

        return (
            <SafeAreaView style={style.safeAreaView}>
                <View style={style.safeAreaView}>
                    <Spinner visible={this.state.isLoaderVisible}/>
                    {
                        this.state.isGetCurrentLocation ?
                            <MapView
                                ref={map => this.mapRef = map}
                                showsUserLocation={true}
                                showsMyLocationButton
                                provider={PROVIDER_GOOGLE}
                                // minZoomLevel={17}
                                onRegionChange={this.onMapRegionChanging}
                                onRegionChangeComplete={this.onMapRegionChangeComplete}
                                style={style.mapView}
                                initialRegion={this.getMapRegionOnSearch(initialLat, initialLong)}
                            /> :
                            <View style={style.errorContainer}>
                                {!this.state.isGetCurrentLocation && !this.state.showTapLabel &&
                                <Label
                                    fontRegular
                                    large
                                    color={Color.PRIMARY}
                                    align={'center'}>
                                    {this.props.localeStrings.waitingForLocation}
                                </Label>
                                }
                                {!this.state.isGetCurrentLocation && this.state.showTapLabel &&
                                <Label
                                    fontRegular
                                    large
                                    mt={20}
                                    color={Color.PRIMARY}
                                    align={'center'}
                                    onPress={this.checkLocationPermission}>
                                    {this.props.localeStrings.fetchAgain}
                                </Label>
                                }
                            </View>
                    }
                    {
                        this.state.isGetCurrentLocation &&
                        <View
                            pointerEvents="none"
                            style={style.markerContainer}>
                            <Image pointerEvents="none"
                                   style={style.marker}
                                   source={LOCAITON_MARKER}/>
                        </View>
                    }
                    {
                        <View style={style.locationView}>
                            <TouchableOpacity style={style.backBtn}
                                              activeOpacity={0.7}
                                              underlayColor={Color.TRANSPARENT}
                                              onPress={this.onClickBackBtn}>
                                <Icon
                                    name="back"
                                    style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                                    size={20}
                                />
                            </TouchableOpacity>
                            <View style={style.addressContainer}>
                                <View style={style.addressParts}>
                                    <Icon
                                        name="search"
                                        size={15}
                                        color={Color.TEXT_LIGHT}
                                    />
                                    <TouchableOpacity
                                        style={style.addressTextBtn}
                                        activeOpacity={0.9}
                                        underlayColor={Color.TRANSPARENT}
                                        onPress={this.btnSearchLocationClick}>
                                        <Label
                                            singleLine
                                            small
                                            color={this.state.searchAddressString === this.props.localeStrings.dragMap ? Color.TEXT_LIGHT :Color.TEXT_DARK}>
                                            {this.state.searchAddressString}
                                        </Label>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={style.searchBtn}
                                                      activeOpacity={0.7}
                                                      underlayColor={Color.TRANSPARENT}
                                                      onPress={this.onClickClearBtn}>
                                        <Icon
                                            name="search_cancel"
                                            size={15}
                                            color={Color.TEXT_LIGHT}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    }
                    {
                        !this.state.hideOnRegionChange &&
                        <View style={style.bottomContainer}>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(90)}
                                backgroundColor={this.state.searchAddressData ?
                                    Color.PRIMARY : Color.GRAY}
                                disabled={this.state.searchAddressData === null || this.state.searchAddressData === undefined}
                                mt={20}
                                mb={10}
                                border_radius={5}
                                btnPrimary
                                textColor={Color.WHITE}
                                click={this.onClickAddLocation}>
                                {'Select'}
                            </RoundButton>
                        </View>
                    }
                </View>
                <Modalize ref={model => this.modalizeRef = model} modalHeight={this.state.keyboardState ? height*0.9:height*0.6} modalStyle={style.modelView} >
                    {this.renderModelView()} 
                </Modalize>
            </SafeAreaView>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user,
        activeScreen: state.activeScreen,
        appConfig: state.appConfig,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps)(SearchAddressMap);

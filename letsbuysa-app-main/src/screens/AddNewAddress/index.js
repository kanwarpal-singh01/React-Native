import React, {Component} from 'react';
import {
    View,
    Keyboard,
    Switch,
    TouchableOpacity,
    PanResponder,
    I18nManager
} from 'react-native';

//Custom component
import {
    CustomNavigationHeader,
    FloatingInputText,
    Label,
    InputDropdown,
} from "src/component";

//Utility
import {
    Constants,
    ThemeUtils,
    Strings,
    Color,
    CommonStyle,
    validation,
    IS_IOS,
    IS_ANDROID,
    UtilityManager,
    Icon,
    showErrorSnackBar,
    showSuccessSnackBar,
    capitalizeLetters
} from "src/utils";
import styles from './styles';
import {
    API_GET_COUNTRY,
    API_GET_STATES,
    API_ADDRESS_UPDATE,
    API_ADD_ADDRESS,
    API_VERIFY_ADDRESS,
    APIRequest,
    ApiURL,
} from "src/api";
import Routes from "src/router/routes";

//Third party
import {NavigationEvents, SafeAreaView} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {connect} from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";

const COUNTRY_DD = 1, STATE_DD = 2;

class AddNewAddress extends Component {
    //API Request
    getCountryList = () => {
        new APIRequest.Builder()
            .get()
            .setReqId(API_GET_COUNTRY)
            .reqURL(ApiURL.getCountries)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    getStateList = () => {
        if (this.state.selectedCountryObj) {
            let params = {
                "country_id": this.state.selectedCountryObj.country_id
            };

            this.setState({isLoaderVisible: true});
            new APIRequest.Builder()
                .post()
                .setReqId(API_GET_STATES)
                .reqURL(ApiURL.states)
                .formData(params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        }
    };

    updateAddressRequest = () => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            console.log('state is',this.state.selectedStateObj,this.state.selectedState)
            params = {
                "customer_id": this.props.user.customer_id,
                "fullname": this.state.fullName,
                "street_name": this.state.streetName,
                "neighbourhood": this.state.neighbourHood,
                "postcode": this.state.zipCode,
                "country_id": this.state.selectedCountryObj.country_id,
                "state": this.state.selectedStateObj.zone_id,
                "city":this.state.neighbourHood,
                "default": this.state.defaultAddress ? 1 : 0,
                "fulladdress": this.state.addressLabel,
                "telephone": `${Constants.CountryCode}${this.state.mobileNumber}`,
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
                "fullname": this.state.fullName,
                "street_name": this.state.streetName,
                "postcode": this.state.zipCode,
                "city":this.state.neighbourHood,
                "country_id": this.state.selectedCountryObj.country_id,
                "state": this.state.selectedStateObj.zone_id,
                "default": this.state.defaultAddress? 1 : 0,
                "fulladdress": this.state.addressLabel,
                "telephone": `${Constants.CountryCode}${this.state.mobileNumber}`,
               "neighbourhood": this.state.neighbourHood,
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
                "address_id": item.address_id,
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
            case API_GET_COUNTRY:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            Array.isArray(response.data.countries) &&
                            response.data.countries.length > 0) {
                            this.setState({countryList: response.data.countries});
                        }
                        break
                }
                break;
            case API_GET_STATES :
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            Array.isArray(response.data.states) &&
                            response.data.states.length > 0) {
                            this.setState({stateList: response.data.states}, () => {
                                let stateObj = null;
                                if (this.state.isFromMap && this.state.fromMapStateName) {
                                    stateObj = this.state.stateList.find(state =>
                                        state.name.trim().toUpperCase() === (this.state.fromMapStateName.trim().toUpperCase())
                                    );
                                }
                                //just for managing preselected country and state with edit and map
                                else if (this.state.isEdit) {
                                    stateObj = this.state.selectedStateObj
                                }
                                this.setState({
                                    selectedStateObj: stateObj,
                                    selectedState: stateObj ? stateObj.name : ""
                                })
                            });

                        }
                        break
                }
                break;
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

    //User interaction
    onClickAddAddress = () => {
        this.setState(prevState => ({
            fullName: prevState.fullName ? prevState.fullName.trim() : "",
            addressLabel: prevState.addressLabel ? prevState.addressLabel.trim() : "",
            streetName: prevState.streetName ? prevState.streetName.trim() : "",
            neighbourHood: prevState.neighbourHood ? prevState.neighbourHood.trim() : "",
            cityName: prevState.cityName ? prevState.cityName.trim() : "",
            zipCode: prevState.zipCode ? prevState.zipCode.trim() : "",
            mobileNumber: prevState.mobileNumber ? prevState.mobileNumber.trim() : "",
            selectedCountry: prevState.selectedCountry ? prevState.selectedCountry.trim() : "",
            selectedState: prevState.selectedState ? prevState.selectedState.trim() : "",

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

    onClickBack = () => {
        this.props.navigation.pop();
    };

    onClickOpenMap = () => {
        this.props.navigation.navigate(Routes.SearchAddressMap);
    };

    searchCountry = searchParam => {
        let searchResults = [];
        if (searchParam) {
            searchResults = this.state.countryList.filter(x => {
                if (x.name.toUpperCase().includes(searchParam.toUpperCase())) {
                    return x;
                } else {
                    if (x.name.includes(searchParam)) {
                        return x;
                    }
                }

            });
            this.setState({
                countryTempList: searchResults,
            })
        } else {
            this.setState({countryTempList: this.state.countryList})
        }
    };

    searchState = searchParam => {
        let searchResults = [];
        if (searchParam) {
            searchResults = this.state.stateList.filter(x => {
                if (x.name.toUpperCase().includes(searchParam.toUpperCase())) {
                    return x;
                } else {
                    if (x.name.includes(searchParam)) {
                        return x;
                    }
                }

            });
            this.setState({stateTempList: searchResults})
        } else {
            this.setState({stateTempList: this.state.stateList})
        }
    };

    handleCountryChange = (selectedObject) => {
        setTimeout(() => {
            if (selectedObject) {
                this.setState({
                    showCountryDropdown: false,
                    showStateDropdown: false,
                    selectedCountry: selectedObject.name,
                    selectedCountryObj: selectedObject,
                    stateList: [],
                    selectedStateObj: null,
                    selectedState: "",
                    isFromMap: false,
                    fromMapStateName: ""
                }, () => {
                    this.getStateList();
                })
            }
        }, 0);
    };

    handleStateChange = (selectedObject) => {
        setTimeout(() => {
            if (selectedObject) {
                this.setState({
                    showCountryDropdown: false,
                    showStateDropdown: false,
                    selectedState: selectedObject.name,
                    selectedStateObj: selectedObject,
                    isFromMap: false,
                    fromMapStateName: ""
                })
            }
        }, 0);
    };

    //Utility
    validateForm = () => {
        Keyboard.dismiss();
        let fullNameError, mobileNumberError, streetNameError,
            addressLabelError,
            zipCodeError, countryError, stateError, neighbourHoodError;
        let isValid = true;


        fullNameError = validation("name", this.state.fullName);
        addressLabelError = validation("addressLabel", this.state.addressLabel);
        mobileNumberError = validation("phoneNo", this.state.mobileNumber);
        streetNameError = validation('streetName', this.state.streetName);
        neighbourHoodError = validation('neighbourHood', this.state.neighbourHood);
        zipCodeError = validation('zipCode', this.state.zipCode);
        countryError = validation('country', this.state.selectedCountry);
        stateError = validation('state', this.state.selectedState);


        if (countryError === null) {
            if (this.state.selectedCountryObj === null) {
                countryError = this.props.localeStrings.countryInvalid;
            } else {
                this.setState({
                    selectedCountry: this.state.selectedCountryObj.name
                })
            }
        }
        if (stateError === null) {
            if (this.state.selectedStateObj === null) {
                stateError = this.props.localeStrings.stateInvalid;
            } else {
                this.setState({
                    selectedState: this.state.selectedStateObj.name
                })
            }
        }

        if (fullNameError !== null ||
            mobileNumberError !== null ||
            streetNameError !== null ||
            // cityNameError !== null ||
            zipCodeError !== null ||
            countryError !== null ||
            stateError !== null ||
            addressLabelError !== null ||
            neighbourHoodError !== null) {
            this.setState({
                fullNameError,
                mobileNumberError,
                streetNameError,
                neighbourHoodError,
                zipCodeError,
                addressLabelError,
                countryError,
                stateError
            });
            isValid = false;
        } else {
            this.setState({
                fullNameError: "",
                mobileNumberError: "",
                streetNameError: "",
                neighbourHoodError: "",
                zipCodeError: "",
                countryError: "",
                addressLabelError: "",
                stateError: ""
            });
            isValid = true;
        }


        return isValid;
    };

    calculatePadding = () => {
        //padding is required for safe area in X devices
        //Not required in android devices

        let min = 0;
        if (ThemeUtils.isIphoneX()) {
            return min + UtilityManager.getInstance().getStatusBarHeight();
        } else {
            if (IS_ANDROID) {
                return min;
            } else {
                return min + 10
            }
        }
    };

    calculateViewPos = () => {
        this.countryDropdownRef &&
        setTimeout(() => {
            this.countryDropdownRef.measure((ox, oy, width, height, px, py) => {
                /*console.log("ox: " + ox);
                console.log("oy: " + oy);
                console.log("width: " + width);
                console.log("height: " + height);
                console.log("px: " + px);
                console.log("py: " + py);*/

                px && py &&
                this.setState({countryDropdownPos: {x: px, y: py}})
            })
        }, 0);

        this.stateDropdownRef &&
        setTimeout(() => {
            this.stateDropdownRef.measure((ox, oy, width, height, px, py) => {
                /*console.log("ox: " + ox);
                console.log("oy: " + oy);
                console.log("width: " + width);
                console.log("height: " + height);
                console.log("px: " + px);
                console.log("py: " + py);*/

                px && py &&
                this.setState({stateDropdownPos: {x: px, y: py}})
            })
        }, 0);
    };

    onLayoutCountryDropdown = ({nativeEvent}) => {
        let {layout: {x, y, width, height}} = nativeEvent;
        // console.log('x,y', x, y)
        this.setState({countryDropdownPos: {x, y}})
    };

    onLayoutStateDropdown = ({nativeEvent}) => {
        let {layout: {x, y, width, height}} = nativeEvent;
        // console.log('2x,y', x, y)
        this.setState({stateDropdownPos: {x, y}})
    };

    selectMapAddress = (payload) => {
        console.log(payload)
        if (payload.lastState.params) {
            const params = payload.lastState.params.mapAddress;
            let countryObj = null,
                stateObj = null;
            if (params && params.country &&
                Array.isArray(this.state.countryList) &&
                this.state.countryList.length > 0) {
                countryObj = this.state.countryList.find(country =>
                    country.name.trim().toUpperCase() === (params.country.trim().toUpperCase())
                );
                if (countryObj) {
                    this.setState({
                        showCountryDropdown: false,
                        showStateDropdown: false,
                        selectedCountry: countryObj.name,
                        selectedCountryObj: countryObj,
                        streetName: `${params.address_line_1 ? params.address_line_1 : ""} ${params.address_line_2 ? "," + params.address_line_2 : ""}`,
                        neighbourHood: params.address_line_3 ? params.address_line_3 : null,
                        zipCode: params.pin_code,
                        stateList: [],
                        selectedStateObj: null,
                        selectedState: "",
                        isFromMap: true,
                        fromMapStateName: params.state
                    }, () => {
                        this.getStateList();
                    })
                }
            }
        }
    };

    updateScrollPosition = (type) => {
        switch (type) {
            case COUNTRY_DD:
                this.scrollView &&
                this.state.countryDropdownPos &&
                this.scrollView.scrollTo({...this.state.countryDropdownPos, animated: true});
                break;
            case STATE_DD:
                this.scrollView &&
                this.state.stateDropdownPos &&
                this.scrollView.scrollTo({...this.state.stateDropdownPos, animated: true});
                break
        }
    };

    handleNavigation = (responseData) => {
        if (this.state.isFromCheckout) {
            if (responseData.address && !responseData.address.is_telephone_approved) {
                this.currentSelectedAddress = responseData.address;
                this.verifyAddressRequest(responseData.address);
            } else {
                let fromRoute = this.props.navigation.getParam('isFromRoute', null),
                    toRoute = this.props.navigation.getParam('toRoute', null);
                if (toRoute) {
                    this.props.navigation.navigate(toRoute, {isFromRoute: fromRoute});
                } else if (fromRoute) {
                    this.props.navigation.navigate(fromRoute);
                } else {
                    this.props.navigation.pop();
                }
            }
        } else {
            this.props.navigation.pop();
        }
    };

    //UI methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            title: navigation.state.routeName === Routes.AddNewAddress ? "navNewAddress" : "navEditAddress",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    //Lifecycle methods
    constructor(props) {
        super(props);
        let address = this.props.navigation.getParam('userAddress', null),
            isFromCheckout = this.props.navigation.getParam('isFromCheckout', false);
            console.log('edit data',address,isFromCheckout)
        this.state = {
            fullName: address ? address?.fullname : "",
            addressLabel: address ? address?.fulladdress : "",
            streetName: address ? address?.street_name : "",
            neighbourHood: address ? address.city : "",
            cityName: address ? address?.city : "",
            zipCode: address ? address?.postcode : "",
            mobileNumber: address ? address?.telephone?.replace(`${Constants.CountryCode}`, '') : "",
            defaultAddress: address ? address?.is_default ? true : false : false,
            addressId: address ? address?.id : "",
            countryCode: Constants?.CountryCode,
            fullNameError: "",
            mobileNumberError: "",
            streetNameError: "",
            cityNameError: "",
            zipCodeError: "",
            addressLabelError: "",
            isLoaderVisible: false,
            enableScrollViewScroll: true,
            isFromMap: false,
            isFromCheckout,
            isEdit: address !== null && address !== undefined,

            countryList: [],
            selectedCountry: address ? address.country_name : "",
            countryError: "",
            countryTempList: [],
            selectedCountryObj: address ? {
                country_id: address?.country_id,
                name: address?.country_name
            } : null,

            stateList: [],
            stateTempList: [],
            selectedState: address ? address?.state_name : "",
            stateError: "",
            selectedStateObj: address ? {
                zone_id: address?.state_id,
                country_id: address?.country_id,
                name: address?.state_name
            } : null,

            countryDropdownPos: null,
            stateDropdownPos: null
        };
        this.currentSelectedAddress = null;

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                this.setState({
                    enableScrollViewScroll: true,
                    showCountryDropdown: false,
                    showStateDropdown: false,
                });
                return false;
            }
        });
    }

    componentDidMount() {
        this.getCountryList();
        this.getStateList();
        this.calculateViewPos()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0);
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <View style={{flex: 1}}
                      {...this._panResponder.panHandlers}>
                    <Spinner visible={this.state.isLoaderVisible}/>
                    <NavigationEvents
                        onDidFocus={payload => {
                            this.selectMapAddress(payload)
                            this._ismounted = true;
                        }}
                    />
                    <KeyboardAwareScrollView
                        innerRef={ref => {
                            this.scrollView = ref
                        }}
                        bounces={false}
                        keyboardVerticalOffset={0}
                        scrollEnabled={this.state.enableScrollViewScroll}
                        enableOnAndroid={false}
                        keyboardShouldPersistTaps="always"
                        enabled
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{minHeight, backgroundColor: Color.LIGHT_WHITE}}>
                        {this.state.isEdit ? null :
                            <TouchableOpacity style={styles.searchOnMapBtn}
                                              activeOpacity={0.7}
                                              underlayColor={Color.TRANSPARENT}
                                              onPress={this.onClickOpenMap}>
                                <View style={styles.searchOnMapBtnContainer}>
                                    <Icon name={"my_addresses"}
                                          size={ThemeUtils.fontNormal}
                                          color={Color.PRIMARY}/>
                                    <Label color={Color.TEXT_DARK}
                                           small
                                           style={styles.mapBtnLabel}>
                                        {this.props.localeStrings.searchOnMap}
                                    </Label>
                                    <Icon name={"arrow"}
                                          size={ThemeUtils.fontNormal}
                                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                                          color={Color.PRIMARY}/>
                                </View>
                            </TouchableOpacity>
                        }
                        <View style={[CommonStyle.content_center, {backgroundColor: Color.WHITE}]}>
                            <View style={{width: ThemeUtils.relativeWidth(80)}}>
                                <FloatingInputText
                                    icon={"my_addresses"}
                                    autoCapitalize={'words'}
                                    label={this.props.localeStrings.addressLabel}
                                    placeholder={this.props.localeStrings.addressPlaceholder}
                                    value={this.state.addressLabel}
                                    error={this.state.addressLabelError}
                                    onFocus={() => {
                                        this.setState({addressLabelError: ""})
                                    }}
                                    onChangeText={(addressLabel) => this.setState({addressLabel})}
                                />
                                <FloatingInputText
                                    icon={"account_normal"}
                                    autoCapitalize={'words'}
                                    value={this.state.fullName}
                                    label={this.props.localeStrings.fullName}
                                    error={this.state.fullNameError}
                                    onFocus={() => {
                                        this.setState({fullNameError: ""})
                                    }}
                                    onBlur={() => {
                                        if (this.state.fullName) {
                                            this.setState(prevState => ({
                                                fullName: capitalizeLetters(prevState.fullName)
                                            }))
                                        }
                                    }}
                                    onChangeText={(fullName) => this.setState({fullName})}/>
                                <View style={styles.mobileContainer}>
                                    <View style={styles.countryCodeContainer}>
                                        <FloatingInputText
                                            icon={"call"}
                                            label={""}
                                            style={styles.countryCode}
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
                                        style={styles.mobileNumber}
                                        label={this.props.localeStrings.mobileNumber}
                                        helpersNumberOfLines={2}
                                        error={this.state.mobileNumberError}
                                        onFocus={() => {
                                            this.setState({mobileNumberError: ""})
                                        }}
                                        value={this.state.mobileNumber}
                                        onChangeText={(mobileNumber) => this.setState({mobileNumber})}/>
                                </View>
                                <InputDropdown
                                    items={this.state.countryTempList}
                                    getComponentRef={ref => this.countryDropdownRef = ref}
                                    hideResults={!this.state.showCountryDropdown}
                                    containerStyle={IS_IOS ? {zIndex: 99} : null}
                                    onStartShouldSetResponderCapture={() => {
                                        this.setState({enableScrollViewScroll: false});
                                        if (this.scrollView.contentOffset === 0
                                            && this.state.enableScrollViewScroll === false) {
                                            this.setState({enableScrollViewScroll: true});
                                        }
                                        return true;
                                    }}
                                    renderTextInput={
                                        <View>
                                            <FloatingInputText
                                                icon={"city_state_country"}
                                                autoCapitalize={'none'}
                                                label={this.props.localeStrings.country}
                                                value={this.state.selectedCountry}
                                                error={this.state.countryError}
                                                onChangeText={(country) => {
                                                    // this.updateScrollPosition(COUNTRY_DD)
                                                    this.searchCountry(country);
                                                    this.setState({
                                                        showCountryDropdown: true,
                                                        showStateDropdown: false,
                                                        selectedCountry: country,
                                                    });
                                                }}
                                                onFocus={() => {
                                                    this.setState({
                                                        countryError: ""
                                                    });
                                                    // this.updateScrollPosition(COUNTRY_DD)
                                                }}/>
                                            <Icon name={"arrow"}
                                                  color={Color.DARK_LIGHT_BLACK}
                                                  style={[
                                                      styles.dropdownIcon,
                                                      I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null
                                                  ]}
                                                  size={15}/>
                                        </View>
                                    }
                                    renderItem={(selectedCountryItem) => {
                                        return (
                                            <TouchableOpacity
                                                underlayColor={Color.WHITE}
                                                style={{
                                                    padding: 10,
                                                }}
                                                onPress={() => {
                                                    this.handleCountryChange(selectedCountryItem);
                                                }}>
                                                <Label small color={Color.BLACK}>{selectedCountryItem.name}</Label>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <InputDropdown
                                    items={this.state.stateTempList}
                                    getComponentRef={ref => this.stateDropdownRef = ref}
                                    hideResults={!this.state.showStateDropdown}
                                    containerStyle={IS_IOS ? this.state.showCountryDropdown ? {zIndex: 0} : {zIndex: 99} : null}
                                    onStartShouldSetResponderCapture={() => {
                                        this.setState({enableScrollViewScroll: false});
                                        if (this.scrollView.contentOffset === 0
                                            && this.state.enableScrollViewScroll === false) {
                                            this.setState({enableScrollViewScroll: true});
                                        }
                                        return true;
                                    }}
                                    renderTextInput={
                                        <View>
                                            <FloatingInputText
                                                icon={"city_state_country"}
                                                autoCapitalize={'none'}
                                                label={this.props.localeStrings.state}
                                                value={this.state.selectedState}
                                                error={this.state.stateError}
                                                onChangeText={(state) => {
                                                    // this.updateScrollPosition(STATE_DD)
                                                    this.searchState(state);
                                                    this.setState({
                                                        showCountryDropdown: false,
                                                        showStateDropdown: true,
                                                        selectedState: state,
                                                    });
                                                }}
                                                onFocus={() => {
                                                    this.setState({
                                                        stateError: ""
                                                    });
                                                    // this.updateScrollPosition(STATE_DD)
                                                }}/>
                                            <Icon name={"arrow"}
                                                  color={Color.DARK_LIGHT_BLACK}
                                                  style={[
                                                      styles.dropdownIcon,
                                                      I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null
                                                  ]}
                                                  size={15}/>
                                        </View>
                                    }
                                    renderItem={(selectedStateItem) => {
                                        return (
                                            <TouchableOpacity
                                                underlayColor={Color.WHITE}
                                                style={{
                                                    padding: 10,
                                                }}
                                                onPress={() => {
                                                    this.handleStateChange(selectedStateItem);
                                                }}>
                                                <Label small color={Color.BLACK}>{selectedStateItem.name}</Label>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                                <FloatingInputText
                                    icon={"my_addresses"}
                                    autoCapitalize={'none'}
                                    label={this.props.localeStrings.neighbourHood}
                                    value={this.state.neighbourHood}
                                    error={this.state.neighbourHoodError}
                                    onFocus={() => {
                                        this.setState({neighbourHoodError: ""})
                                    }}
                                    onChangeText={(neighbourHood) => this.setState({neighbourHood})}/>
                                <FloatingInputText
                                    icon={"my_addresses"}
                                    autoCapitalize={'none'}
                                    label={this.props.localeStrings.streetName}
                                    value={this.state.streetName}
                                    error={this.state.streetNameError}
                                    onFocus={() => {
                                        this.setState({streetNameError: ""})
                                    }}
                                    onChangeText={(streetName) => this.setState({streetName})}/>
                                <FloatingInputText
                                    icon={"about_app"}
                                    autoCapitalize={'none'}
                                    label={this.props.localeStrings.zipCode}
                                    keyboardType={'numeric'}
                                    value={this.state.zipCode}
                                    error={this.state.zipCodeError}
                                    onFocus={() => {
                                        this.setState({zipCodeError: ""})
                                    }}
                                    onChangeText={(zipCode) => this.setState({zipCode})}
                                />
                                <View style={styles.switchView}>
                                    <Label large color={Color.TEXT_LIGHT}>{this.props.localeStrings.makeDefault}</Label>
                                    <Switch
                                        value={this.state.defaultAddress}
                                        thumbColor={this.state.defaultAddress ? Color.PRIMARY : Color.TEXT_LIGHT}
                                        trackColor={{false: Color.LIGHT_GRAY, true: Color.LIGHT_GRAY}}
                                        onValueChange={() => this.setState({defaultAddress: !this.state.defaultAddress})}/>

                                </View>
                            </View>
                        </View>
                        <View style={styles.bottomContainer}>
                            <TouchableOpacity
                                activeOpacity={0.5}
                                style={[CommonStyle.bottomContainer, {backgroundColor: Color.PRIMARY,}]}
                                onPress={this.props.navigation.state.routeName === Routes.EditAddress ? this.onClickUpdateAddress : this.onClickAddAddress}>
                                <Label color={Color.WHITE}
                                       nunito_bold
                                       bolder={IS_IOS}
                                       ms={5}>
                                    {this.props.navigation.state.routeName === Routes.EditAddress ? this.props.localeStrings.saveUpdate : this.props.localeStrings.saveAddress}
                                </Label>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </View>
            </SafeAreaView>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(AddNewAddress)

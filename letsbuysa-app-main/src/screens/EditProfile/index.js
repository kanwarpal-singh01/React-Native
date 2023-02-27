import React, {Component} from 'react';
import {
    View,
    Keyboard,
    TouchableOpacity,
    Image,
    Alert, I18nManager
} from 'react-native';

//Custom component
import {
    FloatingInputText,
    Label,
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
import {APIRequest, API_UPDATE_PROFILE, ApiURL} from "src/api";
import Routes from "src/router/routes";
import styles from './styles';
import Action from "src/redux/action";

//Third party
import {SafeAreaView} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import DeviceInfo from 'react-native-device-info';
import Spinner from "react-native-loading-spinner-overlay";
import {connect} from "react-redux";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';

class EditProfile extends Component {

    //Server request
    updateProfileRequest = () => {
        let params = {
            'customer_id': this.props.user.customer_id,
            'fullname': this.state.fullName,
            'telephone': `${Constants.CountryCode}${this.state.mobileNumber}`,
        };
        this.setState({isLoaderVisible: true}, () => {
            new APIRequest.Builder()
                .post()
                .setReqId(API_UPDATE_PROFILE)
                .reqURL(ApiURL.updateProfile)
                .formData(params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        });
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_UPDATE_PROFILE:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            response.data.user) {
                            this.props.setUser(response.data.user);
                            if (response.data.success) {
                                showSuccessSnackBar(response.data.success.message)
                            }
                            if (response.data.user.telephone_status === "not_verified") {
                                this.props.navigation.navigate(Routes.VerifyCode, {
                                    type: Constants.VerifyCodeType.MOBILE_NUMBER_WITH_SEND_OTP_PROFILE
                                })
                            } else {
                                this.props.navigation.pop();
                            }
                        }

                        break;
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_UPDATE_PROFILE:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    //User interaction
    onClickSave = () => {
        this.setState(prevState => ({
            fullName: prevState.fullName ? prevState.fullName.trim() : "",
            mobileNumber: prevState.mobileNumber ? prevState.mobileNumber.trim() : ""
        }), () => {
            if (this.validateForm()) {
                this.updateProfileRequest()
            }
        });
    };

    onClickBack = () => {
        this.props.navigation.pop();
    };

    //Utility
    validateForm = () => {
        Keyboard.dismiss();

        let fullNameError, mobileNoError;
        let isValide = true;

        fullNameError = validation("name", this.state.fullName);
        mobileNoError = validation("phoneNo", this.state.mobileNumber);

        if (fullNameError !== null ||
            mobileNoError !== null) {
            this.setState({
                fullNameError: fullNameError,
                mobileNumberError: mobileNoError,
            });

            isValide = false;
        } else {
            this.setState({
                fullNameError: "",
                mobileNumberError: "",
            });
            isValide = true;
        }
        return isValide;
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

    //UI methods
    showRegisterSuccessAlert = (onPress) => {
        setTimeout(() => {
            Alert.alert(
                "",
                this.props.localeStrings.thankYouRegister,
                [
                    {text: this.props.localeStrings.ok, onPress}
                ],
                {
                    cancelable: false
                }
            )
        }, 200);
    };

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            fullName: this.props.user ? this.props.user.full_name : "",
            fullNameError: "",
            mobileNumber: this.props.user ? this.props.user.telephone.replace(`${Constants.CountryCode}`, '') : "",
            mobileNumberError: "",
            email: this.props.user ? this.props.user.email : "",
            countryCode: Constants.CountryCode,
            isLoaderVisible: false
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const topPadding = this.calculatePadding();
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0);
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={CommonStyle.topAnimContainer}>
                    <TouchableOpacity
                        style={[CommonStyle.backBtn, {top: topPadding}]}
                        onPress={this.onClickBack}>
                        <Icon name={"back"}
                              style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                              color={Color.LIGHT_WHITE}
                              size={20}
                              me={10}
                              ms={10}/>
                    </TouchableOpacity>
                    <View style={[CommonStyle.headerLogoContainer, {marginTop: 15 + this.calculatePadding()}]}>
                        <Image source={HEADER_LOGO}
                               resizeMode={'contain'}
                               style={CommonStyle.headerLogo}/>
                    </View>
                    <Label color={Color.WHITE}
                           large
                           mt={25}
                           mb={5}>{this.props.localeStrings.editProfile}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.updateDetails}</Label>

                </View>
                <KeyboardAwareScrollView
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={true}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{minHeight}}>
                    <View style={CommonStyle.content_center}>
                        <View style={{width: ThemeUtils.relativeWidth(80)}}>
                            <FloatingInputText
                                icon={"account_fill"}
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
                            <FloatingInputText
                                icon={"mail"}
                                autoCapitalize={'none'}
                                label={this.props.localeStrings.email}
                                value={this.state.email}
                                keyboardType={'email-address'}
                                editable={false}/>
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
                        </View>
                    </View>
                    <View style={CommonStyle.contentVerticalBottom}>
                        <TouchableOpacity style={[CommonStyle.bottomContainer, {backgroundColor: Color.PRIMARY,}]}
                                          activeOpacity={0.8}
                                          underlayColor={Color.TRANSPARENT}
                                          onPress={this.onClickSave}>
                            <Label color={Color.WHITE}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   ms={5}>
                                {this.props.localeStrings.saveUpdate}
                            </Label>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUser: (user) => dispatch(Action.setUser(user)),
        setToken: (token) => dispatch(Action.setToken(token))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(EditProfile)

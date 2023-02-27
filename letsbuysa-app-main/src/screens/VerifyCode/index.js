import React from 'react';
import {
    Alert,
    BackHandler,
    Image,
    Keyboard,
    TouchableOpacity,
    View,
    I18nManager
} from 'react-native';

// Custom Component
import {
    Label,
    FloatingInputText,
    RoundButton,
} from 'src/component';

// Thired Party Library
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {connect} from "react-redux";
import {NavigationActions, StackActions} from "react-navigation";
import DeviceInfo from "react-native-device-info";
import Spinner from "react-native-loading-spinner-overlay";
import {SafeAreaView} from "react-navigation";

// Utility
import Routes from "src/router/routes";
import {
    Color,
    Constants,
    Strings,
    IS_IOS,
    IS_ANDROID,
    UtilityManager,
    CommonStyle,
    ThemeUtils,
    validation,
    showErrorSnackBar,
    showSuccessSnackBar
} from "src/utils";
import styles from './styles'
import {store} from 'src/redux/store';
import {
    API_VERIFY_CODE,
    API_VERIFY_ADDRESS_CODE,
    API_RESEND_OTP,
    API_LOGOUT,
    APIRequest,
    ApiURL
} from 'src/api'
import Action from 'src/redux/action';

// Resource
import HEADER_LOGO from 'src/assets/images/header_logo.png';


class VerifyCode extends React.Component {

    // Life Cycle Method
    static navigationOptions = {
        header: null,
        gesturesEnabled: false
    };

    // Server Request
    logoutUserRequest = () => {
        let params = {
            "customer_id": Number(this.props.user.customer_id),
            "device_id": DeviceInfo.getUniqueID()
        };
        this.setState({
            isLoaderVisible: true,
        }, () => {
            new APIRequest.Builder()
                .post()
                .formData(params)
                .setReqId(API_LOGOUT)
                .reqURL(ApiURL.logout)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        });

    };

    resendMobileOTPRequest = () => {
        let param = {
            "customer_id": Number(this.props.user.customer_id)
        };

        this.setState({
            isLoaderVisible: true,
        });

        new APIRequest.Builder()
            .post()
            .setReqId(API_RESEND_OTP)
            .reqURL(ApiURL.resendOTP)
            .formData(param)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    verifyMobileOTPRequest = () => {
        let param = {
            "customer_id": Number(this.props.user.customer_id),
            "code": Number(this.state.code),
        };


        this.setState({
            isLoaderVisible: true,
        });

        new APIRequest.Builder()
            .post()
            .setReqId(API_VERIFY_CODE)
            .reqURL(ApiURL.verifyCode)
            .formData(param)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    verifyAddressOTPRequest = () => {
        let param = {
            "address_id": this.state.addressData.address_id,
            "customer_id": Number(this.props.user.customer_id),
            "code": Number(this.state.code),
        };


        this.setState({
            isLoaderVisible: true,
        });

        new APIRequest.Builder()
            .post()
            .setReqId(API_VERIFY_ADDRESS_CODE)
            .reqURL(ApiURL.verifyAddressCode)
            .formData(param)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false
        }, () => {
            switch (reqId) {
                case API_VERIFY_CODE:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            if (response.data.success && response.data.user) {
                                this.props.setUser(response.data.user);
                                showSuccessSnackBar(response.data.success.message)
                            }
                            if (this.state.type === Constants.VerifyCodeType.MOBILE_NUMBER_WITH_SEND_OTP_PROFILE) {
                                this.props.navigation.navigate(Routes.MainTabs);
                            } else {
                                this.props.navigation.dispatch(this.resetToMain);
                            }
                            break;
                    }
                    break;
                case API_RESEND_OTP:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            if (response.data && response.data.success && response.data.success.message) {
                                showSuccessSnackBar(response.data.success.message);
                                this.stopTimer();
                                this.startTimer(Constants.RESEND_CODE_TIMER);
                            }
                            break;
                    }
                    break;
                case API_LOGOUT:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            store.dispatch(Action.logout());
                            this.props.navigation.dispatch(this.resetToMain);
                            // DeviceEventEmitter.emit(notificationKey.LOGOUT, {});
                            break;
                        default:
                            break
                    }
                    break;
                case API_VERIFY_ADDRESS_CODE:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            if (response.data && response.data.success) {
                                showSuccessSnackBar(response.data.success.message)
                            }
                            let fromRoute = this.props.navigation.getParam('isFromRoute', null),
                                toRoute = this.props.navigation.getParam('toRoute', null);
                            if (toRoute) {
                                this.props.navigation.navigate(toRoute, {isFromRoute: fromRoute});
                            } else if (fromRoute) {
                                this.props.navigation.navigate(fromRoute);
                            } else {
                                this.props.navigation.pop();
                            }
                            break;
                    }
                    break;
                default:
                    break;
            }
        });
    };

    onError = (error, reqId) => {
        this.setState({
            isLoaderVisible: false
        });

        switch (reqId) {
            case API_LOGOUT:
                store.dispatch(Action.logout());
                this.props.navigation.dispatch(this.resetToMain);

                break;
            case API_RESEND_OTP:
                switch (error.status) {
                    case Constants.ResponseCode.UNPROCESSABLE_REQUEST:
                        if (error.meta && error.meta.code) {
                            switch (error.meta.code) {
                                case 'no_attempts_left':
                                    setTimeout(() => {
                                        Alert.alert(
                                            null,
                                            this.props.localeStrings.noAttemptsError,
                                            [
                                                {
                                                    text: this.props.localeStrings.ok, onPress: () => {
                                                    }
                                                }
                                            ]
                                        );
                                    }, 250);
                                    break;
                                case 'retry_after_thirty':
                                    setTimeout(() => {
                                        Alert.alert(
                                            null,
                                            this.props.localeStrings.retryAfterThirty,
                                            [
                                                {
                                                    text: this.props.localeStrings.ok, onPress: () => {
                                                        this.stopTimer();
                                                        this.startTimer(Constants.RESEND_CODE_TIMER);
                                                    }
                                                }
                                            ]
                                        );
                                    }, 250);
                                    break;
                            }
                        }
                        /*this.stopTimer();
                        this.startTimer(30);*/
                        break;
                }
                break;
            default:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message);
                }
                break;
        }
    };

    // Validation
    validateForm = () => {
        switch (this.state.type) {
            case Constants.VerifyCodeType.MOBILE_NUMBER:
            case Constants.VerifyCodeType.MOBILE_NUMBER_WITH_SEND_OTP_PROFILE:
            case Constants.VerifyCodeType.MOBILE_NUMBER_WITH_SEND_OTP:
            case Constants.VerifyCodeType.ADDRESS_MOBILE:
                let codeError;
                codeError = validation("otp", this.state.code);

                if (codeError !== null) {
                    this.setState({
                        codeError: codeError
                    });
                    return false
                } else {
                    return true
                }
            /*case Constants.VerifyCodeType.FORGOT_PASSWORD:
                if (this.state.code === "") {
                    this.setState({
                        codeError: this.props.localeStrings.emptyCode
                    });
                    return false
                }
                break;*/
        }
        return true;
    };

    // Utility Method
    resetToMain = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({routeName: Routes.MainRoute})
        ],
        key: null
    });

    startTimer = (count) => {
        this.count = count;
        this._interval = setInterval(() => {
            this.setState({timerCount: this.count--}, () => {
                if (this.state.timerCount <= 0) {
                    this.stopTimer();
                }
            })
        }, 1000); //Interval callback called on every 1 second
    };

    stopTimer = () => {
        this.setState({
            timerCount: 0,
        });
        this._interval && clearInterval(this._interval);
    };

    clearOTPField = () => {
        this.refs['codeInputRef1'] && this.refs['codeInputRef1'].clear();
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

    handleHardwareBack = () => {
        return true;
    };

    // User Interaction Method
    btnVerifyCodeClick = () => {
        Keyboard.dismiss();
        if (this.validateForm()) {
            switch (this.state.type) {
                case Constants.VerifyCodeType.ADDRESS_MOBILE:
                    this.verifyAddressOTPRequest();
                    break;
                default:
                    this.verifyMobileOTPRequest();
                    break;
            }
        }
    };

    btnCancelClick = () => {
        Keyboard.dismiss();
        switch (this.state.type) {
            case Constants.VerifyCodeType.ADDRESS_MOBILE:
                this.props.navigation.pop();
                break;
            default:
                Alert.alert(
                    this.props.localeStrings.warning,
                    this.props.localeStrings.cancelVerifyMessage,
                    [{
                        text: this.props.localeStrings.continue,
                        onPress: () => this.logoutUserRequest()
                    }, {
                        text: this.props.localeStrings.cancel,
                    }]
                );

                break;
        }
    };

    btnBackClick = () => {
        Keyboard.dismiss();
        this.props.navigation.pop();
    };

    onFullFillCode = (code) => {
        this.setState({
            code: code
        }, () => {
            this.verifyMobileOTPRequest();
        })
    };

    sendCodeAgainEvent = () => {
        Keyboard.dismiss();
        if (this.state.timerCount === 0) {
            this.resendMobileOTPRequest()
        }
    };

    onClickChangeNumber = () => {
        Keyboard.dismiss();
        this.props.navigation.navigate(Routes.ChangePhoneNumber)
    };

    // UI Methods
    showMobileVerifyCodeUI = () => {
        return (
            <View style={CommonStyle.content_center}>
                <View style={{width: ThemeUtils.relativeWidth(80)}}>
                    {this.props.user &&
                    <Label
                        style={styles.guideLabel}
                        mt={10}
                        color={Color.TEXT_SECONDARY}>
                        {`${this.props.localeStrings.mobileNumberNote}`}
                        <Label color={Color.TEXT_SECONDARY}>{I18nManager.isRTL ?
                            ` ${this.props.user.telephone}+ `:
                            ` +${this.props.user.telephone}`}
                        </Label>
                    </Label>
                    }
                    <View style={{marginVertical: 10}}>
                        <FloatingInputText
                            icon={'password'}
                            keyboardType={'numeric'}
                            label={this.props.localeStrings.codeLabel}
                            error={this.state.codeError}
                            onFocus={() => {
                                this.setState({codeError: ""})
                            }}
                            value={this.state.code}
                            onChangeText={(code) => this.setState({code})}/>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            mt={20}
                            mb={20}
                            border_radius={5}
                            textColor={Color.WHITE}
                            click={this.btnVerifyCodeClick}>
                            {this.props.localeStrings.verify}
                        </RoundButton>
                        {this.state.type !== Constants.VerifyCodeType.MOBILE_NUMBER_WITH_SEND_OTP_PROFILE &&
                        <Label
                            mt={30}
                            style={styles.changeNumberLabel}
                            color={Color.BLACK}
                            onPress={this.onClickChangeNumber}>
                            {this.props.localeStrings.changePhoneNumber}
                        </Label>
                        }
                    </View>
                </View>
            </View>
        )
    };

    showAddressVerifyCodeUI = () => {
        return (
            <View style={CommonStyle.content_center}>
                <View style={{width: ThemeUtils.relativeWidth(80)}}>
                    {this.state.addressData && this.state.addressData.telephone &&
                    <Label
                        style={styles.guideLabel}
                        mt={10}
                        color={Color.TEXT_SECONDARY}>
                        {this.props.localeStrings.mobileNumberNote}
                        <Label color={Color.TEXT_SECONDARY}>{I18nManager.isRTL ?
                            ` ${this.state.addressData.telephone}+ `:
                            ` +${this.state.addressData.telephone}`}

                        </Label>
                    </Label>
                    }
                    <View style={{marginVertical: 10}}>
                        <FloatingInputText
                            icon={'password'}
                            keyboardType={'numeric'}
                            label={this.props.localeStrings.codeLabel}
                            error={this.state.codeError}
                            onFocus={() => {
                                this.setState({codeError: ""})
                            }}
                            value={this.state.code}
                            onChangeText={(code) => this.setState({code})}/>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            mt={20}
                            mb={20}
                            border_radius={5}
                            textColor={Color.WHITE}
                            click={this.btnVerifyCodeClick}>
                            {this.props.localeStrings.verify}
                        </RoundButton>
                    </View>
                </View>
            </View>
        )
    };

    showResendAlert = () => {
        setTimeout(() => {
            Alert.alert(
                this.props.localeStrings.resendOTP,
                `${this.props.localeStrings.youHave} ${this.state.resendAttempts} ${this.props.localeStrings.attemptsLeft}`,
                [
                    {
                        text: this.props.localeStrings.ok, onPress: () => {
                        }
                    }
                ]
            );
        }, 250);

    };

    removeListner = () => {
        BackHandler.removeEventListener("VerifyCodeBack", this.handleHardwareBack);
    };

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        const type = navigation.getParam('type', 'NO-ID'),
            addressData = navigation.getParam('addressData', null);
        this.state = {
            type,
            addressData,
            code: "",
            userEmail: navigation.getParam('email', null),
            codeError: null,
            isLoaderVisible: false,
            timerCount: Constants.RESEND_CODE_TIMER,
            resendAttempts: 0,
            remaingTime: 0,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.type === Constants.VerifyCodeType.MOBILE_NUMBER &&
            this.props.user &&
            prevProps.user &&
            this.props.user.telephone !== prevProps.user.telephone) {
            this.stopTimer();
            this.props.setTimerValue(Math.round(new Date().getTime() / 1000));
            this.startTimer(Constants.RESEND_CODE_TIMER)
        }

    }

    componentWillMount() {
        BackHandler.addEventListener("VerifyCodeBack", this.handleHardwareBack);
        if (this.state.type === Constants.VerifyCodeType.MOBILE_NUMBER) {
            // this.resendMobileOTPRequest();
            this.props.setTimerValue(Math.round(new Date().getTime() / 1000));
            this.startTimer(Constants.RESEND_CODE_TIMER);
            return;
        }
        this.stopTimer();
        let time = this.props.timerValue;
        if (time > 0) {
            let remaingTimeinSec = (Math.round(new Date().getTime() / 1000)) - time;
            if (remaingTimeinSec > Constants.RESEND_CODE_TIMER) {
                this.props.setTimerValue(0);
                this.stopTimer();
            } else {
                this.startTimer(Constants.RESEND_CODE_TIMER - remaingTimeinSec);
            }
        } else {
            this.startTimer(Constants.RESEND_CODE_TIMER);
        }
        console.log(this.props.user)

    }

    componentWillUnmount() {
        this.removeListner();
        this.stopTimer();
    }

    render() {
        const topPadding = this.calculatePadding();
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0);
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={CommonStyle.topAnimContainer}>
                    <TouchableOpacity
                        style={[CommonStyle.skipBtn, {top: topPadding}]}
                        onPress={this.btnCancelClick}>
                        <Label color={Color.DARK_LIGHT_WHITE}>{this.props.localeStrings.cancel}</Label>
                    </TouchableOpacity>
                    <View style={[CommonStyle.headerLogoContainer, {marginTop: 15 + this.calculatePadding()}]}>
                        <Image source={HEADER_LOGO}
                               resizeMode={'contain'}
                               style={CommonStyle.headerLogo}/>
                    </View>
                    <Label color={Color.WHITE}
                           large
                           mt={25}
                           mb={5}>{this.props.localeStrings.verifyCode}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.codeNote}</Label>
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
                    {this.state.type !== Constants.VerifyCodeType.ADDRESS_MOBILE ?
                        this.showMobileVerifyCodeUI() :
                        this.showAddressVerifyCodeUI()
                    }
                    {this.state.type !== Constants.VerifyCodeType.ADDRESS_MOBILE &&
                    <View style={CommonStyle.contentVerticalBottom}>
                        <View style={CommonStyle.bottomContainer}>
                            <Label
                                color={this.state.timerCount === 0 ? Color.TEXT_DARK : Color.TEXT_LIGHT}
                                nunito_bold
                                bolder={IS_IOS}
                                onPress={this.sendCodeAgainEvent}>
                                {this.state.timerCount !== 0 ? `00:${this.state.timerCount < 10 ? '0' : ''}${this.state.timerCount}s` : `${this.props.localeStrings.sendCodeAgain}`}
                            </Label>
                        </View>
                    </View>
                    }
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUser: (user) => dispatch(Action.setUser(user)),
        setToken: (token) => dispatch(Action.setToken(token)),
        setTimerValue: (timerValue) => dispatch(Action.setTimerValue(timerValue)),
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        activeScreen: state.activeScreen,
        timerValue: state.timerValue,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(VerifyCode);

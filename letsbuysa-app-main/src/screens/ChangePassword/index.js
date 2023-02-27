import React, {Component} from 'react';
import {
    View,
    Keyboard,
    TouchableOpacity,
    Image,
    Alert,
    I18nManager,
    ActivityIndicator,
    Linking
} from 'react-native';

//Custom component
import {
    FloatingInputText,
    Label, PasswordInputText,
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
    extractForgotCode
} from "src/utils";
import {
    APIRequest,
    API_VERIFY_FORGOT_CODE,
    API_CHANGE_FORGOT_PSWD,
    ApiURL,
    API_CHANGE_PSWD
} from "src/api";
import Routes from "src/router/routes";
import styles from './styles';
import Action from "src/redux/action";

//Third party
import {NavigationActions, SafeAreaView, StackActions} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";
import {connect} from "react-redux";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';

class ChangePassword extends Component {

    //Server request
    changeForgotPswdRequest = () => {
        console.log("Change forgot update  Method call")
        let {params} = this.props.navigation.state;
        let forgotCode = extractForgotCode(params.forgotLink);
        if (forgotCode) {
            let params = {
                'key': Constants.API_KEY,
                'code': forgotCode,
                'password': this.state.newPassword,
                'confirm_password': this.state.confirmPassword
            };
            this.setState({isLoaderVisible: true}, () => {
                new APIRequest.Builder()
                    .post()
                    .setReqId(API_CHANGE_FORGOT_PSWD)
                    .reqURL(ApiURL.changeForgotPassword)
                    .formData(params)
                    .response(this.onResponse)
                    .error(this.onError)
                    .build()
                    .doRequest()
            });
        }
    };

    changePasswordRequest = () => {
        console.log("Change Password Method call")
        let params = null
        if (this.props.user) {
            params = {
                'customer_id': this.props.user.customer_id,
                'old_password': this.state.oldPassword,
                'password': this.state.newPassword,
                'confirm_password': this.state.confirmPassword
            };
            this.setState({isLoaderVisible: true}, () => {
                new APIRequest.Builder()
                    .post()
                    .setReqId(API_CHANGE_PSWD)
                    .reqURL(ApiURL.changePassword)
                    .formData(params)
                    .response(this.onResponse)
                    .error(this.onError)
                    .build()
                    .doRequest()
            });
        }

    }

    verifyForgotCode = (data) => {
        let forgotCode = extractForgotCode(data.forgotLink);
        if (forgotCode) {
            let params = {
                'key': Constants.API_KEY,
                'code': forgotCode,
            };

            this.setState({showCodeVerifying: true}, () => {
                new APIRequest.Builder()
                    .post()
                    .setReqId(API_VERIFY_FORGOT_CODE)
                    .reqURL(ApiURL.verifyForgotCode)
                    .formData(params)
                    .response(this.onResponse)
                    .error(this.onError)
                    .build()
                    .doRequest()
            });
        } else {
            this.setState({codeMessage: this.props.localeStrings.errorMessage});
            showErrorSnackBar(this.props.localeStrings.couldNotAuthenticate)
        }
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false,
            showCodeVerifying: false
        });
        console.log('response', response);
        switch (reqId) {
            case API_VERIFY_FORGOT_CODE:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            this.setState({isCodeVerified: true})
                        }
                        break;
                }
                break;
            case API_CHANGE_FORGOT_PSWD:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            setTimeout(this.handleNavigationReset, 250);
                        }
                        break;
                }
                break;
            case API_CHANGE_PSWD:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            setTimeout(this.handleNavigationReset, 250);
                        }
                        break;
                }
        }
    };

    onError = (error, reqId) => {
        this.setState({
            isLoaderVisible: false,
            showCodeVerifying: false
        });
        console.log('error', error);
        switch (reqId) {
            case API_CHANGE_FORGOT_PSWD:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
            case API_VERIFY_FORGOT_CODE:
                let message = this.props.localeStrings.errorMessage;
                if (error.meta && error.meta.message) {
                    message = error.meta.message
                }
                this.setState({codeMessage: message});
                // showErrorSnackBar("Could not authenticate reset link");
                break;
            case API_CHANGE_PSWD:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    //User interaction
    onUpdatePassword = () => {
        if (this.validateForm()) {

            if (this.props.navigation.state.routeName === Routes.ChangePswd) {
                this.changePasswordRequest()
            } else {
                this.changeForgotPswdRequest()
            }
        }
    };

    onClickBack = () => {
        let {routeName, params} = this.props.navigation.state;

        if (routeName === Routes.ChangePswdDeepLink) {
            let message = this.props.localeStrings.requestLinkMessage;
            Alert.alert(
                this.props.localeStrings.areUSure,
                message,
                [{
                    text: this.props.localeStrings.ok, onPress: () => {
                        if (params && params.appState === 'background') {
                            this.props.navigation.pop();
                        } else {
                            this.props.navigation.dispatch(
                                StackActions.reset({
                                    index: 0,
                                    key: undefined,
                                    actions: [
                                        NavigationActions.navigate({routeName: Routes.MainRoute}),
                                    ]
                                }))
                        }

                    }
                }, {
                    text: this.props.localeStrings.cancel, onPress: () => {
                        console.log('dismiss')
                    },
                    style: 'cancel',
                }
                ]);
        } else if (routeName === Routes.ChangePswd) {
            this.props.navigation.pop();
        }
    };

    //Utility
    validateForm = () => {
        Keyboard.dismiss();

        let oldPasswordError, newPasswordError, confirmPasswordError;
        let isValide = true;

        newPasswordError = validation("password", this.state.newPassword);
        confirmPasswordError = validation("password", this.state.confirmPassword);

        if (this.props.navigation.state.routeName === Routes.ChangePswd) {
            oldPasswordError = validation("password", this.state.oldPassword);
        } else {
            oldPasswordError = null
        }
        if (oldPasswordError !== null ||
            newPasswordError !== null ||
            confirmPasswordError !== null) {
            this.setState({
                oldPasswordError,
                newPasswordError,
                confirmPasswordError,
            });
            isValide = false;
        } else {
            this.setState({
                oldPasswordError: "",
                newPasswordError: "",
                confirmPasswordError: "",
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

    handleNavigationReset = () => {
        if (this.props.navigation.state.routeName === Routes.ChangePswd) {
            showSuccessSnackBar(this.props.localeStrings.resetSuccessPassword);
            this.props.navigation.pop();
        } else {
            Alert.alert(
                this.props.localeStrings.success,
                this.props.localeStrings.loginNewPassword,
                [{
                    text: this.props.localeStrings.ok, onPress: () => {
                        if (this.props.navigation.state.params &&
                            this.props.navigation.state.params.appState === 'background') {
                            this.props.navigation.pop();
                        } else {
                            this.props.navigation.dispatch(
                                StackActions.reset({
                                    index: 0,
                                    key: undefined,
                                    actions: [
                                        NavigationActions.navigate({routeName: Routes.MainRoute}),
                                    ]
                                }))
                        }
                    }
                }], {
                    cancelable: false
                });
        }

    };
    //UI methods

    renderUI = () => {
        let {routeName} = this.props.navigation.state;
        if (routeName === Routes.ChangePswdDeepLink && !this.state.isCodeVerified) {
            return this.renderLoading();
        } else {
            return this.renderChangePswd();
        }
    };

    renderLoading = () => {
        /*{!this.state.showCodeVerifying &&
                !this.state.isCodeVerified &&
                <Label color={Color.TEXT_LIGHT}
                       mt={20}
                       style={CommonStyle.underlineLabel}>
                    {'Retry'}
                </Label>
           }*/
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                {this.state.showCodeVerifying &&
                <ActivityIndicator color={Color.PRIMARY}
                                   size={'large'}/>
                }
                <Label mt={10}
                       nunito_bold
                       bolder={IS_IOS}
                       color={Color.TEXT_LIGHT}>
                    {this.state.codeMessage}
                </Label>
            </View>
        )
    };

    renderChangePswd = () => {
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0);
        return (
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
                        {this.props.navigation.state.routeName === Routes.ChangePswd &&
                        <PasswordInputText
                            icon={"password"}
                            autoCapitalize={'none'}
                            label={this.props.localeStrings.oldPassword}
                            error={this.state.oldPasswordError}
                            onFocus={() => {
                                this.setState({oldPasswordError: ""})
                            }}
                            onChangeText={(oldPassword) => this.setState({oldPassword})}/>
                        }
                        <PasswordInputText
                            icon={"password"}
                            autoCapitalize={'none'}
                            label={this.props.localeStrings.newPassword}
                            error={this.state.newPasswordError}
                            onFocus={() => {
                                this.setState({newPasswordError: ""})
                            }}
                            onChangeText={(newPassword) => this.setState({newPassword})}/>
                        <PasswordInputText
                            icon={"password"}
                            autoCapitalize={'none'}
                            label={this.props.localeStrings.confirmNewPassword}
                            error={this.state.confirmPasswordError}
                            onFocus={() => {
                                this.setState({confirmPasswordError: ""})
                            }}
                            onChangeText={(confirmPassword) => this.setState({confirmPassword})}/>
                    </View>
                </View>
                <View style={CommonStyle.contentVerticalBottom}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={[CommonStyle.bottomContainer, {backgroundColor: Color.PRIMARY,}]}
                        onPress={this.onUpdatePassword}>
                        <Label color={Color.WHITE}
                               nunito_bold
                               bolder={IS_IOS}
                               ms={5}>
                            {this.props.localeStrings.updatePassword}
                        </Label>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>
        )
    };

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            oldPassword: '',
            oldPasswordError: '',
            newPassword: '',
            newPasswordError: '',
            confirmPassword: '',
            confirmPasswordError: '',
            fullName: this.props.user ? this.props.user.full_name : "",
            fullNameError: "",
            email: this.props.user ? this.props.user.email : "",
            emailError: "",
            mobileNumber: this.props.user ? this.props.user.telephone.replace(`${Constants.CountryCode}`, '') : "",
            mobileNumberError: "",
            countryCode: Constants.CountryCode,
            isLoaderVisible: false,
            isCodeVerified: false,
            showCodeVerifying: false,
            codeMessage: this.props.localeStrings.pleaseWait,
            forgotCode: null
        };
    }

    componentDidMount() {
        if (this.props.navigation.state &&
            this.props.navigation.state.routeName === Routes.ChangePswdDeepLink) {
            let {params} = this.props.navigation.state;
            this.verifyForgotCode(params);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const topPadding = this.calculatePadding();
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
                           mb={5}>{this.props.localeStrings.changePassword}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.updateYourPassword}</Label>

                </View>
                {this.renderUI()}
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword)

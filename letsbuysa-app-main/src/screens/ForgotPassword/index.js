import React, {Component} from 'react';
import {
    View,
    Alert,
    Button,
    Image
} from 'react-native';

//Custom component
import {
    FloatingInputText,
    PasswordInputText,
    Label,
    RoundButton,
    SocialRoundButton
} from "src/component";

//Utility
import {
    Constants,
    Strings,
    ThemeUtils,
    Color,
    CommonStyle,
    IS_IOS,
    UtilityManager,
    IS_ANDROID,
    validation,
    showErrorSnackBar,
} from "src/utils";
import {APIRequest, API_FORGOT_PASSWORD, ApiURL} from "src/api";
import styles from './styles';
import Action from "src/redux/action";

//Third party
import {connect} from "react-redux";
import {SafeAreaView} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';

class ForgotPassword extends Component<Props> {

    forgotPasswordRequest = () => {
        let param = {
            "email": this.state.email,
        };

        this.setState({
            isLoaderVisible: true,
        });

        new APIRequest.Builder()
            .post()
            .setReqId(API_FORGOT_PASSWORD)
            .reqURL(ApiURL.forgotPassword)
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
                case API_FORGOT_PASSWORD:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            setTimeout(() => {
                                Alert.alert(this.props.localeStrings.success,
                                    this.props.localeStrings.forgotSuccessMessage, [
                                        {
                                            text: this.props.localeStrings.ok, onPress: () => {
                                                this.props.navigation.pop();
                                            }
                                        }
                                    ]);
                            }, 200);
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
        console.log('error', error);
        if (error.meta && error.meta.message) {
            showErrorSnackBar(error.meta.message);
        }
    };

    //User interaction
    onSendCode = () => {
        if (this.validateForm())
            this.forgotPasswordRequest()
    };

    onClickCancel = () => {
        this.props.navigation.pop();
    };

    // Utility Method

    validateForm = () => {
        let emailError;
        let isValide = true;

        emailError = validation("email", this.state.email);

        if (emailError !== null) {
            this.setState({
                emailError: emailError,
            });
            isValide = false;
        } else {
            this.setState({
                emailError: "",
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

    //lifecycle events

    constructor(props) {
        super(props);
        this.state = {
            email: "",
            emailError: "",
        };
    }

    componentDidMount() {
        console.log('status height', UtilityManager.getInstance().getStatusBarHeight())
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0);
        return (
            <SafeAreaView style={{
                flex: 1,
                backgroundColor: Color.WHITE
            }} forceInset={{top: 'never'}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={CommonStyle.topAnimContainer}>
                    <View style={[CommonStyle.headerLogoContainer, {marginTop: 15 + this.calculatePadding()}]}>
                        <Image source={HEADER_LOGO}
                               resizeMode={'contain'}
                               style={CommonStyle.headerLogo}/>
                    </View>
                    <Label color={Color.WHITE}
                           large
                           mt={25}
                           mb={5}>{this.props.localeStrings.forgotPasswordTitle}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.getCodeMessage}</Label>
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
                                icon={"mail"}
                                autoCapitalize={'none'}
                                label={this.props.localeStrings.email}
                                value={this.state.email}
                                keyboardType={'email-address'}
                                error={this.state.emailError}
                                onFocus={() => {
                                    this.setState({emailError: ""})
                                }}
                                onChangeText={(email) => this.setState({email})}/>
                        </View>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            mt={20}
                            mb={20}
                            border_radius={5}
                            btnPrimary
                            textColor={Color.WHITE}
                            click={this.onSendCode}>
                            {this.props.localeStrings.sendLink}
                        </RoundButton>
                    </View>
                    <View style={CommonStyle.contentVerticalBottom}>
                        <View style={CommonStyle.bottomContainer}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   onPress={this.onClickCancel}>
                                {this.props.localeStrings.cancel.toUpperCase()}
                            </Label>
                        </View>
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


export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword)

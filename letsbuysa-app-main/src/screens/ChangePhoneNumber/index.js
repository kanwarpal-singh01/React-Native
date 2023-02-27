import React, {Component} from 'react';
import {
    View,
    Alert,
    Button,
    Image, TouchableOpacity
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
    IS_ANDROID,
    validation,
    showErrorSnackBar, UtilityManager
} from "src/utils";
import {APIRequest, API_CHANGE_NUMBER, ApiURL} from "src/api";
import styles from './styles';
import Action from "src/redux/action";
import Routes from "src/router/routes";

//Third party
import {connect} from "react-redux";
import {SafeAreaView} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';

class ChangePhoneNumber extends Component<Props> {

    static navigationOptions = {
        header: null,
        gesturesEnabled: false
    };

    changeNumberRequest = () => {
        let param = {
            "customer_id": this.props.user.customer_id,
            "telephone": `${Constants.CountryCode}${this.state.mobileNumber}`,
        };

        this.setState({
            isLoaderVisible: true,
        });

        new APIRequest.Builder()
            .post()
            .setReqId(API_CHANGE_NUMBER)
            .reqURL(ApiURL.changeNumber)
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
                case API_CHANGE_NUMBER:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            this.props.setUser(response.data.user);

                            setTimeout(() => {
                                Alert.alert(this.props.localeStrings.success,
                                    this.props.localeStrings.otpSendMessage, [
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
    onClickChangeNumber = () => {
        if (this.validateForm()) {
            this.changeNumberRequest()
        }
    };

    // Utility Method
    onClickCancel = () => {
        this.props.navigation.navigate(Routes.VerifyCode);
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
    validateForm = () => {
        let mobileNoError;
        let isValide = true;

        mobileNoError = validation("phoneNo", this.state.mobileNumber);

        if (mobileNoError !== null) {
            this.setState({
                mobileNumberError: mobileNoError,
            });
            isValide = false;
        } else {
            this.setState({
                mobileNumberError: "",
            });
            isValide = true;
        }
        return isValide;
    };

    constructor(props) {
        super(props);
        this.state = {
            mobileNumber: "",
            mobileNumberError: "",
            countryCode: Constants.CountryCode,
        };
    }

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const minHeight = ThemeUtils.relativeHeight(70) - (ThemeUtils.isIphoneX() || IS_ANDROID ? UtilityManager.getInstance().getStatusBarHeight() : 0)
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
                           mb={5}>{this.props.localeStrings.changePhoneNumber}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.enterNewMobileForOTP}</Label>
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
                            <View style={styles.mobileContainer}>
                                <View style={styles.countryCodeContainer}>
                                    <FloatingInputText
                                        icon={"call"}
                                        label={""}
                                        style={styles.countryCode}
                                        isConstant={true}
                                        showFlag={Constants.SA_FLAG_ICON}
                                        editable={false}
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
                                    onChangeText={(mobileNumber) => this.setState({mobileNumber})}/>
                            </View>
                        </View>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            mt={20}
                            mb={20}
                            border_radius={5}
                            btnPrimary
                            textColor={Color.WHITE}
                            click={this.onClickChangeNumber}>
                            {this.props.localeStrings.changePhoneNumber}
                        </RoundButton>
                    </View>
                    <View style={CommonStyle.contentVerticalBottom}>
                        <TouchableOpacity
                            underlayColor={Color.TRANSPARENT}
                            activeOpacity={0.7}
                            style={CommonStyle.bottomContainer}
                            onPress={this.onClickCancel}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_bold
                                   bolder={IS_IOS}>
                                {this.props.localeStrings.cancel.toUpperCase()}
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


export default connect(mapStateToProps, mapDispatchToProps)(ChangePhoneNumber)

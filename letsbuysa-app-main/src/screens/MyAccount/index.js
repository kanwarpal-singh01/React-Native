import React, {Component} from 'react';
import {
    View,
    Image,
    TouchableOpacity, I18nManager,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";
import DeviceInfo from "react-native-device-info/deviceinfo";

//Utility
import Action from "src/redux/action";
import {API_LOGOUT, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import Routes from "src/router/routes";
import {
    Color,
    CommonStyle,
    Strings,
    ThemeUtils,
    Icon,
    UtilityManager,
    IS_ANDROID,
    Constants,
    showSuccessSnackBar
} from "src/utils";

//Custom component
import {Label, Hr, RoundButton} from "src/component";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';
import APP_NAME from "src/assets/images/appName.png";

class MyAccount extends Component {

    //localized assets
    routes = [
        {
            id: 1,
            route: Routes.EditProfile,
            label: this.props.localeStrings.editProfile,
            icon: "account_normal"
        },
        {
            id: 2,
            route: Routes.ChangePswd,
            label: this.props.localeStrings.changePassword,
            icon: "password"
        }
    ];

    socialRoutes = [
        {
            id: 1,
            route: Routes.EditProfile,
            label: this.props.localeStrings.editProfile,
            icon: "account_normal"
        }
    ];

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            isLoaderVisible: false,
            routes: this.props.user && this.props.user.social_login ? this.socialRoutes : this.routes
        };
    }

    //Server request
    logoutRequest = () => {
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

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false
        }, () => {
            switch (reqId) {
                case API_LOGOUT:
                    switch (response.status) {
                        case Constants.ResponseCode.OK:
                            this.props.logoutUser();
                            // DeviceEventEmitter.emit(notificationKey.LOGOUT, {});
                            break;
                        default:
                            break
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
        }, () => {
            switch (reqId) {
                case API_LOGOUT:
                    this.props.logoutUser();
                    break;
            }
        });
    };

    //User Interaction
    onClickMenuItem = (item) => {
        console.log(item, "Item")
        switch (item.route) {
            default:
                this.props.navigation.navigate(item.route);
                break;
        }
    };

    onClickBack = () => {
        this.props.navigation.pop();
    };

    //UI methods
    renderMenuItem = (item, idx) => {
        return (
            <TouchableOpacity key={idx.toString()}
                              activeOpacity={0.8}
                              underlayColor={Color.TRANSPARENT}
                              onPress={() => {
                                  this.onClickMenuItem(item)
                              }}>
                <View style={styles.menuItem}
                      key={item.label}>
                    <Icon name={item.icon}
                          color={Color.PRIMARY}
                          size={20}
                          me={20}
                          ms={5}/>
                    <Label color={Color.TEXT_DARK}
                           ms={15}
                           me={10}
                           style={{flex: 1}}>
                        {item.label}
                    </Label>
                    <Icon name={"arrow"}
                          color={Color.DARK_LIGHT_BLACK}
                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                          size={20}
                          me={10}
                          ms={10}/>
                </View>
                {idx !== this.state.routes.length - 1 &&
                <Hr lineStyle={{backgroundColor: Color.DARK_LIGHT_BLACK}}/>
                }
            </TouchableOpacity>
        )
    };

    //Utility
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

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const topPadding = this.calculatePadding();
        return (
            <View style={[CommonStyle.safeArea]}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={[CommonStyle.topAnimContainer]}>
                    <TouchableOpacity
                        style={[CommonStyle.backBtn, {top: topPadding}]}
                        onPress={this.onClickBack}>
                        <Icon name={"back"}
                              color={Color.LIGHT_WHITE}
                              style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                              size={20}
                              me={10}
                              ms={10}/>
                    </TouchableOpacity>
                    <View style={[CommonStyle.headerLogoContainer, {marginTop: 15 + this.calculatePadding()}]}>
                        <Image source={HEADER_LOGO}
                               resizeMode={'contain'}
                               style={CommonStyle.headerLogo}/>
                    </View>
                    {this.props.user ?
                        <>
                            {/* {this.props.langCode === Constants.API_LANGUAGES.AR ?
                                <View style={styles.arabicAppName}>
                                    <Image source={APP_NAME}
                                           style={{flex: 1, tintColor: Color.PRIMARY}}
                                           tintColor={Color.PRIMARY}
                                           resizeMode={'contain'}/>
                                </View> :
                                <Label color={Color.PRIMARY}
                                       xxlarge
                                       philosopher
                                       mt={10}
                                       mb={5}>{this.props.localeStrings.appName}</Label>
                            } */}
                            <Label color={Color.WHITE}
                                   xlarge
                                   mt={20}
                                   mb={5}>{`${this.props.localeStrings.welcome}, ${this.props.user.full_name}`}</Label>
                        </> : null
                    }

                </View>
                <KeyboardAwareScrollView
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={true}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.menuContainer}>
                            {this.state.routes.map((item, index) => {
                                return this.renderMenuItem(item, index)
                            })}
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(Action.logout()),
        setShowPopUp: (showSupportPopUp) => dispatch(Action.setShowPopUp(showSupportPopUp))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAccount)

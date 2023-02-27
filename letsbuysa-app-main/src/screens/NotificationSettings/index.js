import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    I18nManager,
    Switch,
    TouchableOpacity,
    Image,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {SafeAreaView} from "react-navigation";
import Spinner from "react-native-loading-spinner-overlay";

//Utility
import Action from "src/redux/action";
import {API_CHANGE_NOTIF_SETTINGS, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {
    Color,
    CommonStyle,
    Icon,
    IS_ANDROID,
    ThemeUtils,
    UtilityManager,
    Constants,
    showSuccessSnackBar,
    showErrorSnackBar
} from "src/utils";
import {Label} from "src/component";

import HEADER_LOGO from 'src/assets/images/header_logo.png';

class NotificationSettings extends Component {

    //Server request
    changeNotifRequest = () => {
        this.setState({
            isLoaderVisible: true
        });
        let {
            notification_email,
            notification_sms,
            notification_push
        } = this.state;

        let params = {
            "customer_id": this.props.user.customer_id,
            "notification_email": notification_email ? 1 : 0,
            "notification_sms": notification_sms ? 1 : 0,
            "notification_push": notification_push ? 1 : 0
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_CHANGE_NOTIF_SETTINGS)
            .reqURL(ApiURL.changeNotifSettings)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_CHANGE_NOTIF_SETTINGS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.user) {
                            this.props.setUser(response.data.user)
                        }
                        if (response.data && response.data.success) {
                            showSuccessSnackBar(response.data.success.message)
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        let {
            notification_email = false,
            notification_sms = false,
            notification_push = false
        } = this.props.user;
        switch (reqId) {
            case API_CHANGE_NOTIF_SETTINGS:
                this.setState({
                    isLoaderVisible: false,
                    notification_email,
                    notification_sms,
                    notification_push,
                });
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
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

    //User Interaction
    onClickBack = () => {
        this.props.navigation.pop();
    };

    //Utility
    renderNotifSwitch = (label, index) => {
        let type = 'notification_email';
        switch (index) {
            case 0:
                type = 'notification_email';
                break;
            case 1:
                type = 'notification_sms';
                break;
            case 2:
                type = 'notification_push';
                break;
        }
        return (
            <View style={styles.menuItem}
                  key={label}>
                <Label color={Color.TEXT_DARK}>
                    {label}
                </Label>
                <Switch
                    value={this.state[type]}
                    thumbColor={this.state[type] ? Color.PRIMARY : Color.TEXT_LIGHT}
                    trackColor={{false: Color.LIGHT_GRAY, true: Color.LIGHT_GRAY}}
                    onValueChange={() => this.setState(prevState => (
                        {[type]: !prevState[type]}), () => {
                        this.changeNotifRequest()
                    })
                    }/>
            </View>
        )
    };

    //Lifecycle methods
    constructor(props) {
        super(props);

        let {
            notification_email = false,
            notification_sms = false,
            notification_push = false
        } = this.props.user;
        this.state = {
            notification_email,
            notification_sms,
            notification_push,
            isLoaderVisible: false,
            types: [
                this.props.localeStrings.emailNotifLabel,
                this.props.localeStrings.smsNotifLabel,
                this.props.localeStrings.pushNotifLabel
            ]
        };
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.user !== this.props.user) {
            let {
                notification_email = false,
                notification_sms = false,
                notification_push = false
            } = this.props.user;
            this.setState({
                notification_email,
                notification_sms,
                notification_push
            })
        }
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
                    <Label color={Color.WHITE}
                           xxlarge
                           mt={25}
                           mb={5}>
                        {this.props.localeStrings.notificationTitle}
                    </Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           xlarge
                           mb={5}>
                        {this.props.localeStrings.notificationSettingCaption}
                    </Label>
                </View>
                <View style={styles.container}>
                    {this.state.types.map((item, index) => {
                        return this.renderNotifSwitch(item, index)
                    })}
                </View>
            </SafeAreaView>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setUser: (user) => dispatch(Action.setUser(user))
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

export default connect(mapStateToProps, mapDispatchToProps)(NotificationSettings)

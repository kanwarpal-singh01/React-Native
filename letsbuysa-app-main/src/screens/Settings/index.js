import React from 'react';
import {
    I18nManager,
    Image,
    TouchableOpacity,
    View,
    Alert,
    Platform
} from 'react-native';

//Third party
import RNRestart from 'react-native-restart';
import {SafeAreaView} from "react-navigation";
import {connect} from "react-redux";

//Custom Component
import {Color, CommonStyle, Icon, IS_ANDROID, Strings, ThemeUtils, UtilityManager} from "src/utils";

//Utility
import {Hr, Label, LanguageChangePopUp} from "src/component";
import HEADER_LOGO from 'src/assets/images/header_logo.png';
import Action from "src/redux/action";
import Routes from 'src/router/routes';
import styles from './styles'


class Settings extends React.Component {


    //localized assets
    CommonRoutes = [
        {
            label: this.props.localeStrings.changeLanguage,
            route: "changeLanguagePopUpShow",
            icon: "about_app"
        },
    ];

    AuthRoutes = [
        {
            label: this.props.localeStrings.notificationTitle,
            route: Routes.NotificationSettings,
            icon: "notification"
        }
    ];

    //User Interaction
    onClickBack = () => {
        this.props.navigation.pop();
    };

    onClickMenuItem = (item) => {
        switch (item.route) {
            case "changeLanguagePopUpShow":
                this.setState({showLanguagePopUp: true});
                break;
            case Routes.NotificationSettings:
                this.props.navigation.navigate(Routes.NotificationSettings);
                break;
        }
    };

    onCloseLanguagePopup = () => {
        this.setState({showLanguagePopUp: false});
    };


    onChangeLanguage = (langItem) => {

        setTimeout(() => {
            if (this.props.langCode !== langItem.languageCode) {
                    // Alert.alert(
                    //     this.props.localeStrings.warning,
                    //     this.props.localeStrings.appRestart,
                    //     [{
                    //         text: this.props.localeStrings.continue,
                    //         onPress: () => {
                    //             if (langItem.languageCode &&
                    //                 this.props.appConfig &&
                    //                 Array.isArray(this.props.appConfig.languages) &&
                    //                 this.props.appConfig.languages.length > 0) {
    
                    //                 let languageConfig = this.props.appConfig.languages.find(lang => lang.language_id === langItem.languageCode);    
                    //                 this.props.setLanguageCode(languageConfig.language_id);
                    //                 this.props.localeStrings.setLanguage(languageConfig.code);
                    //                 I18nManager.forceRTL(languageConfig.code === 'ar');
                    //                 setTimeout(() => {
                    //                    RNRestart.Restart();
                    //                 }, 300)
                    //             }
                    //         }
                    //     }, {
                    //         text: this.props.localeStrings.cancel,
                    //         onPress: () => {
                    //         }
                    //     }],
                    //     {cancelable: false});
           
                    if (langItem.languageCode &&
                    this.props.appConfig &&
                    Array.isArray(this.props.appConfig.languages) &&
                    this.props.appConfig.languages.length > 0) {
                    let languageConfig = this.props.appConfig.languages.find(lang => lang.language_id === langItem.languageCode);

                    this.props.setLanguageCode(languageConfig.language_id);
                    this.props.localeStrings.setLanguage(languageConfig.code);
                    I18nManager.forceRTL(languageConfig.code === 'ar');
                    setTimeout(() => {
                        RNRestart.Restart();
                     }, 100)
                  }
            }
        }, 600)
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

    //UI Methods

    renderLanguageModal = () => {
        return <LanguageChangePopUp showPopup={this.state.showLanguagePopUp}
                                    onClosePopUp={this.onCloseLanguagePopup}
                                    onSelect={this.onChangeLanguage}/>
    };

    renderMenuItem = (item, idx) => {
        return (
            <TouchableOpacity
                key={idx.toString()}
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

    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            isLoaderVisible: false,
            routes: this.props.user ? [...this.CommonRoutes, ...this.AuthRoutes] : [...this.CommonRoutes],
            showLanguagePopUp: false,
            languageOptions: ''
        }
    }

    render() {
        const topPadding = this.calculatePadding();
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
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
                        {this.props.localeStrings.settings}
                    </Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           xlarge
                           mb={5}>
                        {this.props.localeStrings.settingsNote}
                    </Label>
                </View>
                <View style={styles.container}>
                    {this.state.routes.map((item, index) => {
                        return this.renderMenuItem(item, index)
                    })}
                </View>
                {this.renderLanguageModal()}
            </SafeAreaView>
        )
    }
}


const mapDispatchToProps = (dispatch) => {
    return {
        setLanguageCode: (code) => dispatch(Action.setLanguageCode(code)),
        setStrings: (localeStrings) => dispatch(Action.setStrings(localeStrings))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        appConfig: state.appConfig,
        localeStrings: state.localeStrings,
        langCode: state.langCode,
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings)

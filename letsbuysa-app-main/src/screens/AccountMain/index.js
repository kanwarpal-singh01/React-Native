import React, {Component} from 'react';
import {
    View,
    Image,
    TouchableOpacity,
    I18nManager,
    Share,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";
import DeviceInfo from "react-native-device-info/deviceinfo";
import AntDesign from 'react-native-vector-icons/AntDesign';

//Utility
import Action from "src/redux/action";
import {API_LOGOUT, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import Routes from "src/router/routes";
import {
    Color,
    CommonStyle,
    IS_IOS,
    ThemeUtils,
    Icon,
    UtilityManager,
    IS_ANDROID,
    Constants,
    openLinkInBrowser,
    showSuccessSnackBar,
} from "src/utils";

//Custom component
import {Label, Hr, RoundButton} from "src/component";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';
import APP_NAME from 'src/assets/images/appName.png';

class Account extends Component {

    //Localized data
    AuthRoutes = [
        {
            label: this.props.localeStrings.navMyAccount,
            route: Routes.MyAccount,
            icon: "account_normal"
        },
        {
            label: this.props.localeStrings.navMyOrders,
            route: Routes.MyOrders,
            icon: "my_order"
        },
        {
            label: this.props.localeStrings.myAddress,
            route: Routes.MyAddress,
            icon: "my_addresses"
        },
        {
            label: this.props.localeStrings.my_wallet,
            route: Routes.Wallet,
            icon: "wallet"
        },
        {
            label: this.props.localeStrings.navMyNotifications,
            route: Routes.MyNotifications,
            icon: "notification"
        },
    ];

    CommonRoutes = [
        {
            label: this.props.localeStrings.myWishList,
            route: Routes.Wishlist,
            icon: "wishlist_normal"
        },
        {
            label: this.props.localeStrings.helpSupport,
            route: "HelpSupport",
            icon: "customer_service"
        },
        {
            label: this.props.localeStrings.navAboutApp,
            route: Routes.About,
            icon: "about_app"
        },
        {
            label: this.props.localeStrings.settings,
            route: Routes.Settings,
            icon: "settings"
        },
        {
            label: this.props.localeStrings.rateApp,
            route: "RateApp",
            icon: "my_favourites"
        },
        {
            label: this.props.localeStrings.shareApp,
            route: "ShareApp",
            icon: "share_app"
        },
    ];

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
    onLogout = () => {
        this.logoutRequest();
    };

    onClickSocial = (item) => {
        let link = this.props.appConfig[item.id];
        if (link) openLinkInBrowser(link)
        else openLinkInBrowser(item.dummyLink)

    };

    onClickSignIn = () => {
        this.props.navigation.navigate(Routes.Login, {
            fromRoute: Routes.MainTabs
        })
    };

    onClickSignUp = () => {
        this.props.navigation.navigate(Routes.SignUp);
    };

    onClickMenuItem = (item) => {
        switch (item.route) {
            case "HelpSupport":
                this.props.setShowPopUp(true);
                break;
            case Routes.Wishlist:
            case Routes.MyAccount:
            case Routes.MyAddress:
            case Routes.About:
            case Routes.Settings:
            case Routes.MyOrders:
            case Routes.MyNotifications:
                this.props.navigation.navigate(item.route);
                break;
            case Routes.Wallet:
                this.props.navigation.navigate(item.route,{title:this.props?.localeStrings?.my_wallet});
                break;
            case "RateApp":
                let storeLink = IS_IOS ?
                    `${Constants.IOS_APP_STORE_URL}?action=write-review` :
                    Constants.ANDROID_APP_STORE_URL;
                openLinkInBrowser(storeLink);
                break;
            case "ShareApp":
                this.onShare();
                break;
            default:
                // this.props.navigation.navigate(item.route);
                break;
        }
    };

    onShare = async () => {
        try {
            const result = await Share.share({
                message:
                    IS_IOS ? Constants.IOS_APP_STORE_URL : Constants.ANDROID_APP_STORE_URL
            });
        } catch (error) {
            alert(error.message);
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
                    {item.icon !== 'wallet' ? <Icon name={item.icon}
                          color={Color.PRIMARY}
                          size={20}
                          me={20}
                          ms={5}/> :
                          <AntDesign name={item.icon} color={Color.PRIMARY} size = {20}/>}
                    <Label color={Color.TEXT_DARK}
                           ms={15}
                           me={10}
                           style={{flex: 1}}>
                        {item.label}
                    </Label>
                    {!(item.route === "ShareApp" || item.route === "RateApp") &&
                    <Icon name={"arrow"}
                          color={Color.DARK_LIGHT_BLACK}
                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                          size={20}
                          me={10}
                          ms={10}/>
                    }
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
            routes: this.props.user ? [...this.AuthRoutes, ...this.CommonRoutes] : [...this.CommonRoutes]
        };
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.user !== prevProps.user) {
            this.setState({
                routes: this.props.user ? [...this.AuthRoutes, ...this.CommonRoutes] : [...this.CommonRoutes]
            })
        }
    }

    render() {
        return (
            <View style={[CommonStyle.safeArea,]}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={[CommonStyle.topAnimContainer]}>
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
                        </> :
                        <View style={styles.authBtnContainer}>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(40)}
                                btnPrimary
                                backgroundColor={Color.WHITE}
                                mt={15}
                                mb={20}
                                border_radius={5}
                                textColor={Color.TEXT_DARK}
                                click={this.onClickSignIn}>
                                {this.props.localeStrings.signIn}
                            </RoundButton>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(40)}
                                btnPrimary
                                backgroundColor={Color.PRIMARY}
                                mt={15}
                                mb={20}
                                border_radius={5}
                                textColor={Color.WHITE}
                                click={this.onClickSignUp}>
                                {this.props.localeStrings.signUp}
                            </RoundButton>
                        </View>
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
                        {this.props.user ?
                            <RoundButton
                                width={ThemeUtils.relativeWidth(85)}
                                backgroundColor={Color.LIGHT_WHITE}
                                borderColor={Color.TEXT_LIGHT}
                                borderWidth={0.5}
                                mt={10}
                                mb={10}
                                border_radius={5}
                                textColor={Color.TEXT_DARK}
                                click={this.onLogout}>
                                <Icon name={'sign_out'}
                                      size={16}/>
                                <Label>
                                    {`   ${this.props.localeStrings.signOut}`}
                                </Label>
                            </RoundButton> : null
                        }
                        {this.props.user ?
                            <View style={styles.menuBottom}>
                                <View style={styles.followLabel}>
                                    <Label color={Color.TEXT_LIGHT}>
                                        {this.props.localeStrings.followUsOn}
                                    </Label>
                                </View>
                                <View style={styles.followBtns}>
                                    {Constants.SOCIAL_LINKS.map((item) => {
                                        if (this.props.appConfig && this.props.appConfig[item.id]) {
                                            return (
                                                <TouchableOpacity
                                                    key={this.props.appConfig[item.id]}
                                                    onPress={() => this.onClickSocial(item)}
                                                    style={{marginHorizontal: 10}}>
                                                    <Image source={item.image}
                                                           resizeMode={'contain'}
                                                           style={styles.followBtnLogo}/>

                                                </TouchableOpacity>)
                                        }
                                        return <View key={this.props.appConfig[item.id]}/>

                                    })}
                                </View>
                            </View> : null
                        }
                        <Label align={'center'} xxsmall color={Color.TEXT_LIGHT} mb={10}>
                                        {this.props.appConfig.copyright}
                        </Label>
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
        appConfig: state.appConfig,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Account)

import React, {Component} from 'react';
import {
    View,
    Keyboard,
    TouchableOpacity,
    Image,
    Alert
} from 'react-native';

//Custom component
import {
    FloatingInputText,
    PasswordInputText,
    Label,
    RoundButton
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
    showErrorSnackBar,
    showInfoSnackBar,
    capitalizeLetters
} from "src/utils";
import {
    APIRequest,
    API_SOCIAL_REGISTER,
    API_SIGNUP, ApiURL
} from "src/api";
import Routes from "src/router/routes";
import styles from './styles';
import Action from "src/redux/action";

//Third party
import {NavigationActions, SafeAreaView, StackActions} from "react-navigation";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import DeviceInfo from 'react-native-device-info';
import Spinner from "react-native-loading-spinner-overlay";
import {connect} from "react-redux";

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';
import firebase from "react-native-firebase";

class SignUp extends Component {

    //Server request
    signUpRequest = async () => {
        console.log('signUpRequest');
        let params = {
            'key': Constants.API_KEY,
            'email': this.state.email,
            'password': this.state.password,
            'full_name': this.state.fullName,
            'telephone': `${Constants.CountryCode}${this.state.mobileNumber}`,
            'device_id': await DeviceInfo.getUniqueID(),
            'device_token': this.props.fcmToken,
            'device_type': IS_IOS ? 'ios' : 'android'
        };

        let final_params = this.prepareParamsForSync(params);

        this.setState({isLoaderVisible: true}, () => {
            new APIRequest.Builder()
                .post()
                .setReqId(API_SIGNUP)
                .reqURL(ApiURL.signUp)
                .formData(final_params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        });
    };

    socialSignUpRequest = async () => {
        console.log('socialSignUpRequest');
        let params = {
            'key': Constants.API_KEY,
            'email': this.state.email,
            'password': this.state.password,
            'full_name': this.state.fullName,
            'telephone': `${Constants.CountryCode}${this.state.mobileNumber}`,
            'device_id': await DeviceInfo.getUniqueID(),
            'device_token': this.props.fcmToken,
            'device_type': IS_IOS ? 'ios' : 'android'
        };

        params.provider = this.state.providerData.provider;
        params.provider_id = this.state.providerData.provider_id;
        params.access_token = this.state.providerData.access_token;


        let final_params = this.prepareParamsForSync(params);

        this.setState({isLoaderVisible: true}, () => {
            new APIRequest.Builder()
                .post()
                .setReqId(API_SOCIAL_REGISTER)
                .reqURL(ApiURL.socialRegister)
                .formData(final_params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        });
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_SIGNUP:
            case API_SOCIAL_REGISTER:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response?.data &&
                            response?.data?.user 
                            // && response.data.token
                            ) {
                            this.props.setUser(response.data.user);
                            // this.props.setToken(response.data.token);
                            if (response?.data && response?.data?.success) {
                                this.showRegisterSuccessAlert(response)
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
            case API_SIGNUP:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
            case API_SOCIAL_REGISTER:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    //User interaction
    openTermCondtionEvent = () => {
        if (this.props.appConfig && Array.isArray(this.props.appConfig.languages)) {
            let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode);
            if (selectedLang && selectedLang.information) {
                let html = selectedLang.information.find(type => type.title === 'Terms of Use' ||
                    type.title === 'شروط الاستخدام'
                );
                if (html) {
                    this.props.navigation.navigate(Routes.WebsiteView, {
                        title: html.title,
                        description: html.description
                    })
                }
            }
        }
    };

    openPrivacyPolicyEvent = () => {
        if (this.props.appConfig && Array.isArray(this.props.appConfig.languages)) {
            let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode);
            if (selectedLang && selectedLang.information) {
                let html = selectedLang.information.find(type => type.title === 'Privacy' ||
                    type.title === 'الخصوصية'
                );
                if (html) {
                    this.props.navigation.navigate(Routes.WebsiteView, {
                        title: html.title,
                        description: html.description
                    })
                }
            }
        }
    };

    onClickSignIn = () => {
        this.props.navigation.navigate(Routes.Login)
    };

    onClickSkip = () => {
        this.props.navigation.dispatch(this.resetToMain);
    };

    onClickSignUpBtn = () => {
        console.log('onClickSignUpBtn');
        this.setState(prevState => ({
            email: prevState.email ? prevState.email.trim() : "",
            password: prevState.password ? prevState.password.trim() : "",
            fullName: prevState.fullName ? prevState.fullName.trim() : "",
            mobileNumber: prevState.mobileNumber ? prevState.mobileNumber.trim() : ""
        }), () => {
            if (this.validateForm()) {
                if (this.state.isSocialRegister) {
                    this.socialSignUpRequest()
                } else {
                    this.signUpRequest()
                }
            }
        });

    };

    //Utility
    async getToken() {
        let fcmToken = this.props.fcmToken;
        if (!fcmToken) {
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                this.props.setFCMToken(fcmToken)
            }
        }
    }

    async checkPermission() {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    async requestPermission() {
        try {
            await firebase.messaging().requestPermission();
            this.getToken();
        } catch (error) {
            console.log('permission rejected');
            this.getToken();
        }
    }

    // prepareParamsForSync = (params) => {
    //     //sync recently viewed
    //     if (Array.isArray(this.props.recentProducts) && this.props.recentProducts.length > 0) {
    //         let id_string = "";
    //         this.props.recentProducts.map(product => {
    //             id_string = `${id_string}${id_string ? "," : ""}${product.product_id}`;
    //         });
    //         params['recently_viewed'] = id_string;
    //     }

    //     //sync wishlist
    //     if (Array.isArray(this.props.wishlist) && this.props.wishlist.length > 0) {
    //         let id_string = "";
    //         this.props.wishlist.map(product => {
    //             id_string = `${id_string}${id_string ? "," : ""}${product.product_id}`;
    //         });
    //         params['wishlist_viewed'] = id_string;
    //     }

    //     //sync cart
    //     let cart_products = this.parseCartData();

    //     if (cart_products !== null && cart_products !== undefined) {
    //         params['addtocart_products'] = JSON.stringify(cart_products);
    //     }

    //     return params
    // };

    prepareParamsForSync = params => {
        //sync recently viewed
        if (
          Array.isArray(this.props.recentProducts) &&
          this.props.recentProducts.length > 0
        ) {
          let id_string = '';
          this.props.recentProducts.map(product => {
            id_string = `${id_string}${id_string ? ',' : ''}${product.id}`;
          });
          params['recently_viewed'] = id_string;
        }
    
        //sync wishlist
        if (Array.isArray(this.props.wishlist) && this.props.wishlist.length > 0) {
          let id_string = '';
          this.props.wishlist.map(product => {
            id_string = `${id_string}${id_string ? ',' : ''}${product.id}`;
          });
          params['wishlist_viewed'] = id_string;
        }
    
        //sync cart
        let cart_products = this.parseCartData();
    
        if (cart_products !== null && cart_products !== undefined) {
          // params['addtocart_products'] = JSON.stringify(cart_products);
           params['addtocart_products'] = JSON.stringify(cart_products);
              }
    
        console.log('my final params',params)
    
        return params;
      };

    
    


    // parseCartData = () => {
    //     if (Array.isArray(this.props.cart) && this.props.cart.length > 0) {
    //         //Eg.Params
    //         //[{"product_id":217,"quantity":2,"option": { "344" :"255" } }]
    //         let data = this.props.cart.map((cart_item) => {
    //             let new_item = {
    //                 "product_id": cart_item.product_id,
    //                 "quantity": cart_item.quantity
    //             };
    //             //get options
    //             let option_param = null;
    //             if (cart_item.selectedOptions) {
    //                 option_param = cart_item.selectedOptions;
    //             } else if (Array.isArray(cart_item.options) && cart_item.options.length > 0) {
    //                 let type_id = cart_item.options[0].product_option_id;
    //                 let value_id = null;
    //                 if (Array.isArray(cart_item.options[0].product_option_value) &&
    //                     cart_item.options[0].product_option_value.length > 0) {
    //                     value_id = cart_item.options[0].product_option_value[0].product_option_value_id
    //                 }

    //                 if (type_id && value_id) {
    //                     option_param = {[type_id.toString()]: value_id}
    //                 }
    //             }
    //             option_param ? new_item["option"] = option_param : null;
    //             console.log('mapped item', new_item);
    //             return new_item
    //         });

    //         return data
    //     }
    //     return null
    // };

    parseCartData = () => {
        if (Array.isArray(this.props.cart) && this.props.cart.length > 0) {
          //Eg.Params
          //[{"product_id":217,"quantity":2,"option": { "344" :"255" } }]
          let cData = []
          this.props.cart.map(cart_item => {
            console.log('my cart item is',cart_item)
            let new_item = {
              product_id: cart_item.id,
              quantity: cart_item.quantity,
            };
        
    
            if(cart_item?.selectedColor){
              new_item[`option_id`] =cart_item?.selectedColor?.id ;
    
            }
            if(cart_item?.selectedSubOption){
              new_item[`option_id`] = cart_item?.selectedSubOption?.id;
            } 
    
            console.log('mapped item', new_item);
            cData.push(new_item)
            //return new_item;
          });
          console.log('cart data',cData)
    
          return cData;
        }
        return null;
      };

    resetToMain = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({routeName: Routes.MainRoute}),
        ]
    });

    validateForm = () => {
        console.log('validateForm');
        Keyboard.dismiss();

        let emailError, passerror, fullNameError, mobileNoError;
        let isValide = true;

        emailError = validation("email", this.state.email);
        fullNameError = validation("name", this.state.fullName);
        mobileNoError = validation("phoneNo", this.state.mobileNumber);

        if (!this.state.isSocialRegister) {
            passerror = validation("password", this.state.password);
        } else {
            passerror = null
        }

        if (emailError !== null ||
            passerror !== null ||
            fullNameError !== null ||
            mobileNoError !== null) {
            this.setState({
                emailError: emailError,
                passwordError: passerror,
                fullNameError: fullNameError,
                mobileNumberError: mobileNoError,
            });

            isValide = false;
        } else {
            this.setState({
                emailError: "",
                passwordError: "",
            });
            isValide = true;
        }

        console.log('isValide', isValide);
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
    showRegisterSuccessAlert = (response) => {
        setTimeout(() => {
            Alert.alert(
                "",
                this.props.localeStrings.thankYouRegister,
                [{
                    text: this.props.localeStrings.ok, onPress: () => {
                        if (response.data.user && response.data.user.telephone_status === "not_verified") {
                            this.props.navigation.navigate(Routes.VerifyCode, {
                                type: Constants.VerifyCodeType.MOBILE_NUMBER
                            })
                        } else {
                            this.props.navigation.dispatch(this.resetToMain);
                        }
                    }
                }],
                {
                    cancelable: false
                }
            )
        }, 200);
    };

    //Lifecycle methods
    constructor(props) {
        super(props);

        let isSocialRegister = this.props.navigation.getParam('socialRegister', false),
            providerData = null,
            userData = null;

        if (isSocialRegister) {
            providerData = this.props.navigation.getParam('providerData', null);
            userData = this.props.navigation.getParam('currentUser', null)
        }

        this.state = {
            isSocialRegister,
            providerData,
            fullName: userData ? userData.fullName : "",
            fullNameError: "",
            email: userData ? userData.email : "",
            emailError: "",
            password: "",
            passwordError: "",
            mobileNumber: "",
            mobileNumberError: "",
            countryCode: Constants.CountryCode,
            isLoaderVisible: false
        };

        this.fbPermissionData = null;
        this.fbAccessToken = null;
        this.currentProvider = null;
        this.fbData = null;
        this.googleData = null;
    }

    componentDidMount() {
        if (this.state.isSocialRegister) {
            setTimeout(() => {
                showInfoSnackBar(this.props.localeStrings.enterRemainingDetails)
            }, 500)
        }

        this.checkPermission()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        const topPadding = this.calculatePadding();
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: Color.WHITE}} forceInset={{top: 'never'}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <View style={CommonStyle.topAnimContainer}>
                    <TouchableOpacity
                        style={[CommonStyle.skipBtn, {top: topPadding}]}
                        onPress={this.onClickSkip}>
                        <Label color={Color.DARK_LIGHT_WHITE}>{this.props.localeStrings.skip}</Label>
                    </TouchableOpacity>
                    <View style={[CommonStyle.headerLogoContainer, {marginTop: 15 + this.calculatePadding()}]}>
                        <Image source={HEADER_LOGO}
                               resizeMode={'contain'}
                               style={CommonStyle.headerLogo}/>
                    </View>
                    <Label color={Color.WHITE}
                           large
                           mt={25}
                           mb={5}>{this.props.localeStrings.createAccount}</Label>
                    <Label color={Color.DARK_LIGHT_WHITE}
                           mb={5}>{this.props.localeStrings.justAStep}</Label>

                </View>
                <KeyboardAwareScrollView
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={true}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.container}>
                    <View style={CommonStyle.content_center}>
                        <View style={{width: ThemeUtils.relativeWidth(80)}}>
                            <FloatingInputText
                                editable={!(this.state.isSocialRegister && this.state.fullName)}
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
                                editable={!this.state.isSocialRegister}
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
                                    placeholder={this.props.localeStrings.mobileNumberPlaceholder}
                                    helpersNumberOfLines={2}
                                    error={this.state.mobileNumberError}
                                    onFocus={() => {
                                        this.setState({mobileNumberError: ""})
                                    }}
                                    onChangeText={(mobileNumber) => this.setState({mobileNumber})}/>
                            </View>
                            {this.state.isSocialRegister ?
                                null :
                                <PasswordInputText
                                    helpersNumberOfLines={2}
                                    icon={"password"}
                                    autoCapitalize={'none'}
                                    label={this.props.localeStrings.password}
                                    error={this.state.passwordError}
                                    onFocus={() => {
                                        this.setState({passwordError: ""})
                                    }}
                                    onChangeText={(password) => this.setState({password})}/>
                            }
                        </View>
                    </View>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10}}>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            mt={20}
                            mb={10}
                            border_radius={5}
                            btnPrimary
                            textColor={Color.WHITE}
                            click={this.onClickSignUpBtn}>
                            {this.props.localeStrings.signUp}
                        </RoundButton>
                        <Label
                            mt={10}
                            mb={20}
                            small
                            style={{alignSelf: 'center', textAlign: 'center'}}
                            color={Color.TEXT_SECONDARY}>
                            {this.props.localeStrings.signUpNoteOne}
                            <Label
                                style={CommonStyle.underlineLabel}
                                color={Color.TEXT_DARK}
                                small
                                onPress={this.openTermCondtionEvent}>
                                {this.props.localeStrings.termCondition}
                            </Label>
                            {this.props.localeStrings.signUpNoteTwo}
                            <Label
                                style={CommonStyle.underlineLabel}
                                color={Color.TEXT_DARK}
                                small
                                onPress={this.openPrivacyPolicyEvent}>
                                {this.props.localeStrings.policies}
                            </Label>
                        </Label>
                    </View>
                    <View style={CommonStyle.contentVerticalBottom}>
                        <View style={CommonStyle.bottomContainer}>
                            <Label color={Color.BLACK}>
                                {this.props.localeStrings.haveAccount}
                            </Label>
                            <Label color={Color.PRIMARY}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   ms={5}
                                   onPress={this.onClickSignIn}>
                                {this.props.localeStrings.signIn.toUpperCase()}
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
        setToken: (token) => dispatch(Action.setToken(token)),
        setFCMToken: (fcmToken) => dispatch(Action.setFCMToken(fcmToken))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        fcmToken: state.fcmToken,
        recentProducts: state.recentProducts,
        wishlist: state.wishlist,
        cart: state.cart,
        localeStrings: state.localeStrings,
        appConfig: state.appConfig,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp)

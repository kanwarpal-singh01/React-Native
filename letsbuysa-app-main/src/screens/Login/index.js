import React, {Component} from 'react';
import {
  View,
  ScrollView,
  Button,
  Keyboard,
  TouchableOpacity,
  Image,
} from 'react-native';

//Custom component
import {
  FloatingInputText,
  PasswordInputText,
  Label,
  RoundButton,
  SocialRoundButton,
} from 'src/component';

//Utility
import {
  Constants,
  Strings,
  ThemeUtils,
  Color,
  CommonStyle,
  UtilityManager,
  IS_IOS,
  IS_ANDROID,
  validation,
  showErrorSnackBar,
} from 'src/utils';
import {APIRequest, API_LOGIN, API_SOCIAL_LOGIN, ApiURL} from 'src/api';
import styles from './styles';
import Action from 'src/redux/action';
import Routes from 'src/router/routes';
//Third party

import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';
import {GoogleSignin} from 'react-native-google-signin';
import {connect} from 'react-redux';
import {NavigationActions, SafeAreaView, StackActions} from 'react-navigation';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import DeviceInfo from 'react-native-device-info';
import firebase from 'react-native-firebase';
//Apple Sign-in

import appleAuth, {
  AppleAuthCredentialState,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleButton,
} from '@invertase/react-native-apple-authentication';

//resources
import HEADER_LOGO from 'src/assets/images/header_logo.png';

class Login extends Component<Props> {
  //Server request
  loginRequest = () => {
    let params = {
      key: Constants.API_KEY,
      email: this.state.email,
      password: this.state.password,
      device_id: DeviceInfo.getUniqueID(),
      device_token: this.props.fcmToken,
      device_type: IS_IOS ? 'ios' : 'android',
    };

    let final_params = this.prepareParamsForSync(params);

    this.setState({isLoaderVisible: true}, () => {
      new APIRequest.Builder()
        .post()
        .setReqId(API_LOGIN)
        .reqURL(ApiURL.signIn)
        .formData(final_params)
        .response(this.onResponse)
        .error(this.onError)
        .build()
        .doRequest();
    });
  };

  socialLoginRequest = async () => {
    let param = {
      key: Constants.API_KEY,
      device_id: await DeviceInfo.getUniqueID(),
      device_token: this.props.fcmToken,
      device_type: IS_IOS ? 'ios' : 'android',
    };

    switch (this.currentProvider) {
      case Constants.SocialLoginProvider.FACEBOOK:
        param.provider = 'facebook';
        param.provider_id = this.fbData.id;
        param.access_token = this.fbAccessToken;
        break;
      case Constants.SocialLoginProvider.GOOGLE:
        let googleId;

        if (this.googleData.user) {
          googleId = this.googleData.user.id;
        } else {
          googleId = this.googleData.id;
        }
        param.provider = 'google';
        param.provider_id = googleId;
        param.access_token = this.googleData.idToken;
        param.full_name = this.googleData?.user?.name || ''
        param.email = this.googleData?.user?.email || ''

        break;
      case Constants.SocialLoginProvider.APPLE:
        param.provider = 'apple';
        param.provider_id = this.appleData.user;
        param.access_token = this.appleData.identityToken;
        param.full_name = this.appleData.fullName
          ? `${this.appleData.fullName.givenName} ${
              this.appleData.fullName.familyName
            }`
          : '';
        break;
    }

    this.socialParams = param
    let final_params = this.prepareParamsForSync(param);
    console.log('Final params==>', final_params);
    this.setState({isLoaderVisible: true}, () => {
      new APIRequest.Builder()
        .post()
        .setReqId(API_SOCIAL_LOGIN)
        .reqURL(ApiURL.socialLogin)
        .formData(final_params)
        .response(this.onResponse)
        .error(this.onError)
        .build()
        .doRequest();
    });
  };

  FBloginRequest = () => {
    LoginManager.logInWithPermissions(['public_profile', 'email'])
      .then(
        result => {
          console.log('FB Result ::', result);
          if (!result.isCancelled) {
            this.fbPermissionData = result;
            AccessToken.getCurrentAccessToken().then(data => {
              console.log('Token :', data.accessToken);
              this.fbAccessToken = data.accessToken;
              this.getFBUserInfoRequest();
            });
          }
        },
        error => {
          console.log('error', error);
          showErrorSnackBar(this.props.localeStrings.errorMessage);
        },
      )
      .catch(error => {
        console.log('catch error', error);
        showErrorSnackBar(this.props.localeStrings.errorMessage);
      });
  };

  getFBUserInfoRequest = () => {
    const infoRequest = new GraphRequest(
      '/me?locale=en_US&fields=first_name,last_name,email',
      null,
      (error = {}, result = {}) => {
        if (error) {
          console.log('FaceBook Error : ', error);
        } else {
          console.log('FB Login user :', result);
          this.currentProvider = Constants.SocialLoginProvider.FACEBOOK;
          this.fbData = result;
          this.socialLoginRequest();
        }
      },
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  };

  onResponse = (response, reqId) => {
      console.log('res is here',response)
    this.setState({isLoaderVisible: false});
    switch (reqId) {
      case API_LOGIN:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.user 
              // && response.data.token
              ) {
              this.props.setUser(response.data.user);
              // this.props.setToken(response.data.token);
              if (response.data.user.telephone_status === 'not_verified') {
                this.props.navigation.navigate(Routes.VerifyCode, {
                  type: Constants.VerifyCodeType.MOBILE_NUMBER,
                });
              } else {
                this.navigateBack();
              }
            }
            break;
        }
        break;
      case API_SOCIAL_LOGIN:
        switch (response.status) {

          case Constants.ResponseCode.OK:
            if (
              response.data &&
              response.data.user == ''
            //  response.data.user.register_type === 'unregister'
            ) {
              this.navigateToSocialRegister(response.data.user);
            } else if (
              response.data &&
              response.data.user 
              // && response.data.token
            ) {
              this.props.setUser(response.data.user);
              // this.props.setToken(response.data.token);
              if (response.data.user.telephone_status === 'not_verified') {
                this.props.navigation.navigate(Routes.VerifyCode, {
                  type: Constants.VerifyCodeType.MOBILE_NUMBER,
                });
              } else {
                this.navigateBack();
              }
            }
            break;
        }
        break;
    }
  };

  onError = (error, reqId) => {
    console.log('error', error);
    this.setState({isLoaderVisible: false});
    switch (reqId) {
      case API_LOGIN:
        if (error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
      case API_SOCIAL_LOGIN:
        if (error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
    }
  };

  //User interaction
  btnGoogleLoginClick = async () => {
    try {
      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      this.currentProvider = Constants.SocialLoginProvider.GOOGLE;
      this.googleData = userInfo;
      console.log('Google Login user :', this.googleData);
      this.socialLoginRequest();
    } catch (error) {
      console.log('Google sign in Error ::', error);
      // showErrorSnackBar(this.props.localeStrings.errorMessage)
    }
  };

  btnFBLoginClick = () => {
    LoginManager.logOut();
    this.FBloginRequest();
  };

  onClickLogin = () => {
    Keyboard.dismiss();
    if (this.validateForm()) {
      this.loginRequest();
    }
  };

  onClickForgotPassword = () => {
    this.props.navigation.navigate(Routes.ForgotPassword);
  };

  onClickSignUp = () => {
    this.props.navigation.navigate(Routes.SignUp);
  };

  onClickSkip = () => {
    this.navigateBack();
  };

  // Utility Method
  async getToken() {
    let fcmToken = this.props.fcmToken;
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        this.props.setFCMToken(fcmToken);
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

  navigateToSocialRegister = response_user => {
    console.log('mySocialParams',this.socialParams)
    let param = {},
      userData = {};
    switch (this.socialParams.provider) {
      case 'facebook':
        param.provider = 'facebook';
        param.provider_id = this.socialParams.provider_id;
        param.access_token = this.fbAccessToken;
        break;
      case 'google':
        param.provider = 'google';
        param.provider_id = this.socialParams.provider_id;
        param.access_token = this.googleData.idToken;
        break;
      case 'apple':
        param.provider = 'apple';
        param.provider_id = this.socialParams.provider_id;
        param.access_token = this.appleData.identityToken;
        break;
    }

    userData.email = this.socialParams.email ? this.socialParams.email : '';
    userData.fullName = this.socialParams.full_name ? this.socialParams.full_name : '';
    console.log('Nav params==>', param);
    this.props.navigation.navigate(Routes.SignUp, {
      providerData: param,
      currentUser: userData,
      socialRegister: true,
    });
  };

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

  resetToMain = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: Routes.MainRoute})],
  });

  navigateBack = () => {
    let fromRoute = this.props.navigation.getParam('fromRoute', null);
    if (fromRoute) {
      this.props.navigation.navigate(fromRoute);
    } else {
      this.props.navigation.dispatch(this.resetToMain);
    }
  };

  validateForm = () => {
    let emailError, passerror;
    let isValide = true;

    emailError = validation('email', this.state.email);
    passerror = validation('passwordBlank', this.state.password);

    if (emailError !== null || passerror !== null) {
      this.setState({
        emailError: emailError,
        passwordError: passerror,
      });
      isValide = false;
    } else {
      this.setState({
        emailError: '',
        passwordError: '',
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
        return min + 10;
      }
    }
  };

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

  btnAppleLoginClick = async () => {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: AppleAuthRequestOperation.LOGIN,
      requestedScopes: [
        AppleAuthRequestScope.EMAIL,
        AppleAuthRequestScope.FULL_NAME,
      ],
    });
    console.log('Apple data here==>', appleAuthRequestResponse);
    this.currentProvider = Constants.SocialLoginProvider.APPLE;
    this.appleData = appleAuthRequestResponse;
    this.socialLoginRequest();
  };

  //lifecycle events

  constructor(props) {
    super(props);
    this.state = {
      fbLoginData: null,
      googleLoginData: null,
      email: '',
      emailError: '',
      password: '',
      passwordError: '',
      isLoaderVisible: false,

    };
    this.fbPermissionData = null;
    this.fbAccessToken = null;
    this.currentProvider = null;
    this.fbData = null;
    this.googleData = null;
    this.socialParams = null


    GoogleSignin.configure({
      webClientId: Constants.GoogleProd.webClientId,
    });
    GoogleSignin.signOut();
  }

  componentDidMount() {
    this.checkPermission();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    const topPadding = this.calculatePadding();
    return (
      <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
        <Spinner visible={this.state.isLoaderVisible} />
        <View style={CommonStyle.topAnimContainer}>
          <TouchableOpacity
            style={[CommonStyle.skipBtn, {top: topPadding}]}
            onPress={this.onClickSkip}>
            <Label color={Color.DARK_LIGHT_WHITE}>
              {this.props.localeStrings.skip}
            </Label>
          </TouchableOpacity>
          <View
            style={[
              CommonStyle.headerLogoContainer,
              {marginTop: 15 + this.calculatePadding()},
            ]}>
            <Image
              source={HEADER_LOGO}
              resizeMode={'contain'}
              style={CommonStyle.headerLogo}
            />
          </View>
          <Label color={Color.WHITE} large mt={25} mb={5}>
            {this.props.localeStrings.welcomeBack}
          </Label>
          <Label color={Color.DARK_LIGHT_WHITE} mb={5}>
            {this.props.localeStrings.signInContinue}
          </Label>
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
                icon={'mail'}
                autoCapitalize={'none'}
                label={this.props.localeStrings.email}
                value={this.state.email}
                keyboardType={'email-address'}
                error={this.state.emailError}
                onFocus={() => {
                  this.setState({emailError: ''});
                }}
                onChangeText={email => this.setState({email})}
              />
              <PasswordInputText
                icon={'password'}
                helpersNumberOfLines={2}
                autoCapitalize={'none'}
                label={this.props.localeStrings.password}
                error={this.state.passwordError}
                onFocus={() => {
                  this.setState({passwordError: ''});
                }}
                onChangeText={password => this.setState({password})}
              />
              <Label
                style={styles.forgotPassword}
                color={Color.PRIMARY}
                mt={5}
                onPress={this.onClickForgotPassword}
                small>
                {this.props.localeStrings.forgotPassword}
              </Label>
            </View>
          </View>
          <View style={{flex: 1, alignItems: 'center', marginTop: 10}}>
            <RoundButton
              width={ThemeUtils.relativeWidth(80)}
              backgroundColor={Color.PRIMARY}
              mt={20}
              mb={20}
              border_radius={5}
              btnPrimary
              textColor={Color.WHITE}
              click={this.onClickLogin}>
              {this.props.localeStrings.signIn}
            </RoundButton>
            {/* <Label
              small
              mt={10}
              large
              style={{alignSelf: 'center'}}
              color={Color.BLACK}>
              {this.props.localeStrings.signInWith}
            </Label>
            <View style={styles.socialButtonContainer}>
              <SocialRoundButton
                type={'google'}
                onPress={this.btnGoogleLoginClick}
              />
              <SocialRoundButton
                ml={20}
                type={'facebook'}
                onPress={this.btnFBLoginClick}
              />
            </View>
            {!IS_ANDROID && appleAuth.isSupported && (
              <AppleButton
                style={{
                  height: ThemeUtils.relativeHeight(6),
                  width: ThemeUtils.relativeWidth(45),
                  marginBottom: ThemeUtils.relativeHeight(3),
                }}
                buttonStyle={AppleButton.Style.WHITE_OUTLINE}
                buttonType={AppleButton.Type.SIGN_IN}
                onPress={() => {
                  this.btnAppleLoginClick();
                }}
              />
            )} */}
            <View style={CommonStyle.bottomContainer}>
              <Label color={Color.BLACK}>
                {this.props.localeStrings.noHaveAccount}
              </Label>
              <Label
                color={Color.PRIMARY}
                nunito_bold
                bolder={IS_IOS}
                ms={5}
                onPress={this.onClickSignUp}>
                {this.props.localeStrings.signUp.toUpperCase()}
              </Label>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    setUser: user => dispatch(Action.setUser(user)),
    setToken: token => dispatch(Action.setToken(token)),
    setFCMToken: fcmToken => dispatch(Action.setFCMToken(fcmToken)),
  };
};

const mapStateToProps = state => {
  if (state === undefined) {
    return {};
  }
  return {
    user: state.user,
    fcmToken: state.fcmToken,
    recentProducts: state.recentProducts,
    wishlist: state.wishlist,
    cart: state.cart,
    localeStrings: state.localeStrings,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);

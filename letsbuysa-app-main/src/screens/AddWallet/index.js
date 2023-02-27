import React, {Component} from 'react';
import {
  View,
  I18nManager,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  TextInput,
  Keyboard,
  Alert,
  NativeModules
} from 'react-native';

//Third party
import {connect} from 'react-redux';
import {NavigationEvents, SafeAreaView} from 'react-navigation';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import {Modalize} from 'react-native-modalize';
import PaymentWebView from 'src/screens/PaymentWebView';
// import {PaymentRequest} from 'react-native-payments'

const VISA_LOGO = require('src/assets/images/logo_assets/visa_logo.png');
const MASTER_LOGO = require('src/assets/images/logo_assets/mastercard_logo.png');
const MADA_LOGO = require('src/assets/images/logo_assets/mada_logo.png');
const COD_LOGO = require('src/assets/images/logo_assets/cod.png');
const COD_NEW_LOGO = require('src/assets/images/logo_assets/cod_new.png');
const SADAD_LOGO = require('src/assets/images/logo_assets/sadad_logo.png');
const APPLE_PAY = require('src/assets/images/logo_assets/applePay.png');
const HyperPayModule = NativeModules.HyperPayModule;

//Custom component
import {
  Label,
  Hr,
  CustomNavigationHeader,
  RadioComponent,
  RoundButton,
} from 'src/component';

//Utility
import Action from 'src/redux/action';
import {API_GET_NOTIFICATIONS, APIRequest, ApiURL,} from 'src/api';
import styles from './styles';
import {
  CommonStyle,
  Color,
  ThemeUtils,
  Constants,
  Icon,
  decodeImageUrl,
  Strings,
  DateUtils,
  showSuccessSnackBar,
  showErrorSnackBar
} from 'src/utils';
import Routes from 'src/router/routes';
import {
  API_Wallet_Recharge_Callback_STATUS,
  API_Wallet_Recharge_STATUS,
  API_Wallet_Apple_STATUS,
  API_Wellet_CheckOutID_Apple_Pay
} from '../../api';




const {height} = Dimensions.get('window');

class AddWallet extends Component {
  //Server request
  addWellet = () => {
    this.setState({
      isLoaderVisible: true,
      errMessage: this.props.localeStrings.pleaseWait,
    });

    let params = {
      user_id: this.props.user.customer_id,
      // type: this.state.selectedPaymentId,
      amount: this.state.amount,
    };

    if (this.state.selectedPaymentId == 'tap-card') {
      params['type'] = 2;
    }
    else{
      params['type'] = 4;
    }
  

    new APIRequest.Builder()
      .post()
      .setReqId(API_Wallet_Recharge_STATUS)
      .reqURL(ApiURL.walletCheckOut ) //ApiURL.walletRecharg
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  paymentStatusRequest = () => {
    this.setState({
      isLoaderVisible: true,
    });
    let params = {
      charge_id: this.state.paymentRefID,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_Wallet_Recharge_Callback_STATUS)
      .reqURL(ApiURL.walletRechargeCallBack)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  confirmApplePayment = async(url) => {
   await this.setState({
      isLoaderVisible: true,
    });
    // const myArray = url.split("&");
    // const fistStr = myArray[0].split("=")[1]

    let params = {
      user_id: this.props.user.customer_id,
      id:url,
      amount:this.state.amount
    };

    await new APIRequest.Builder()
      .post()
      .setReqId(API_Wallet_Apple_STATUS)
      .reqURL(ApiURL.walletApple)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  applePayCheckOutID = () => {
    this.setState({
      isLoaderVisible: true,
    });
  let params = {
      user_id: this.props.user.customer_id,
      amount: this.state.amount,
  };


  new APIRequest.Builder()
    .post()
    .setReqId(API_Wellet_CheckOutID_Apple_Pay)
    .reqURL(ApiURL.checkWelletOutIDApplePay)
    .formData(params)
    .response(this.onResponse)
    .error(this.onError)
    .build()
    .doRequest();
};

  onResponse = (response, reqId) => {

    this.setState({
      isLoaderVisible: false,
    });

    switch (reqId) {
      case API_Wallet_Recharge_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response?.data?.url) {
              this.setState({
                paymentModalVisible: true,
                paymentHref: response?.data?.url,
              });
            }
            break;
          }
          break;
      case API_Wallet_Recharge_Callback_STATUS:
            switch (response.status) {
              case Constants.ResponseCode.OK:
                if (response.data.success) {
                  showSuccessSnackBar(response.data.success.message);
                  this.props.navigation.navigate(Routes.Wallet);
                }
                break;
            }
            break;
      case API_Wallet_Apple_STATUS:

            switch (response.status) {
              case Constants.ResponseCode.OK:
                if (response.data.success) {
                  showSuccessSnackBar(response.data.success.message);
                  this.props.navigation.navigate(Routes.Wallet);
                }
                else{
                  showErrorSnackBar(response.data.error.message);
                }
                break;
            }
            break;

        case API_Wellet_CheckOutID_Apple_Pay:

              switch (response.status) {
                case Constants.ResponseCode.OK:
                  if (response.data.checkout_id) {
                    this.requestHyperPay(response?.data?.checkout_id)
                  }
                  break;
              }
              break;

              
    } 
    
  };

  onError = (error, reqId) => {
    this.setState({
      isLoaderVisible: false,
    });
    switch (reqId) {
      case API_GET_NOTIFICATIONS:
        if (this.state.page !== 1) {
          this.setState({
            page: 0,
          });
        }
        this.setState({
          notifications: [],
          errMessage: this.props.localeStrings.noNotifications,
        });
        break;

        case API_Wallet_Apple_STATUS:
          if (error && error?.message) {
            setTimeout(() => {
              Alert.alert('', error?.message, [
                {
                  text: this.props.localeStrings.ok,
                  onPress: () => {},
                },
              ]);
            }, 250);
          }
          break;
    }
  };
  // Action
  openModel = () => {
    this.modalizeRef?.open();
  };
  closeModel = () => {
    this.modalizeRef?.close();
  };

  requestHyperPay(checkOutId) {
    console.log('response okay 1',checkOutId)

    setTimeout(() => {
      HyperPayModule.openHyperPay(checkOutId,this.state.amount,"Add Wallet", (response) => {
      setTimeout(() => {
        console.log('payment response is',response);
        // this.confirmApplePayment(response?.url);
        this.confirmApplePayment(response?.url ? response?.url : response?.responeDic );

      }, 500);
     }, (error) => {
      setTimeout(() => {
 
        showErrorSnackBar(`Payment failed ! ${error}`)

    }, 500)
    })
    }, 800);

  
  }



  onclickSelect = () => {
    console.log('selected Method Id',this.state.selectedPaymentId)
    this.closeModel();
    if(this.state.selectedPaymentId == 'applePay'){
     this.paymentRequest()
    }
    else{
      this.addWellet();
    }
   
  };

  addTapped = () => {
    Keyboard.dismiss();
    this.openModel();
  };

  //Utility

  paymentRequest =  ()=>{
    console.log('bjhv')
    this.applePayCheckOutID()
  }

  handleResult(error, status) {
    console.log('error is ', error);
    console.log('status is ', status);

    var myString = JSON.stringify(status);
    console.log('status is ' + status?.sdk_result);
    console.log(myString);
    var resultStr = String(status?.sdk_result);
    switch (resultStr) {
      case 'SUCCESS':
        this.handleSDKResult(status)
        break
      case 'FAILED':
        this.handleSDKResult(status)
        break
      case "SDK_ERROR":
        console.log('sdk error............');
        console.log(status['sdk_error_code']);
        console.log(status['sdk_error_message']);
        console.log(status['sdk_error_description']);
        console.log('sdk error............');
        break
      case "NOT_IMPLEMENTED":
        break
    }
  }
  
  handleSDKResult(result) {
    console.log('trx_mode::::');
    console.log(result['trx_mode'])
    switch (result['trx_mode']) {
      case "CHARGE":
        console.log('Charge');
        console.log(result);
        this.printSDKResult(result);
        break;

      case "AUTHORIZE":
        this.printSDKResult(result);
        break;

      case "SAVE_CARD":
        this.printSDKResult(result);
        break;

      case "TOKENIZE":
        Object.keys(result).map((key) => {
          console.log(`TOKENIZE \t${key}:\t\t\t${result[key]}`);
        })

        // responseID = tapSDKResult['token'];
        break;
    }
  }




  getPaymentIcon = method_id => {
    switch (method_id) {
      case 'cod':
        return (
          <Image
            source={COD_NEW_LOGO}
            style={{width: 30, height: 30}}
            resizeMode={'contain'}
          />
        );

      case 'bank_transfer':
        return (
          <Icon name={'bank_transfer'} size={20} color={Color.TEXT_DARK} />
        );

      case 'tap-card':
        return (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={VISA_LOGO}
              style={{width: 35, height: (35 * 21) / 62}}
            />
            <Image
              source={MASTER_LOGO}
              style={{width: 40, height: (40 * 132) / 198}}
            />
          </View>
        );
      case 'tap-mada':
        return (
          <Image
            source={MADA_LOGO}
            style={{width: 40, height: (40 * 65) / 199}}
            resizeMode={'contain'}
          />
        );

      case 'paytabs':
        return (
          <Image
            source={VISA_LOGO}
            style={{width: 20, aspectRatio: 2}}
            resizeMode={'contain'}
          />
        );

        case 'applePay':
        return (
          <Image
            source={APPLE_PAY}
            style={{width: 40, aspectRatio: 2}}
            resizeMode={'contain'}
          />
        );

      case 'sadad':
        return (
          <Image
            source={SADAD_LOGO}
            style={{width: 20, aspectRatio: 2.5}}
            resizeMode={'contain'}
          />
        );
      default:
        return (
          <Icon name={'bank_transfer'} size={20} color={Color.TEXT_DARK} />
        );
    }
  };

  onChangeNumber = number => {
    if (parseFloat(number) > 0) {
      this.setState({enableBtn: true, amount: number});
    } else {
      this.setState({enableBtn: false, amount: 0});
    }
  };
  parseAPIData = data => {
    let exists = false;
    if (Array.isArray(data) && data.length > 0) {
      exists = true;
    } else if (!Array.isArray(data) && data !== null && data !== undefined) {
      exists = true;
    }
    return exists;
  };

  onSelectPayment = (index, value) => {
    this.setState({enableBtn: true});
    console.log('selected Method Id',index, value)

    if (value && value !== this.state.selectedPaymentId) {
      switch (value) {
        case 'paytabs':
          Alert.alert(
            this.props.localeStrings.information,
            this.props.localeStrings.cardPaymentError,
            [
              {
                text: this.props.localeStrings.ok,
                onPress: () => {},
              },
            ],
          );
          break;

        case 'bank_transfer':
          Alert.alert(
            this.props.localeStrings.information,
            this.props.localeStrings.bankTransferInfo,
            [
              {
                text: this.props.localeStrings.ok,
                onPress: () => {
                  this.setState(
                    {
                      selectedPaymentId: value,
                    },
                    () => {
                      setTimeout(() => {
                        //    this.checkoutCartRequest()
                      }, 500);
                    },
                  );
                },
              },
              {
                cancelable: false,
              },
            ],
          );
          break;
        default:
          console.log('default call')
          this.setState(
            {
              selectedPaymentId: value,
            },
            () => {
            },
          );
          break;
      }
    }
  };

  onPaymentModalClose = refID => {
    console.log('payment refid', refID);
    this.setState(
      {
        paymentModalVisible: false,
        paymentRefID: refID,
      },
      () => {
        if (refID) {
          setTimeout(() => {
            this.paymentStatusRequest();
          }, 250);
        }
      },
    );
  };

  //UI methods

  renderPaymentOptions = () => {
    let options = [];

    for (let aMethod in this.state.paymentMethods) {
      let method = this.state.paymentMethods[aMethod];
      let methodTitle =
        /* this.props.langCode === Constants.API_LANGUAGES.EN ?
             this.paymentStaticTypes[method_id].name :
             this.paymentStaticTypes[method_id].name_ar;*/
        this.props.localeStrings[method.code]
          ? this.props.localeStrings[method.code]
          : Strings[method.code];

      options.push(
        <RadioComponent.RadioButton
          style={{
            marginVertical: 5,
            alignItems: 'center',
          }}
          value={method.code}
          key={`${method.code}`}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingLeft: 5,
            }}>
            <Label xsmall color={Color.TEXT_GRAY} opensans_semibold bold>
              {methodTitle}
            </Label>
            {this.getPaymentIcon(method.code)}
          </View>
          {method.code === 'bank_transfer' &&
          this.state.selectedPaymentId === 'bank_transfer' ? (
            <View style={{marginVertical: 10}}>
              <AutoHeightWebView
                style={{width: ThemeUtils.relativeWidth(80)}}
                source={{
                  html: `<html><meta name="viewport" content="width=device-width, initial-scale=1.0">${
                    method.bank_transfer
                  }</html>`,
                }}
                zoomable={false}
              />
            </View>
          ) : null}
          {method.code === 'cod' && this.state.selectedPaymentId === 'cod' ? (
            <Label color={Color.TEXT_LIGHT} small mt={10}>
              {method.title}
            </Label>
          ) : null}
        </RadioComponent.RadioButton>,
      );
    }
    return options;
  };

  renderModelView = () => {
    return (
      <View style={styles.modelContainer}>
        <View
          style={[
            {backgroundColor: Color.WHITE, width: ThemeUtils.relativeWidth(90)},
          ]}>
          {/* <Label color={Color.TEXT_DARK} small mt={5} style={{}}>
            {'Choose Payment Method'}
          </Label> */}

          <View style={styles.sectionBlock}>
            <Label
              opensans_bold
              bolder
              small
              singleLine
              color={Color.TEXT_GRAY}>
              {this.props.localeStrings.paymentMethodTitle}
            </Label>
            {this.parseAPIData(this.state.paymentMethods) ? (
              <RadioComponent.RadioGroup
                onSelect={this.onSelectPayment}
                showSeparator={true}
                thickness={2}
                separatorStyle={{
                  height: 1,
                  backgroundColor: Color.LIGHT_GRAY,
                }}
                color={Color.PRIMARY}
                style={{
                  borderWidth: 1,
                  borderRadius: 5,
                  marginVertical: 10,
                  borderColor: Color.LIGHT_GRAY,
                }}>
                {this.renderPaymentOptions()}
              </RadioComponent.RadioGroup>
            ) : null}
          </View>

          <View style={styles.selectButtonView}>
            <RoundButton
              width={ThemeUtils.relativeWidth(90)}
              backgroundColor={Color.PRIMARY}
              mt={20}
              mb={10}
              border_radius={5}
              btnPrimary
              textColor={Color.WHITE}
              click={this.onclickSelect}>
              {this.props?.localeStrings?.pay}
            </RoundButton>
          </View>
        </View>
      </View>
    );
  };

  //Lifecycle methods
  static navigationOptions = ({navigation, navigationOptions}) => {
    let {state} = navigation;

    let title = navigation.getParam('title', 'Add Funds');

    return {
      title: title ,
      header: props => (
        <CustomNavigationHeader
          {...props}
          showRightButton={false}
          isMainTitle={false}
        />
      ),
    };
  };

  constructor(props) {
    super(props);
    this.modalizeRef = null;
    let payment_Methods = this.props.navigation.getParam('payment_method', []);

  //  if(payment_Methods?.length> 0 && Platform.OS == 'ios'){
    if(payment_Methods?.length> 0 && Platform.OS == 'ios' && this.props.appConfig?.applepay === 1){

    payment_Methods.push({code: "applePay", title: `<img src="https://www.gotapnow.com/web/tap.png" />`})
   } 

    this.state = {
      balence: 0,
      paymentMethods: payment_Methods,
      amount: 0,
      selectedMethodId: 0,
      selectedMethodIndex: 0,
      enableBtn: false,
      paymentHref: '',
      paymentModalVisible: false,
      paymentRefID: '',
    };
  }

  componentDidMount() {
    // this.getWalletBalance();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    return (
      <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
        <Spinner visible={this.state.isLoaderVisible} />
        <PaymentWebView
          isOpen={this.state.paymentModalVisible}
          href={this.state.paymentHref}
          onClose={this.onPaymentModalClose}
        />
        
        <View style={styles.container}>
          <View style={styles.walletContainer}>
            <Label color={Color.TEXT_LIGHT} large opensans_bold style={{}}>
              {'SR'}
            </Label>
            <TextInput
              style={styles.input}
              onChangeText={this.onChangeNumber}
              value={this.state.amount}
              placeholder="0"
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={7}
            />
          </View>
          <View style={styles.selectButtonView}>
            <RoundButton
              width={ThemeUtils.relativeWidth(90)}
              backgroundColor={Color.PRIMARY}
              mt={20}
              mb={10}
              border_radius={5}
              btnPrimary
              backgroundColor={
                this.state.enableBtn ? Color.PRIMARY : Color.GRAY
              }
              disabled={!this.state.enableBtn}
              textColor={Color.WHITE}
              click={this.addTapped}>
              {this.props?.localeStrings?.add}
            </RoundButton>
          </View>
          <Modalize
            ref={model => (this.modalizeRef = model)}
            modalHeight={height * 0.4}
            modalStyle={styles.modelView}>
            {this.renderModelView()}
          </Modalize>
        </View>
      </SafeAreaView>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {};
};

const mapStateToProps = state => {
  if (state === undefined) return {};
  return {
    user: state.user,
    localeStrings: state.localeStrings,
    appConfig: state.appConfig,

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddWallet);

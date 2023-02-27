import React, {Component} from 'react';
import {
  Alert,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  I18nManager,
  PanResponder,
  BackHandler,
  Text,
  NativeModules,
} from 'react-native';

const {CalendarModule} = NativeModules;

//Third party
import {connect} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  NavigationActions,
  NavigationEvents,
  SafeAreaView,
  StackActions,
} from 'react-navigation';
import Spinner from 'react-native-loading-spinner-overlay';
import AutoHeightWebView from 'react-native-autoheight-webview';
import StepIndicator from 'react-native-step-indicator';
import LinearGradient from 'react-native-linear-gradient';
// import {PaymentRequest} from 'react-native-payments'

//Custom component
import {
  Label,
  CustomNavigationHeader,
  RoundButton,
  RadioComponent,
  Hr,
} from 'src/component';

//Utility
import {
  API_CHECKOUT_CART,
  API_APPLY_COUPON_CODE,
  API_APPLY_GIFT_CODE,
  API_PAYMENT_STATUS,
  APIRequest,
  ApiURL,
  API_Remove_coupen_STATUS,
  API_CheckOut_Product_Check_STATUS,
  API_CheckOut_Apple_Pay_STATUS,
  API_CheckOutID_Apple_Pay
} from 'src/api';
import styles from './styles';
import {
  Color,
  Icon,
  Strings,
  ThemeUtils,
  Constants,
  CommonStyle,
  IS_IOS,
  showErrorSnackBar,
  showSuccessSnackBar,
  AdjustAnalyticsService,
  numberWithCommas,
} from 'src/utils';
import Routes from 'src/router/routes';
import PaymentWebView from 'src/screens/PaymentWebView';
import {Platform} from 'react-native';
import {API_Move_checkout_STATUS, API_Remove_checkout_STATUS} from '../../api';

const VISA_LOGO = require('src/assets/images/logo_assets/visa_logo.png');
const MASTER_LOGO = require('src/assets/images/logo_assets/mastercard_logo.png');
const MADA_LOGO = require('src/assets/images/logo_assets/mada_logo.png');
const COD_LOGO = require('src/assets/images/logo_assets/cod.png');
const COD_NEW_LOGO = require('src/assets/images/logo_assets/cod_new.png');
const SADAD_LOGO = require('src/assets/images/logo_assets/sadad_logo.png');
const APPLE_PAY = require('src/assets/images/logo_assets/applePay.png');

let steps = [];
const customStyles = {
  stepIndicatorSize: 33,
  currentStepIndicatorSize: 33,
  separatorStrokeWidth: 3,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: Color.PRIMARY_LIGHT,
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: Color.PRIMARY_LIGHT,
  stepStrokeUnFinishedColor: '#aaaaaa',
  separatorFinishedColor: Color.PRIMARY,
  separatorUnFinishedColor: '#aaaaaa',
  stepIndicatorFinishedColor: Color.PRIMARY,
  stepIndicatorUnFinishedColor: '#50525F',
  stepIndicatorCurrentColor: Color.PRIMARY,
  stepIndicatorLabelFontSize: 13,
  currentStepIndicatorLabelFontSize: 13,
  stepIndicatorLabelCurrentColor: Color.WHITE,
  stepIndicatorLabelFinishedColor: '#ffffff',
  stepIndicatorLabelUnFinishedColor: '#aaaaaa',
  labelColor: '#50525F',
  labelSize: 12,
  currentStepLabelColor: Color.PRIMARY,
  labelFontFamily: Constants.FontStyle.regular,
};


const HyperPayModule = NativeModules.HyperPayModule;

class Checkout extends Component {
  onPageChange(position) {
    this.setState({currentPosition: position});
  }

  //Server request
  checkoutCartRequest = (confirmed = false) => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
    };

   

    let priceTotal = this.state.ordertotal;

    if (priceTotal) {
      console.log(priceTotal);
      priceTotal = priceTotal.replace(/,/g, '');
    }

    let formData = {
      amount: priceTotal,
      user_id: this.props.user.customer_id,
      customer_id: this.props.user.customer_id,

    };
    if (this.state.selectedAddressId) {
      formData['address_id'] = this.state.selectedAddressId;
    }

    console.log('isWallet',this.state.welletSelected)
    if (this.state.welletSelected) {
      formData['wallet'] = this.state.wellet;
      console.log('isWallet amount',this.state.wellet)
      console.log('isWallet ordertotal',this.state.ordertotal)


      if (this.state.wellet >= this.state.ordertotal) {
        formData['payment_method'] = 'wallet';
        // formData['type'] = 4;
      }
    }
    if (this.state.selectedPaymentId) {
      formData['payment_method'] = this.state.selectedPaymentId;
    }
    if (this.state.selectedShippingId) {
      formData['shipping_method'] = this.state.selectedShippingId;
    }
    formData['order_confirm'] = confirmed ? 1 : 0;
    if (this.state.couponCode && this.state.couponCodeApplied) {
      formData['coupon'] = this.state.couponCode;
    }
    if (this.state.giftCode && this.state.giftCodeApplied) {
      formData['voucher'] = this.state.giftCode;
    }
    formData['order_confirm'] = confirmed ? 1 : 0;

    // tap-card
    // tap-mada
    if (this.state.selectedPaymentId == 'tap-card') {
      formData['type'] = 2;
    } else if (this.state.selectedPaymentId == 'cod'){
      // formData['type'] = 1;
      // if (this.state.selectedPaymentId) {
        formData['payment_method'] = this.state.selectedPaymentId;
      // }
    }
    else if (this.state.selectedPaymentId == 'tap-mada'){
      formData['type'] = 4;
    }
    else if (this.state.selectedPaymentId == 'bank_transfer'){
      // formData['type'] = 5;
      formData['payment_method'] = this.state.selectedPaymentId;

    }
    // else{
    //   formData['type'] = 6;
    // }
    // formData['address_id'] = this.state.selectedAddressId;
    // console.log(params)
    console.log(formData);

    if (confirmed) {
      new APIRequest.Builder()
        .post()
        .setReqId(API_CHECKOUT_CART)
        .reqURL(this.state.selectedPaymentId == 'cod' || this.state.selectedPaymentId == 'bank_transfer' || formData['payment_method'] == 'wallet' ? ApiURL.checkoutCart :ApiURL.checkoutNew)
        .formData(formData)
        .response(this.state.selectedPaymentId == 'cod' || this.state.selectedPaymentId == 'bank_transfer' || formData['payment_method'] == 'wallet' ? this.onResponse :this.onHyperPayRes)
        .error(this.onError)
        .build()
        .doRequest();
    } else {
      new APIRequest.Builder()
        .post()
        .setReqId(API_CHECKOUT_CART)
        .reqURL(ApiURL.checkoutCart)
        .formData(formData)
        .response(this.onResponse)
        .error(this.onError)
        .build()
        .doRequest();
    }
  };

  onHyperPayRes = res => {
    console.log(res);
    this.setState({
      isLoaderVisible: false,
    });
    if (res.status == 200) {
      this.setState({
        paymentModalVisible: true,
        paymentHref: res.data.url,
      });
    } else {
      showSuccessSnackBar(res.data.message);
    }
  };

  applyCouponRequest = () => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
      coupon: this.state.couponCode,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_APPLY_COUPON_CODE)
      .reqURL(ApiURL.applyCoupon)
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
        amount: this.state.ordertotal,
    };
    if (this.state.selectedAddressId) {
      params['address_id'] = this.state.selectedAddressId;
    }

    new APIRequest.Builder()
      .post()
      .setReqId(API_CheckOutID_Apple_Pay)
      .reqURL(ApiURL.checkOutIDApplePay)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  checkProductAvailable = () => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_CheckOut_Product_Check_STATUS)
      .reqURL(ApiURL.productCheck)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  checkOutApplePay = url => {
    this.setState({
      isLoaderVisible: true,
    });
    // const myArray = url?.split("&");
    // const fistStr = myArray[0].split("=")[1]

    let params = {
      user_id: this.props.user.customer_id,
      id:url
    };
    if (this.state.selectedAddressId) {
      params['address'] = this.state.selectedAddressId;
    }

    new APIRequest.Builder()
      .post()
      .setReqId(API_CheckOut_Apple_Pay_STATUS)
      .reqURL(ApiURL.checkOutApplePay)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  removeCouponRequest = () => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_Remove_coupen_STATUS)
      .reqURL(ApiURL.removeCoupen)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  removeItemRequest = item => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
      product_id: item?.product_id,
    };
    if (item.option_id) {
      params['option_id'] = item.option_id;
    }

    new APIRequest.Builder()
      .post()
      .setReqId(API_Remove_checkout_STATUS)
      .reqURL(ApiURL.removeProductCheckOut)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };
  moveItemRequest = item => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
      product_id: item.product_id,
    };
    if (item.option_id) {
      params['option_id'] = item.option_id;
    }

    new APIRequest.Builder()
      .post()
      .setReqId(API_Move_checkout_STATUS)
      .reqURL(ApiURL.moveProductCheckout)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  applyGiftCodeRequest = () => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
      voucher: this.state.giftCode,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_APPLY_GIFT_CODE)
      .reqURL(ApiURL.applyGiftCode)
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
      .setReqId(API_PAYMENT_STATUS)
      .reqURL(ApiURL.getPaymentStatus)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  onResponse = (response, reqId) => {
    console.log('my request id',reqId)
    this.setState({
      isLoaderVisible: false,
    });
    switch (reqId) {
      case API_CHECKOUT_CART:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            console.log('my checkOut response',response)
            if (response.data) {
              if (response.data.success) {
                if (response?.data?.success && response.data?.success?.url) {
                  this.setState({
                    paymentModalVisible: true,
                    paymentHref: response.data.success.url,
                  });
                } else {
                  this.setState(
                    {
                      currentPosition: 2,
                      successData: response.data,
                    },
                    () => {
                      showSuccessSnackBar(response.data.success.message);
                      // successData()
                    },
                  );
                  this.addRevenueEvent();

                  //  this.redirectBack()
                }
              } else {
                let {
                  products = [],
                  addresses = [],
                  shipping_method = null,
                  payment_method = [],
                  totals = null,
                  coupon = null,
                  voucher = null,
                  mywallet = 0,
                  ordertotal = 0,
                  product_path = '',
                  confirm_order = false,
                } = response.data;

                console.log('my aoo config is',this.props.appConfig)
                if (
                  Platform.OS == 'ios' &&
                  this.props.appConfig?.applepay === 1
                ) {
                  payment_method.push({
                    code: 'applePay',
                    title: `<img src="https://www.gotapnow.com/web/tap.png" />`,
                  });
                }

                this.setState(
                  {
                    userAddresses: addresses,
                    selectedAddressId:
                      (response?.data?.selected_address != null &&
                        response?.data?.selected_address) ||
                      (addresses.length > 0 && addresses[0]?.address_id),
                    paymentMethods: payment_method,
                    // shippingMethods: shipping_method,
                    totals,
                    products: response?.data?.products || [],
                    wellet: mywallet,
                    ordertotal,
                    // enableBtn: response?.data?.confirm_order || false,
                    couponCode: coupon ? coupon.trim() : null,
                    productImagePath: product_path,
                  },
                  () => {
                    if (this.isFirstTimeAPI) {
                      this.setSelectedData();
                      this.isFirstTimeAPI = false;
                    }
                  },
                );
              }
            }
            break;
        }
        break;
      case API_APPLY_COUPON_CODE:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.success) {
              showSuccessSnackBar(response.data.success.message);
              this.setState(
                {
                  couponCodeApplied: true,
                },
                () => {
                  this.checkoutCartRequest();
                },
              );
            }
            break;
        }
        break;

      case API_CheckOut_Apple_Pay_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.success) {
              this.setState(
                {
                  currentPosition: 2,
                  successData: response.data,
                },
                () => {
                  showSuccessSnackBar(response.data.success.message);
                  // successData()
                },
              );
              this.addRevenueEvent();
            }
            else{
              showErrorSnackBar(response?.data?.error?.message)
            }
            break;
        }
        break;

        case API_CheckOutID_Apple_Pay:
            switch (response.status) {
              case Constants.ResponseCode.OK:

                if (response.data ) {

                    this.requestHyperPay(response?.data?.checkout_id)
                  this.setState(
                    {
                    //   currentPosition: 2,
                    //   successData: response.data,
                    },
                    () => {
                    //   showSuccessSnackBar(response?.data.success.message);
                      
                        
                    },
                  );
                }
                break;
            }
            break;

    

      case API_CheckOut_Product_Check_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            console.log('ayyyaaaa');
            if (response.data && response.data.success) {
              // showSuccessSnackBar(response.data.success.message);
              // this.setState({
              //     couponCodeApplied: true
              // }, () => {
              //     this.checkoutCartRequest()
              // })
              setTimeout(() => {
                this.paymentRequest();
              }, 300);
            }
            break;
        }
        break;

      case API_Remove_coupen_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.success) {
              showSuccessSnackBar(response.data.success.message);
              this.setState(
                {
                  couponCodeApplied: true,
                },
                () => {
                  this.checkoutCartRequest();
                },
              );
            }
            break;
        }
        break;
      case API_APPLY_GIFT_CODE:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.success) {
              showSuccessSnackBar(response.data.success.message);
              this.setState(
                {
                  giftCodeApplied: true,
                },
                () => {
                  this.checkoutCartRequest();
                },
              );
            }
            break;
        }
        break;
      case API_PAYMENT_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data.success) {
              this.setState(
                {
                  currentPosition: 2,
                  successData: response.data,
                },
                () => {
                  showSuccessSnackBar(response.data.success.message);
                },
              );
              this.addRevenueEvent();
            }
            break;
        }
        break;
      case API_Remove_checkout_STATUS:

      case API_Move_checkout_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data.success) {
              this.setState(
                {
                  products: response?.data?.products || [],
                },
                () => {
                  showSuccessSnackBar(response.data.success.message);
                  this.checkoutCartRequest();
                },
              );
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
      case API_CHECKOUT_CART:
        if (error && error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
      case API_APPLY_COUPON_CODE:
        if (error && error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
      case API_APPLY_GIFT_CODE:
        if (error && error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
      case API_PAYMENT_STATUS:
        if (error && error.meta && error.meta.message) {
          setTimeout(() => {
            Alert.alert('', error.meta.message, [
              {
                text: this.props.localeStrings.ok,
                onPress: () => {},
              },
            ]);
          }, 250);
        }
        break;

        case API_CheckOut_Apple_Pay_STATUS:
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

  //Utility
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

      case 'applePay':
        return (
          <Image
            source={APPLE_PAY}
            style={{width: 40, aspectRatio: 2}}
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

      case 'sadad':
        return (
          <Image
            source={SADAD_LOGO}
            style={{width: 20, aspectRatio: 2}}
            resizeMode={'contain'}
          />
        );
      default:
        return (
          <Icon name={'bank_transfer'} size={20} color={Color.TEXT_DARK} />
        );
    }
  };

  getDefaultSelected = (array = []) => {
    if (Array.isArray(array) && array.length > 0) {
      let defaultItemIdx = array.findIndex(
        item => item.default && item.default === true,
      );
      if (defaultItemIdx !== -1) return defaultItemIdx;
    }
    return 0;
  };

  getCartItemLabel = () => {
    let tot_items = this.state.products.length,
      label = this.props.localeStrings.item;
    if (tot_items > 1) {
      label = this.props.localeStrings.items;
    }
    return {
      label: `${tot_items} ${label}`,
      tot_items,
    };
    return {
      label: this.props.localeStrings.noItems,
      tot_items: 0,
    };
  };

  setSelectedData = () => {
    let isSelectedChanged = false;
    // if (Array.isArray(this.state.userAddresses)) {
    //     for (let i = 0; i < this.state.userAddresses.length; i++) {
    //         if (this.state.userAddresses[i].address_id === ) {
    //             this.setState({
    //                 selectedAddressId: this.state.userAddresses[i].address_id,
    //                 selectedAddressIndex: i
    //             });
    //             isSelectedChanged = true;
    //             break;
    //         }
    //     }
    // }

    if (this.state.paymentMethods) {
      for (let key in this.state.paymentMethods) {
        if (this.state.paymentMethods[key].selected === true) {
          this.setState({
            selectedPaymentId: this.state.paymentMethods[key].method_id,
          });
          isSelectedChanged = true;
          break;
        }
      }
    }

    if (this.state.shippingMethods) {
      for (let key in this.state.shippingMethods) {
        if (this.state.shippingMethods[key].selected === true) {
          this.setState({
            selectedShippingId: this.state.shippingMethods[key].shipping_id,
          });
          isSelectedChanged = true;
          break;
        }
      }
    }

    if (isSelectedChanged) {
      this.checkoutCartRequest();
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

  handleHardwareBack = () => {
    if (this.state.currentPosition === 0 || this.state.currentPosition === 2) {
      BackHandler.removeEventListener('CheckoutBack', this.handleHardwareBack);
      this.redirectBack();
      return true;
    } else {
      this.setState({
        currentPosition: this.state.currentPosition - 1,
      });
    }
  };

  redirectBack = () => {
    let redirectRoute = this.props.navigation.getParam('isFromRoute', null);
    console.log('index is1', this.state.currentPosition, redirectRoute);

    if (redirectRoute) {
      this.props.navigation.navigate(Routes.Home);
    } else {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: undefined,
          actions: [NavigationActions.navigate({routeName: Routes.MainTabs})],
        }),
      );
    }
  };

  onPaymentModalClose = refID => {
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

  addRevenueEvent = () => {
    let total =
      this.state.totals && this.state.totals.length > 0
        ? this.state.totals.find(
            item =>
              item.title === this.props.localeStrings.total ||
              item.title === 'الاجمالي النهائي',
          )
        : null;
    if (total && total.text) {
      let amount = total.text.replace('SR', '').trim();
      amount = amount ? parseFloat(amount) : 0.0;
      AdjustAnalyticsService.revenueEvent(amount);
    }
  };

  //User Interaction
  onSelectAddress = (index, value) => {
    if (value && value !== this.state.selectedAddressId) {
      this.setState(
        {
          selectedAddressId: value,
          selectedAddressIndex: index,
        },
        () => {
          // this.checkoutCartRequest()
        },
      );
    }
  };

  gotoStepTwo = () => {
    this.checkoutCartRequest();
    this.setState({currentPosition: 1});
  };

  placeOrder = () => {
    this.onClickConfirmOrder();
    // this.setState({ currentPosition:2 })
  };

  onselectwellet = () => {
    if (this.state.wellet >= this.state.ordertotal) {
      this.setState({enableBtn: true});
    }

    this.setState({welletSelected: !this.state.welletSelected}, () => {
      this.checkoutCartRequest();
    });
  };

  paymentRequest = () => {
    // console.log('yha aayaaa 2',this.state.amount)
    // const METHOD_DATA = Platform.OS == 'ios' ? [{
    //   supportedMethods: ['apple-pay'],
    //   data: {
    //     merchantIdentifier: 'merchant.com.letsbuy',
    //     supportedNetworks: ['visa', 'mastercard', 'amex'],
    //     countryCode: 'SA',
    //     currencyCode: 'SAR'
    //   }
    // }] : [{
    //   supportedMethods: ['android-pay'],
    //   data: {
    //     supportedNetworks: ['visa', 'mastercard', 'amex'],
    //     currencyCode: 'USD',
    //     environment: 'TEST', // defaults to production
    //     paymentMethodTokenizationParameters: {
    //       tokenizationType: 'NETWORK_TOKEN',
    //       parameters: {
    //         publicKey: 'your-pubic-key'
    //       }
    //     }
    //   }
    // }]
    // const DETAILS = {
    //   id: 'checkout',
    //   displayItems: [
    //     {
    //       label: this.props?.localeStrings?.total,
    //       amount: { currency: 'SAR', value: this.state.ordertotal }
    //     }
    //   ],
    //   total: {
    //     label: `Let'sBuy`,
    //     amount: { currency: 'SAR', value: this.state.ordertotal }
    //   }
    // };
    // // const OPTIONS = {
    // //   requestPayerName: true,
    // //   requestPayerPhone: true,
    // //   requestPayerEmail: true,
    // // };
    // console.log('yha aayaaa 3')
    // const paymentRequest = new PaymentRequest(METHOD_DATA, DETAILS);
    // console.log('paymentRequest',paymentRequest)
    // paymentRequest.canMakePayments().then(async(canMakePayment) => {
    //   if (canMakePayment) {
    //     // paymentRequest.show()
    //     // .then(paymentResponse => {
    //     //   // Your payment processing code goes here
    //     //   console.log('success',paymentResponse)
    //     //   const { transactionIdentifier, paymentData } = paymentResponse.details;
    //     //   if(transactionIdentifier){
    //     //     paymentResponse.complete('success')
    //     //      this.confirmApplePayment(paymentResponse?._details?.transactionIdentifier)
    //     //   }
    //     // //
    //     // //  console.log('success',res)
    //     // //   if(paymentResponse?._completeCalled){
    //     // //   }
    //     // });
    //     const response = await paymentRequest.show();
    //     await this.validateResponse(response);
    //   }
    //   else{
    //     Alert.alert('Cant Make Payment')
    //   }
    // })
    //   console.log('payment request',paymentRequest)
    //  paymentRequest.show().then((res)=>{
    //    console.log('apple pay res',res)
    //  });



  };

  validateResponse = async response => {
    try {
      if (response?._details?.transactionIdentifier) {
        console.log('complete call');
        setTimeout(() => {
          this.checkOutApplePay(response?._details?.transactionIdentifier);
        }, 500);

        await response.complete('success');
      } else {
        await response.complete('fail');
      }
    } catch (err) {
      await response.complete('fail');
    }
  };

  onSelectPayment = (index, value) => {
    this.setState({enableBtn: true, appleSelected: false});
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
        case 'applePay':
          this.setState(
            {
              appleSelected: true,
            },
            () => {
              // this.checkoutCartRequest();

            },
          );

          // this.checkProductAvailable()
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
                        this.checkoutCartRequest();
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
          this.setState(
            {
              selectedPaymentId: value,
            },
            () => {
              this.checkoutCartRequest();
            },
          );
          break;
      }
    }
  };

  onSelectShipping = (index, value) => {
    if (value) {
      this.setState(
        {
          selectedShippingId: value,
        },
        () => {
          this.checkoutCartRequest();
        },
      );
    }
  };

  onClickAddNewAddress = () => {
    // this.props.navigation.navigate(Routes.AddNewAddress, {
    //     isFromCheckout: true,
    //     isFromRoute: this.props.navigation.state.routeName,
    //     toRoute: this.props.navigation.state.routeName
    // });

    this.props.navigation.navigate(Routes.SearchAddressMap, {
      isFromCheckout: true,
      isFromRoute: this.props.navigation.state.routeName,
      toRoute: this.props.navigation.state.routeName,
    });
  };

  onClickApplyCoupon = () => {
    // this.setState(prevState => ({couponCodeApplied: !prevState.couponCodeApplied}))
    if (this.state.couponCodeApplied) {
      this.removeCouponRequest();
      this.setState(
        {
          couponCodeApplied: false,
          couponCode: '',
        },
        () => {
          //    this.checkoutCartRequest()
        },
      );
    } else if (this.state.couponCode) {
      this.applyCouponRequest();
    }
  };

  continueShopping = () => {
    this.redirectBack();
  };

  onClickApplyGift = () => {
    // this.setState(prevState => ({giftCodeApplied: !prevState.giftCodeApplied}))
    if (this.state.giftCodeApplied) {
      this.setState(
        {
          giftCodeApplied: false,
          giftCode: '',
        },
        () => {
          this.checkoutCartRequest();
        },
      );
    } else if (this.state.giftCode) {
      this.applyGiftCodeRequest();
    }
  };

  onClickConfirmOrder = () => {
    //analytics
    AdjustAnalyticsService.confirmEvent();

    Alert.alert(null, this.props.localeStrings.placeOrderConfirmMessage, [
      {
        text: this.props.localeStrings.yes,
        onPress: () => {
          if (this.state.appleSelected) {
            if (
              this.state.welletSelected &&
              this.state.wellet >= this.state.ordertotal
            ) {
              this.setState({userConfirmed: true}, () => {
                // this.checkoutCartRequest(true);
                this.applePayCheckOutID()
              });
            } else {
              // this.checkProductAvailable();
              this.applePayCheckOutID()

            }
          } else {
            this.setState({userConfirmed: true}, () => {
              this.checkoutCartRequest(true);
            });
          }
        },
      },
      {
        text: this.props.localeStrings.no,
        onPress: () => {},
      },
    ]);
  };

  //UI methods
  renderAddressSection = () => {
    return (
      <View style={styles.sectionBlock}>
        <Label small color={Color.TEXT_DARK} mt={10} mb={10}>
          {this.props.localeStrings.chooseDeliveryAddress}
        </Label>
        {this.state.userAddresses.length > 0 && (
          <RadioComponent.RadioGroup
            onSelect={this.onSelectAddress}
            selectedIndex={this.state.selectedAddressIndex}
            color={Color.PRIMARY}>
            {this.state.userAddresses.map((address, idx) => (
              <RadioComponent.RadioButton
                value={address.address_id}
                key={`${idx}`}>
                <View style={styles.addressBox}>
                  <Label
                    nunito_bold
                    large
                    color={Color.TEXT_DARK}
                    style={styles.addressLabel}>
                    {address.fullname}
                  </Label>
                  {address.address_label ? (
                    <View style={styles.tagBoxView}>
                      <Label xsmall color={Color.WHITE}>
                        {address.address_label}
                      </Label>
                    </View>
                  ) : null}
                  <Label
                    small
                    color={Color.TEXT_LIGHT}
                    style={styles.addressLabel}>
                    {address.street_name}
                  </Label>
                  <Label
                    small
                    color={Color.TEXT_LIGHT}
                    style={styles.addressLabel}>
                    {address.zone}
                  </Label>
                  <Label
                    small
                    color={Color.TEXT_LIGHT}
                    style={styles.addressLabel}>
                    {address.country}
                  </Label>
                  <Label
                    small
                    color={Color.TEXT_LIGHT}
                    style={styles.addressLabel}>
                    {this.props.localeStrings.mobile}:+{address.telephone}
                  </Label>
                </View>
              </RadioComponent.RadioButton>
            ))}
          </RadioComponent.RadioGroup>
        )}
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <RoundButton
            width={ThemeUtils.relativeWidth(90)}
            backgroundColor={Color.PRIMARY}
            border_radius={5}
            textColor={Color.WHITE}
            click={this.onClickAddNewAddress}>
            {this.props.localeStrings.navNewAddress}
          </RoundButton>
        </View>
      </View>
    );
  };

  renderChoosedAddressSection = () => {
    if (this.state.selectedAddressId) {
      const selectedAddress = this.state.userAddresses.filter(
        item => item.address_id == this.state.selectedAddressId,
      );

      return (
        <View
          style={{
            padding: 15,
            backgroundColor: Color.WHITE,
            marginBottom: 10,
          }}>
          <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
            {this.props.localeStrings.delivery_address}
          </Label>

          {selectedAddress.map((item, index) => {
            return (
              <View
                style={{
                  borderRadius: 5,
                  borderColor: Color.LIGHT_GRAY,
                  borderWidth: 1,
                  marginVertical: 10,
                  padding: 10,
                }}>
                <Label
                  opensans_bold
                  bolder
                  small
                  singleLine
                  color={Color.TEXT_GRAY}>
                  {item?.fullname}
                </Label>
                <Label opensans_regular xsmall color={Color.TEXT_GRAY}>
                  {item.fulladdress}
                </Label>
                <Label
                  opensans_regular
                  xsmall
                  singleLine
                  color={Color.TEXT_GRAY}>
                  {item.telephone}
                </Label>
              </View>
            );
          })}
        </View>
      );
    }
    return null;
  };

  renderPaymentsSection = () => {
    return (
      <View style={styles.sectionBlock}>
        <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
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
        <TouchableOpacity
          onPress={this.onselectwellet}
          style={{
            flex: 1,
            flexDirection: 'row',
            marginHorizontal: 10,
            marginVertical: 5,
            //paddingHorizontal: 4,
            width: '98%',
          }}>
          <View
            style={{
              height: 20,
              width: 20,
              marginRight: 10,
              backgroundColor: 'white',
              borderRadius: 10,
              borderWidth: 2,
              borderColor: Color.PRIMARY,
              padding: 3,
            }}>
            <View
              style={{
                backgroundColor: this.state.welletSelected
                  ? Color.PRIMARY
                  : 'white',
                height: 10,
                width: 10,
                borderRadius: 5,
              }}
            />
          </View>
          <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
            {` ${this.props.localeStrings.balance_sr} ${this.state.wellet}`}
          </Label>
        </TouchableOpacity>
      </View>
    );
  };

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

  renderShippingSection = () => {
    return (
      <View style={styles.sectionBlock}>
        <Label small color={Color.TEXT_DARK} mb={10}>
          {this.props.localeStrings.shippingMethodTitle}
        </Label>
        {this.parseAPIData(this.state.shippingMethods) ? (
          <RadioComponent.RadioGroup
            onSelect={this.onSelectShipping}
            showSeparator={true}
            separatorStyle={styles.radioSeparator}
            color={Color.PRIMARY}>
            {this.renderShippingOptions()}
          </RadioComponent.RadioGroup>
        ) : (
          <View />
        )}
      </View>
    );
  };

  renderShippingOptions = () => {
    let options = [];
    for (let method_id in this.state.shippingMethods) {
      if (
        'quote' in this.state.shippingMethods[method_id] &&
        this.state.shippingMethods[method_id]['quote'] !== null &&
        this.state.shippingMethods[method_id]['quote'] !== undefined
      ) {
        for (let quote_id in this.state.shippingMethods[method_id]['quote']) {
          let method = this.state.shippingMethods[method_id]['quote'][quote_id];
          let methodTitle = '',
            costText = null;
          if (method.title !== '') {
            methodTitle = method.title;
          }
          /*else if (method.quote && method.quote[method_id] && method.quote[method_id].title) {
                        methodTitle = method.quote[method_id].title;
                    }
                    if (method.quote && method.quote[method_id] && method.quote[method_id].text) {
                        costText = method.quote[method_id].text;
                    }*/

          if (method.text) {
            costText = method.text;
          }

          options.push(
            <RadioComponent.RadioButton
              style={{
                marginVertical: 5,
              }}
              value={quote_id}
              key={`${quote_id}`}>
              <View style={styles.shippingRadio}>
                <Label
                  small
                  color={Color.TEXT_DARK}
                  style={styles.addressLabel}>
                  {methodTitle}
                </Label>
                {costText ? (
                  <Label
                    small
                    ms={5}
                    color={Color.TEXT_LIGHT}
                    style={styles.addressLabel}>
                    {`(${costText})`}
                  </Label>
                ) : null}
              </View>
            </RadioComponent.RadioButton>,
          );
        }
      }
    }
    return options;
  };

  renderCouponSection = () => {
    return (
      <View style={styles.sectionBlock}>
        <View style={{marginVertical: 10}}>
          <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
            {this.props.localeStrings.couponCode}
          </Label>
          <View style={styles.couponCodeContainer}>
            <TextInput
              style={[
                styles.couponInput,
                {
                  borderColor: this.state.couponCode
                    ? Color.PRIMARY
                    : Color.LIGHT_GRAY,
                  textAlign:
                    !this.state.couponCode && !this.state.couponCodeFocused
                      ? 'center'
                      : I18nManager.isRTL
                      ? 'right'
                      : 'left',
                  borderTopLeftRadius: I18nManager.isRTL ? 0 : 5,
                  borderBottomLeftRadius: I18nManager.isRTL ? 0 : 5,
                  borderTopRightRadius: I18nManager.isRTL ? 5 : 0,
                  borderBottomRightRadius: I18nManager.isRTL ? 5 : 0,
                },
              ]}
              numberOfLines={1}
              placeholder={this.props.localeStrings.couponCodePlaceholder}
              placeholderTextColor={Color.TEXT_LIGHT}
              onChangeText={text => this.setState({couponCode: text})}
              value={this.state.couponCode}
              editable={!this.state.couponCodeApplied}
              onFocus={() => {
                this.setState({couponCodeFocused: true});
              }}
              onBlur={() => {
                this.setState({couponCodeFocused: false});
              }}
            />
            <View>
              <RoundButton
                width={ThemeUtils.relativeWidth(25)}
                backgroundColor={
                  this.state.couponCode ? Color.PRIMARY : Color.LIGHT_GRAY
                }
                disabled={!this.state.couponCode}
                border_radius={0}
                btnContainerStyle={{
                  borderTopRightRadius: 5,
                  borderBottomRightRadius: 5,
                  height: 42,
                }}
                btn_sm
                textColor={Color.WHITE}
                click={this.onClickApplyCoupon}>
                {this.state.couponCodeApplied
                  ? this.props.localeStrings.remove
                  : this.props.localeStrings.applyString}
              </RoundButton>
            </View>
          </View>
        </View>
      </View>
    );
  };

  renderFinalPriceSection = () => {
    let total =
      this.state.totals && this.state.totals.length > 0
        ? this.state.totals.find(
            item =>
              item.title === this.props.localeStrings.total ||
              item.title === 'الاجمالي النهائي',
          )
        : null;
    let filtered =
      this.state.totals && this.state.totals.length > 0
        ? this.state.totals.filter(
            item =>
              item.title !== this.props.localeStrings.total &&
              item.title !== 'الاجمالي النهائي',
          )
        : [];
    return (
      <View style={styles.sectionBlock}>
        <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
          {this.props.localeStrings.orderSummery}
        </Label>
        {filtered && filtered.length > 0
          ? filtered.map((costType, index) =>
              costType.title ? (
                <View
                  key={`${costType.title}`}
                  style={styles.costTypeContainer}>
                  <Label color={Color.TEXT_LIGHT} opensans_regular small>
                    {costType.title}
                  </Label>
                  <Label color={Color.TEXT_LIGHT} opensans_regular small>
                    {index == 0 ? `${costType.text}` : `SR${costType.text}`}
                  </Label>
                </View>
              ) : null,
            )
          : null}
        <Hr lineStyle={styles.lineSeparator} />
        {total ? (
          <View style={styles.costTypeContainer}>
            <Label color={Color.BLACK} opensans_bold large>
              {total.title}
            </Label>
            <Label color={Color.TEXT_DARK} opensans_bold large>
              {`SR${total.text}`}
            </Label>
          </View>
        ) : null}
      </View>
    );
  };

  renderProductSection = () => {
    let {label, tot_items} = this.getCartItemLabel();

    return (
      <View style={{padding: 15, backgroundColor: Color.WHITE}}>
        <Label opensans_bold bolder small singleLine color={Color.TEXT_GRAY}>
          {label}
        </Label>
        {this.state.products.map((item, index) => (
          <View key={index} style={styles.productItem}>
            <View style={styles.productItemUpperSection}>
              <View>
                <Image
                  source={{uri: this.state.productImagePath + item.image}}
                  style={{height: 80, width: 80}}
                />
              </View>
              <View style={styles.productItemUpperMiddleSection}>
                <View style={styles.productItemNameContainer}>
                  <Label
                    color={Color.TEXT_DARK}
                    opensans_bold
                    bolder={IS_IOS}
                    singleLine
                    xsmall>
                    {item?.name}
                  </Label>
                </View>
                {item.option_name ? (
                  <Label
                    color={Color.TEXT_GRAY}
                    opensans_semibold
                    bold
                    mt={5}
                    singleLine
                    xxsmall>
                    {`${item.option_name} - ${item.option_value}`}
                  </Label>
                ) : null}
                <Label
                  color={Color.TEXT_GRAY}
                  opensans_semibold
                  bold
                  xsmall
                  mt={10}>
                  {`${this.props.localeStrings.quantity} - ${item?.quantity}`}
                </Label>
              </View>
              <View style={{justifyContent: 'flex-end'}}>
                {item?.percentage !== null ? (
                  <View style={styles.productItemOffContainer}>
                    <View
                      style={{
                        backgroundColor: Color.PRIMARY,
                        paddingHorizontal: 7,
                        paddingVertical: 4,
                        borderRadius: 50,
                      }}>
                      <Label color={Color.BLACK} opensans_bold bold xxsmall>
                        {`${item.percentage}% ${this.props.localeStrings.off}`}
                      </Label>
                    </View>
                  </View>
                ) : null}
                <View style={styles.productItemPriceContainer}>
                  <Label
                    color={item.special ? Color.ERROR : Color.TEXT_DARK}
                    xsmall
                    nunito_bold
                    bolder={IS_IOS}
                    me={5}>
                    {item.special
                      ? `SR ${numberWithCommas(item.price)}`
                      : `SR ${numberWithCommas(item?.price || '0')}`}
                  </Label>
                  {item.special && item.price ? (
                    <Label
                      color={Color.TEXT_LIGHT}
                      xsmall
                      ms={5}
                      nunito_bold
                      bolder={IS_IOS}
                      style={{textDecorationLine: 'line-through'}}>
                      {`SR ${numberWithCommas(item?.special || '0')}`}
                    </Label>
                  ) : null}
                </View>
              </View>
            </View>
            {this.state.products.length > 1 ? (
              <View style={styles.productItemLowerSection}>
                <TouchableOpacity
                  onPress={() => this.removeItemRequest(item)}
                  activeOpacity={0.7}
                  style={styles.productItemRemoveBtn}>
                  <Icon
                    name={'delete'}
                    size={ThemeUtils.fontSmall}
                    color={Color.PRIMARY}
                    style={{marginRight: 5}}
                  />
                  <Label color={Color.PRIMARY} opensans_semibold small>
                    {' '}
                    {this.props.localeStrings.remove}
                  </Label>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => this.moveItemRequest(item)}
                  activeOpacity={0.7}
                  style={styles.productItemWishlistBtn}>
                  <Icon
                    name={'wishlist_fill'}
                    size={ThemeUtils.fontSmall}
                    color={Color.PRIMARY}
                    style={{marginRight: 5}}
                  />
                  <Label color={Color.PRIMARY} opensans_semibold small>
                    {' '}
                    {this.props.localeStrings.moveToWishList}
                  </Label>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    );
  };

  renderPlaceOrderBtn = () => {
    let btn = (
      <RoundButton
        border_radius={0}
        btn_lg
        backgroundColor={this.state.enableBtn ? Color.PRIMARY : Color.GRAY}
        textColor={Color.WHITE}
        borderColor={Color.PRIMARY}
        disabled={!this.state.enableBtn}
        width={'48%'}
        btnContainerStyle={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }}
        click={() => this.onClickConfirmOrder()}>
        {this.props.localeStrings.orderplaced}
      </RoundButton>
    );

    let appleButton = (
      <View style={{}}>
        <TouchableOpacity
          style={[styles.appleButton, {opacity: 1.0}]}
          activeOpacity={0.5}
          underlayColor={Color.TRANSPARENT}
          onPress={this.onClickConfirmOrder}>
          <Image
            source={require('src/assets/images/logo_assets/applePay.png')}
            style={{
              tintColor: 'white',
              height: 25,
              aspectRatio: 1,
              resizeMode: 'contain',
            }}
            resizeMode={'contain'}
          />
          {/* <Label
              color={Color.WHITE}
              xxlarge
              ms={5}
              opensans_bold
              bolder={IS_IOS}>
              {this.props.localeStrings.applepay}
            </Label> */}
        </TouchableOpacity>
      </View>
    );

    return Platform.OS === 'android' ? (
      <LinearGradient
        style={{
          marginTop: -15,
          paddingTop: 15,
          borderBottomColor: Color.PRIMARY,
          borderBottomWidth: 1,
        }}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={['#ffffff00', '#rgb(45,45,45)']}
        pointerEvents={'box-none'}>
        {btn}
      </LinearGradient>
    ) : this.state.appleSelected ? (
      appleButton
    ) : (
      btn
    );
  };

  newAddTocartButton = () => {};

  //Lifecycle methods
  static navigationOptions = ({navigation, navigationOptions}) => {
    let backHandler = navigation.getParam('backHandler', null);
    return {
      title: 'navCheckout',
      header: props => (
        <CustomNavigationHeader
          {...props}
          titleCenter={true}
          showRightButton={false}
          btnLeftHandler={backHandler}
          isMainTitle={false}
        />
      ),
    };
  };

  constructor(props) {
    super(props);

    steps = [
      this.props.localeStrings.address,
      this.props.localeStrings.payment,
      this.props.localeStrings.orderplaced,
    ];

    let checkoutParams = this.props.navigation.getParam('checkoutParams', {});
    let {
      addresses = [],
      shipping_method = null,
      payment_method = null,
      totals = null,
      coupon = [],
      voucher = [],
      confirm_order,
    } = checkoutParams;

    this.state = {
      userAddresses: addresses,
      paymentMethods: payment_method,
      shippingMethods: shipping_method,
      totals,
      couponCode: '',
      couponCodeApplied: false,
      giftCode: '',
      giftCodeApplied: false,
      enableBtn: confirm_order,
      isLoaderVisible: false,
      couponCodeFocused: false,
      giftCodeFocused: false,
      selectedAddressId: null,
      selectedAddressIndex: 0,
      paymentHref: '',
      paymentModalVisible: false,
      paymentRefID: '',
      products: [],
      wellet: 0,
      ordertotal: 0,
      successData: null,
      welletSelected: false,
      appleSelected: false,

      productImagePath: '',

      currentPosition: 0,
      address: [
        {
          id: '1',
          name: 'Kumar Divya',
          address: 'Keas 69 Str. 15234, Chalandri Athens, Greece',
          mobile: '+30-6977664062 (mobile phone)',
          selected: false,
        },
        {
          id: '2',
          name: 'Samith Jhone',
          address: 'Keas 69 Str. 15234, Chalandri Athens, Greece',
          mobile: '+30-6977664062 (mobile phone)',
          selected: false,
        },
      ],
    };

    this.paymentStaticTypes = {
      cod: {
        name: 'Cash on Delivery',
        name_ar: 'الدفع عند الاستلام',
      },
      bank_transfer: {
        name: 'Bank Transfer',
        name_ar: 'التحويل المصرفي',
      },
      'tap-card': {
        name: 'Credit or Debit Card',
        name_ar: 'البطاقة الإئتمانيه',
      },
      'tap-mada': {
        name: 'MADA Payment',
        name_ar: 'بطاقة مدى',
      },
    };

    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        this.setState({
          enableScrollViewScroll: true,
          showCountryDropdown: false,
          showStateDropdown: false,
        });
        return false;
      },
    });

    this.isFirstTimeAPI = true;
  }

  componentDidMount() {}

  componentWillMount() {
    let redirectRoute = this.props.navigation.getParam('isFromRoute', null);
    if (redirectRoute) {
      BackHandler.addEventListener('CheckoutBack', this.handleHardwareBack);
      this.props.navigation.setParams({
        backHandler: this.handleHardwareBack,
      });
    }
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('CheckoutBack', this.handleHardwareBack);
  }

  requestHyperPay(checkOutId) {
    console.log('response okay 1',checkOutId)

    setTimeout(() => {
      HyperPayModule.openHyperPay(checkOutId,this.state.ordertotal,"Purchase", (response) => {
      setTimeout(() => {
        console.log('payment response is',response);
        // if(response?.url){
        //   Alert.alert('success 1',response?.url)

        // }
        // else{
        //   Alert.alert('success 2',response?.responeDic || "Nothing in response")
        // }

        this.checkOutApplePay(response?.url ? response?.url : response?.responeDic );
      }, 500);
     }, (error) => {
      setTimeout(() => {
        console.log('message is',error)
       // Alert.alert('Error',error)
      showErrorSnackBar(`Payment failed ! ${error}`)
    }, 500)
    })
    }, 800);

  
  }

  render() {
    return (
      <View style={CommonStyle.safeArea} {...this._panResponder.panHandlers}>
        <NavigationEvents
          onDidFocus={payload => {
            this.checkoutCartRequest();
          }}
        />
        <Spinner visible={this.state.isLoaderVisible} />
        <PaymentWebView
          isOpen={this.state.paymentModalVisible}
          href={this.state.paymentHref}
          onClose={this.onPaymentModalClose}
        />

        <SafeAreaView style={{flex: 1}}>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{flexGrow: 1}}
            enableResetScrollToCoords={false}>
            <View style={{marginVertical: 30}}>
              <StepIndicator
                customStyles={customStyles}
                currentPosition={this.state.currentPosition}
                labels={steps}
                stepCount={3}
              />
            </View>

            {this.state.currentPosition === 0 ? (
              <View style={{flex: 1}}>
                <View style={{padding: 15, flex: 1}}>
                  <Label
                    opensans_bold
                    bolder
                    small
                    singleLine
                    color={Color.TEXT_GRAY}>
                    {this.props.localeStrings.chooseDeliveryAddress}
                  </Label>

                  <RadioComponent.RadioGroup
                    onSelect={this.onSelectAddress}
                    selectedIndex={this.state.selectedAddressIndex}
                    color={Color.PRIMARY}
                    style={{
                      borderRadius: 5,
                      borderColor: Color.LIGHT_GRAY,
                      borderWidth: 1,
                      marginVertical: 10,
                    }}>
                    {this.state.userAddresses.map((item, index) => (
                      <RadioComponent.RadioButton
                        value={item.address_id}
                        key={`${index}`}
                        style={{
                          borderColor: Color.LIGHT_GRAY,
                          borderBottomWidth:
                            this.state.userAddresses.length - 1 === index
                              ? 0
                              : 1,
                          flex: 1,
                        }}>
                        <View
                          style={{
                            flex: 1,
                            paddingHorizontal: 10,
                            width: '98%',
                          }}>
                          <Label
                            opensans_bold
                            bolder
                            small
                            singleLine
                            color={Color.TEXT_GRAY}>
                            {item?.fullname}
                          </Label>
                          <Label
                            opensans_regular
                            xsmall
                            singleLine
                            color={Color.TEXT_GRAY}>
                            {item.fulladdress}
                          </Label>
                          <Label
                            opensans_regular
                            xsmall
                            singleLine
                            color={Color.TEXT_GRAY}>
                            {item.telephone}
                          </Label>
                        </View>
                      </RadioComponent.RadioButton>
                    ))}
                  </RadioComponent.RadioGroup>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: 15,
                    marginVertical: 10,
                    justifyContent: 'space-between',
                  }}>
                  <RoundButton
                    border_radius={5}
                    btn_lg
                    textColor={Color.PRIMARY}
                    borderColor={Color.PRIMARY}
                    backgroundColor={Color.WHITE}
                    borderWidth={1}
                    click={this.onClickAddNewAddress}
                    width={
                      this.state.userAddresses.length > 0 ? '48%' : '100%'
                    }>
                    {this.props.localeStrings.navNewAddress}
                  </RoundButton>
                  {this.state.userAddresses.length > 0 && (
                    <RoundButton
                      border_radius={5}
                      btn_lg
                      backgroundColor={Color.PRIMARY}
                      textColor={Color.WHITE}
                      width={'48%'}
                      click={this.gotoStepTwo}>
                      {this.props.localeStrings.continue}
                    </RoundButton>
                  )}
                </View>
              </View>
            ) : null}

            {this.state.currentPosition === 1 ? (
              <View style={{flex: 1, backgroundColor: '#F3F3F3'}}>
                {this.renderChoosedAddressSection()}
                {this.renderPaymentsSection()}
                {this.renderCouponSection()}
                {this.renderFinalPriceSection()}
                {this.renderProductSection()}
              </View>
            ) : null}
            {this.state.currentPosition === 2 ? (
              this.state.successData ? (
                <View style={styles.orderPlacedContainer}>
                  <View style={styles.orderPlacedTitleContainer}>
                    <Label
                      opensans_bold
                      xxlarge
                      bolder={IS_IOS}
                      color={Color.TEXT_DARK}>
                      {this.props.localeStrings.thanks_for_your_order}
                    </Label>
                  </View>
                  <View style={styles.orderPlacedMainSection}>
                    <View style={styles.orderPlacedRow}>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          {this.props.localeStrings.order_number}
                        </Label>
                      </View>
                      <View style={styles.orderPlacedColon}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          :
                        </Label>
                      </View>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label
                          opensans_regular
                          color={Color.TEXT_DARK}
                          small>{`#${this.state.successData?.order_id}`}</Label>
                      </View>
                    </View>
                    <View style={styles.orderPlacedRow}>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          {this.props.localeStrings.total}
                        </Label>
                      </View>
                      <View style={styles.orderPlacedColon}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          :
                        </Label>
                      </View>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label
                          opensans_regular
                          color={Color.TEXT_DARK}
                          small>{`SR ${this.state.successData?.total}`}</Label>
                      </View>
                    </View>
                    <View style={styles.orderPlacedRow}>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          {this.props.localeStrings.shippingto}
                        </Label>
                      </View>
                      <View style={styles.orderPlacedColon}>
                        <Label
                          opensans_semibold
                          color={Color.TEXT_DARK}
                          bold
                          small>
                          :
                        </Label>
                      </View>
                      <View style={styles.orderPlacedRowLeftRight}>
                        <Label opensans_regular color={Color.TEXT_DARK} small>
                          {this.state.successData?.fulladdress}
                        </Label>
                      </View>
                    </View>
                  </View>
                  <View style={{alignItems: 'center'}}>
                    <RoundButton
                      border_radius={5}
                      btn_lg
                      backgroundColor={Color.PRIMARY}
                      textColor={Color.WHITE}
                      click={this.continueShopping}>
                      {this.props.localeStrings.continueshopping}
                    </RoundButton>
                  </View>
                </View>
              ) : null
            ) : null}
          </KeyboardAwareScrollView>
          {this.state.currentPosition === 1 ? this.renderPlaceOrderBtn() : null}
          {/* <RoundButton
            border_radius={5}
            btn_lg
            backgroundColor={Color.PRIMARY}
            textColor={Color.WHITE}
            click={this.applePayCheckOutID}>
            {'Apple Pay'}
          </RoundButton> */}
        </SafeAreaView>
      </View>
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
    langCode: state.langCode,
    appConfig: state.appConfig,

  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Checkout);

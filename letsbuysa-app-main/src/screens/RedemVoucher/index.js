import React, {Component} from 'react';
import {
  View,
  I18nManager,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Keyboard
} from 'react-native';

//Third party
import {connect} from 'react-redux';
import {NavigationEvents, SafeAreaView} from 'react-navigation';
import moment from 'moment';
import Spinner from 'react-native-loading-spinner-overlay';
import {Modalize} from 'react-native-modalize';

//Custom component
import {
  Label,
  Hr,
  CustomNavigationHeader,
  RadioComponent,
  RoundButton,
  FloatingInputText,
} from 'src/component';

//Utility
import Action from 'src/redux/action';
import {API_GET_NOTIFICATIONS, APIRequest, ApiURL} from 'src/api';
import styles from './styles';
import {
  CommonStyle,
  Color,
  ThemeUtils,
  Constants,
  Icon,
  validation,
  decodeImageUrl,
  Strings,
  DateUtils,
  showSuccessSnackBar,
  showErrorSnackBar

} from 'src/utils';
import Routes from 'src/router/routes';
import { API_Voucher_STATUS } from '../../api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {height} = Dimensions.get('window');

class RedemVoucher extends Component {
  //Server request
  checkVoucher = () => {
    this.setState({
      isLoaderVisible: true,
      errMessage: this.props.localeStrings.pleaseWait,
    });

    let params = {
      customer_id: this.props.user.customer_id,
      voucher:this.state.voucher
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_Voucher_STATUS)
      .reqURL(ApiURL.voucher)
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
      case API_Voucher_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data.status) {
              showSuccessSnackBar(response.data.success.message)
              this.props.navigation.navigate(Routes.Wallet);
            }
            else{
              showErrorSnackBar(response.data.success.message)
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
    }
  };
  // Action
  

  onclickRedeem = () => {

    this.setState(prevState => ({
      voucher: prevState.voucher ? prevState.voucher.trim() : "",
  }), () => {
      if (this.validateForm()) {
          this.checkVoucher()
      }
  });
  };

  //Utility
  validateForm = () => {
    Keyboard.dismiss();

    let voucherError ;
    let isValide = true;

    voucherError = validation("voucher", this.state.voucher);

    if (voucherError !== null) {
        this.setState({
          voucherError: voucherError,
        });

        isValide = false;
    } else {
        this.setState({
          voucherError: "",
        });
        isValide = true;
    }
    return isValide;
};

  //UI methods

  //Lifecycle methods
  static navigationOptions = ({navigation, navigationOptions}) => {
    let {state} = navigation;
    let title = navigation.getParam('title', 'Redeem Voucher');

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

    this.state = {
      voucherError: '',
      voucher: '',
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
        <View style={styles.container}>
          <View style={styles.voucherContainer}>
            <FloatingInputText
              // icon={'ticket-percent'}
              showIcon={false}
              // autoCapitalize={'words'}
              value={this.state.voucher}
              label={this.props?.localeStrings?.couponcode}
              error={this.state.voucherError}
              onFocus={() => {
                this.setState({voucherError: ''});
              }}
              onBlur={() => {
                if (this.state.voucher) {
                  this.setState(prevState => ({
                    voucher: prevState.voucher,
                  }));
                }
              }}
              onChangeText={voucher => this.setState({voucher})}
            />

            <View style={styles.selectButtonView}>
              <RoundButton
                width={ThemeUtils.relativeWidth(90)}
                backgroundColor={Color.PRIMARY}
                mt={20}
                mb={10}
                border_radius={5}
                btnPrimary
                textColor={Color.WHITE}
                click={this.onclickRedeem}>
                {this.props?.localeStrings?.reedemvoucher}
              </RoundButton>
            </View>
          </View>
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
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RedemVoucher);

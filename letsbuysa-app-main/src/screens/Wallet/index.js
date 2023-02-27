import React, {Component} from 'react';
import {
  View,
  I18nManager,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
  Dimensions,
  Platform,
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
} from 'src/component';

//Utility
import Action from 'src/redux/action';
import {API_Wallet_STATUS, APIRequest, ApiURL} from 'src/api';
import styles from './styles';
import {
  CommonStyle,
  Color,
  ThemeUtils,
  Constants,
  Icon,
  decodeImageUrl,
  Strings,
  showSuccessSnackBar,
  DateUtils,
} from 'src/utils';
import Routes from 'src/router/routes';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {height} = Dimensions.get('window');
const EMPTY_CART = require('src/assets/images/empty_cart.png');

class Wallet extends Component {
  //Server request
  getWalletBalance = () => {
    this.setState({
      isLoaderVisible: true,
      errMessage: this.props.localeStrings.pleaseWait,
    });
    console.log('my error message',this.props.localeStrings.pleaseWait)

    let params = {
      customer_id: this.props.user.customer_id,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_Wallet_STATUS)
      .reqURL(ApiURL.wallet)
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
      case API_Wallet_STATUS:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data) {
              console.log('welletResponse',response.data)
              this.setState({
                amount: response.data?.amount,
                transaction:response?.data?.wallettransaction || [],
                paymentTypes :response?.data?.payment_method || [],
              })
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
  openModel = () => {
    this.modalizeRef?.open();
  };
  closeModel = () => {
    this.modalizeRef?.close();
  };

  addCredit = () => {
    this.openModel();
  };

  onSelectedMethod = (index, value) => {

        this.setState({
            selectedMethodId: value,
            selectedMethodIndex: index
        }, () => {
           // this.checkoutCartRequest()
        });
};

  onclickSelect = () => {
    this.closeModel();
    console.log('method id is',this.state.selectedMethodId)
    if(this.state.selectedMethodId == 0){
        this.props.navigation.navigate(Routes.AddWallet,{payment_method:this.state.paymentTypes,title:this.props.localeStrings.addfunds})
    }
    else if (this.state.selectedMethodId == 2){
      this.paymentRequest()
    }
    else{
        this.props.navigation.navigate(Routes.RedemVoucher,{title:this.props.localeStrings.reedemvoucher})
    }
  };


  //Utility



  //UI methods

  emptyListStyle = () => {
    if (!this.state.transaction.length > 0)
        return {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }
};

  renderModelView = () => {
    return (
      <View style={styles.modelContainer}>
        <View
          style={[
            {backgroundColor: Color.WHITE, width: ThemeUtils.relativeWidth(90)},
          ]}>
          <Label color={Color.TEXT_DARK} small mt={5} style={{}}>
            {this.props?.localeStrings?.choosemethod}
          </Label>

          <RadioComponent.RadioGroup
            onSelect={this.onSelectedMethod}
            selectedIndex={this.state.selectedMethodIndex}
            color={Color.PRIMARY}>
            {this.state.paymentMethods.map((method, idx) => (
              <RadioComponent.RadioButton value={method.id} key={`${idx}`}>
                <View style={styles.methodBox}>
                  <Label nunito_bold large color={Color.TEXT_DARK}>
                    {method.title}
                  </Label>
                  {/* <Icon
                    name={method.icon}
                    size={ThemeUtils.fontNormal}
                    color={Color.PRIMARY}
                /> */}
                <MaterialCommunityIcons name={method.icon} color={Color.PRIMARY} size={ThemeUtils.fontXLarge} />

                </View>
              </RadioComponent.RadioButton>
            ))}
          </RadioComponent.RadioGroup>

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
              {this.props?.localeStrings?.select}
            </RoundButton>
          </View>
        </View>
      </View>
    );
  };

  renderEmptyView = () => {
    return (!this.state.isLoaderVisible ?
        <View style={{alignItems: 'center'}}>
            {/* <View style={styles.emptyImage}>
                <Image
                    source={EMPTY_CART}
                    style={{flex: 1}}
                    resizeMode={'contain'}/>
            </View> */}
            <Label align="center"
                   normal color={Color.TEXT_DARK}
                   nunito_medium
                   mt={15}
                   mb={15}>
                {this.props.localeStrings.no_transaction}
            </Label>
        </View>
        : <View style={{flex: 1, marginVertical: 10}}>
            <View style={[{flex: 1}, CommonStyle.content_center]}>
                <Label>{this.props.localeStrings.pleaseWait}</Label>
            </View>
        </View>)
};


renderItems = (index, item) => {
  return (<View><View style={styles.aTransactionContainer}>
    <Label color={Color.TEXT_LIGHT} small opensans_bold style={{}}>
      {I18nManager.isRTL ? item.reason_ar: item?.reason}
    </Label>
    <Label color={item.type == 2 ? Color.RED : Color.GREEN} bold normal style={{}}>
      {!I18nManager.isRTL ? `SR ${item.amount}` : `${item.amount} SR`}
    </Label>
  </View>
  <Hr lineStyle={{backgroundColor: Color.DARK_LIGHT_BLACK}}/>
  </View>)
}

  //Lifecycle methods
  static navigationOptions = ({navigation, navigationOptions}) => {
    let {state} = navigation;
    let title = navigation.getParam('title', 'My Wallet');

    return {
      title: this.props?.localeStrings?.my_wallet,
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
      amount: '0',
      transaction:[],
      paymentTypes :[],
      paymentMethods: [
        {id: 0, title: this.props?.localeStrings?.creditdebit, icon:'credit-card'},
        {id: 1, title: this.props?.localeStrings?.voucher, icon:'ticket-percent'},
      ],
      selectedMethodId : 0,
      selectedMethodIndex: 0
    };
  }

  componentDidMount() {
    this.getWalletBalance();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {}

  render() {
    return (
      <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
        <Spinner visible={this.state.isLoaderVisible} />
        <NavigationEvents
          onDidFocus={payload => {
            this.getWalletBalance();
          }}
        />
        <View style={styles.container}>
          <View style={styles.walletContainer}>
            <View style={styles.walletSubContainer}>
              <Label color={Color.TEXT_LIGHT} small opensans_bold style={{}}>
                {this.props?.localeStrings?.availablecredit}
              </Label>
              <Label color={Color.BLACK} large style={{}}>
                {!I18nManager.isRTL ? `SR ${this.state.amount}` : `${this.state.amount} SR`}
              </Label>
            </View>
            <TouchableOpacity
              onPress={this.addCredit}
              style={styles.walletButtonContainer}>
              {/* <Icon
                name={'my_addresses'}
                size={ThemeUtils.fontNormal}
                color={Color.PRIMARY}
              /> */}
                <MaterialCommunityIcons name={'plus-box'} color={Color.PRIMARY} size={ThemeUtils.fontXLarge} />

              <Label color={Color.TEXT_DARK} small mt={5} style={{}}>
                {this.props?.localeStrings?.addcredit}
              </Label>
            </TouchableOpacity>
          </View>
          <View>
          <FlatList
              data={this.state.transaction}
              extraData={this.state}
              
              refreshControl={
                  <RefreshControl
                      refreshing={this.state.isLoaderVisible}
                      onRefresh={this.getWalletBalance}
                   />}
              renderItem={
                  ({index, item}) => this.renderItems(index, item)
                  }
              ListHeaderComponent={<Label color={Color.TEXT_DARK} nunito_bold large ms={20} mt={15} style={{}}>
              {this.props?.localeStrings?.transaction_history}
            </Label>}
              ListEmptyComponent={this.renderEmptyView}
              contentContainerStyle={this.emptyListStyle()}
                    />
          </View>
          <Modalize
            ref={model => (this.modalizeRef = model)}
            modalHeight={height * 0.3}
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
  console.log('wallet state',state)
  if (state === undefined) return {};
  return {
    user: state.user,
    localeStrings: state.localeStrings,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Wallet);

import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    Alert,
    RefreshControl,
    Image, I18nManager
} from 'react-native';

//Custom Component
import {CustomNavigationHeader, RoundButton, Label} from "src/component";

//Third party
import {connect} from "react-redux";
import {NavigationEvents} from "react-navigation";

//Utility
import styles from './styles'
import {
    API_DELETE_ADDRESS,
    API_GET_ADDRESS,
    API_VERIFY_ADDRESS,
    APIRequest, ApiURL
} from "src/api";
import Routes from "src/router/routes";
import {Color, Constants, Icon, Strings, ThemeUtils, showErrorSnackBar} from "src/utils";

const EMPTY_ADDRESSES = require('src/assets/images/empty_address.png');

class MyAddress extends Component {

    //Server Request
    getAddressList = () => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id
            };
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_ADDRESS)
            .reqURL(ApiURL.getAddress)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    deleteAddressRequest = (item) => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id,
                "address_id": item.id,
            };
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_DELETE_ADDRESS)
            .reqURL(ApiURL.deleteAddressRequest)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    verifyAddressRequest = (item) => {
        this.setState({isLoaderVisible: true});
        let params = null;
        if (this.props.user) {
            params = {
                "customer_id": this.props.user.customer_id,
                "address_id": item.id,
            };
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_VERIFY_ADDRESS)
            .reqURL(ApiURL.addressVerify)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ADDRESS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            this.setState({addresses: response.data.address});
                        }
                        break
                }
                break;
            case API_DELETE_ADDRESS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            this.getAddressList();
                        }
                        break
                }
                break;

            case API_VERIFY_ADDRESS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        let params = {
                            type: Constants.VerifyCodeType.ADDRESS_MOBILE,
                            addressData: this.currentSelectedAddress,
                            isFromRoute:Routes.MyAddress
                        };
                        if (this.props.navigation.state && this.props.navigation.state.params) {
                            if (this.props.navigation.state.params.isFromCheckout) {
                                params.isFromCheckout = true;
                                params.toRoute = Routes.Checkout;
                            }

                            if (this.props.navigation.state.params.isFromRoute) {
                                params.isFromRoute = this.props.navigation.state.params.isFromRoute;
                            }
                        }
                        this.props.navigation.navigate(Routes.VerifyAddress,params);
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ADDRESS:
                if (error.meta && error.meta.message) {
                    this.setState({addresses: []})
                }
                break;
        }
    };


    //User InterAction
    onClickEdit = (item) => {
        this.props.navigation.navigate(Routes.SearchAddressMap, {userAddress: item});
        // this.props.navigation.navigate(Routes.EditAddress, {userAddress: item})
    };

    onClickVerifyMobile = (item) => {
        if (!item.is_telephone_approved) {
            this.verifyAddressRequest(item);
            this.currentSelectedAddress = item;
        }
    };

    onClickDelete = (item) => {
        Alert.alert(
            this.props.localeStrings.areUSure,
            this.props.localeStrings.deleteAddress,
            [
                {
                    text: this.props.localeStrings.cancel,
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel',
                },
                {text: this.props.localeStrings.ok, onPress: () => this.deleteAddressRequest(item)},
            ]
        );
    };

    onClickAddNewAddress = () => {
        let params = {};
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.isFromCheckout) {
                params.isFromCheckout = true;
                params.toRoute = Routes.Checkout;
            }

            if (this.props.navigation.state.params.isFromRoute) {
                params.isFromRoute = this.props.navigation.state.params.isFromRoute;
            }
        }
        // this.props.navigation.navigate(Routes.AddNewAddress, params)
        this.props.navigation.navigate(Routes.SearchAddressMap);
    };

    emptyAddressStyle = () => {
        if (!this.state.addresses?.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };


    //UI Methods
    renderItems = (index, item) => {

        console.log('get item',item)
        return (
            <View style={{marginBottom: 10}}>
                <View style={styles.addressBox}>
                    <Label nunito_bold large color={Color.TEXT_DARK} style={styles.addressLabel}>{item.fullname}</Label>
                    <Label xsmall color={Color.TEXT_DARK}>{item.fulladdress}</Label>
                      
                       <View style={styles.mobileContainer}>
                            <Label xsmall color={Color.TEXT_DARK}>{I18nManager.isRTL ?
                            ` ${item.telephone}-${Constants?.CountryCode}+ `:
                            ` +${Constants?.CountryCode}-${item.telephone}`}
                            </Label>
                        {/* <TouchableOpacity 
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  disabled={item.is_telephone_approved}
                                  onPress={() => this.onClickVerifyMobile(item)}>
                                <Label color={item.otp_verify == 1 ? Color.GREEN : Color.RED}
                                 xsmall
                           ms={8}>
                        {item.otp_verify == 1 ? this.props.localeStrings.verified : this.props.localeStrings.verifyMobile}
                    </Label>
                </TouchableOpacity> */}
                </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                                  activeOpacity={0.7}
                                  style={styles.deleteLabel}
                                  underlayColor={Color.TRANSPARENT}
                                  onPress={() => this.onClickEdit(item)}>
                            <Label nunito_bold small color={Color.PRIMARY} >{this.props.localeStrings.edit}</Label>
                        </TouchableOpacity>
                        <TouchableOpacity
                        style={styles.deleteLabel}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  onPress={() => this.onClickDelete(item)}>
                                <Label nunito_bold small color={Color.PRIMARY} >{this.props.localeStrings.delete}</Label>
                    </TouchableOpacity>
                        </View>
                </View>
                {/* {this.renderBottomSection(index, item)} */}
            </View>

        )
    };

    renderBottomSection = (index, item) => {
        return (
            <View style={styles.itemBottomMain}>
                <TouchableOpacity style={styles.verifyItemButton}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  disabled={item.is_telephone_approved}
                                  onPress={() => this.onClickVerifyMobile(item)}>
                    <Icon name={item.is_telephone_approved ? "verify_phone_no" : "warning"}
                          style={{marginVertical: 15}}
                          size={ThemeUtils.fontSmall}
                          color={item.otp_verify == 1 ? Color.GREEN : Color.RED}/>
                    <Label color={Color.TEXT_DARK}
                           xsmall
                           mt={15}
                           mb={15}
                           ms={8}>
                        {item.otp_verify == 1 ? this.props.localeStrings.verified : this.props.localeStrings.verifyMobile}
                    </Label>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemButton}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  onPress={() => this.onClickEdit(item)}>
                    <Icon name={"edit"}
                          style={{marginVertical: 15}}
                          size={ThemeUtils.fontXSmall}
                          color={Color.TEXT_DARK}/>
                    <Label color={Color.TEXT_DARK}
                           xsmall
                           mt={15}
                           mb={15}
                           ms={8}>
                        {this.props.localeStrings.edit}
                    </Label>
                </TouchableOpacity>
                <TouchableOpacity style={styles.itemButton}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  onPress={() => this.onClickDelete(item)}>
                    <Icon name={"delete"}
                          style={{marginVertical: 15}}
                          size={ThemeUtils.fontXSmall}
                          color={Color.TEXT_DARK}/>
                    <Label color={Color.TEXT_DARK}
                           xsmall
                           mt={15}
                           mb={15}
                           ms={8}>
                        {this.props.localeStrings.delete}
                    </Label>
                </TouchableOpacity>
            </View>
        )
    };

    renderAddNewAddress = () => {
        return (
            <View style={styles.addressButtonView}>
                <RoundButton
                    width={ThemeUtils.relativeWidth(90)}
                    backgroundColor={Color.PRIMARY}
                    mt={20}
                    mb={10}
                    border_radius={5}
                    btnPrimary
                    textColor={Color.WHITE}
                    click={this.onClickAddNewAddress}>
                    {this.props.localeStrings.navNewAddress}
                </RoundButton>
            </View>
        )
    };

    renderEmptyView = () => {
        return !this.state.isLoaderVisible ? (
            <View style={{
                alignItems: 'center',
            }}>
                <View style={{
                    width: ThemeUtils.relativeWidth(30),
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Image
                        source={EMPTY_ADDRESSES}
                        style={{flex: 1}}
                        resizeMode={'contain'}/>
                </View>
                <Label align="center"
                       normal color={Color.TEXT_DARK}
                       nunito_medium
                       mt={15}
                       mb={15}>
                    {this.props.localeStrings.noAddress}
                </Label>
            </View>) : null
    };

    //Lifecyle Methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            title: "myAddress",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoaderVisible: false,
            addresses: []
        };
        this.currentSelectedAddress = null;
        this.is_refocused = false;
    };

    componentDidMount() {
        // this.getAddressList();
    };

    componentDidUpdate(prevProps, prevState) {
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onDidFocus={payload => {
                        this.getAddressList();
                    }}
                />
                <FlatList
                    data={this.state.addresses}
                    renderItem={
                        ({index, item}) => this.renderItems(index, item)
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoaderVisible}
                            onRefresh={this.getAddressList}
                        />}
                    keyExtractor={item => `${item.address_id}`}
                    contentContainerStyle={this.emptyAddressStyle()}
                    ListFooterComponent={this.renderAddNewAddress}
                    ListEmptyComponent={this.renderEmptyView}
                />
            </View>
        );
    };
}

const mapDispatchToProps = (dispatch) => {
    return {}
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyAddress);

import React, {Component} from 'react';
import {
    Alert,
    View,
    Image,
    TextInput,
    TouchableOpacity,
    I18nManager,
    PanResponder, BackHandler,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {NavigationActions, NavigationEvents, StackActions} from "react-navigation";
import Spinner from "react-native-loading-spinner-overlay";
import AutoHeightWebView from 'react-native-autoheight-webview'

//Custom component
import {
    Label,
    CustomNavigationHeader,
    RoundButton,
    RadioComponent,
    Hr
} from 'src/component';

//Utility
import {
    API_CHECKOUT_CART,
    API_APPLY_COUPON_CODE,
    API_APPLY_GIFT_CODE,
    API_PAYMENT_STATUS,
    APIRequest, ApiURL
} from "src/api";
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
    showSuccessSnackBar, AdjustAnalyticsService

} from "src/utils";
import Routes from "src/router/routes";
import PaymentWebView from "src/screens/PaymentWebView";

const VISA_LOGO = require('src/assets/images/logo_assets/visa_logo.png');
const MASTER_LOGO = require('src/assets/images/logo_assets/mastercard_logo.png');
const MADA_LOGO = require('src/assets/images/logo_assets/mada_logo.png');
const COD_LOGO = require('src/assets/images/logo_assets/cod.png');
const SADAD_LOGO = require('src/assets/images/logo_assets/sadad_logo.png');

class Checkout extends Component {

    //Server request
    checkoutCartRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
        };

        if (this.state.selectedAddressId) {
            params['address_id'] = this.state.selectedAddressId;
        }
        if (this.state.selectedPaymentId) {
            params['payment_method'] = this.state.selectedPaymentId;
        }
        if (this.state.selectedShippingId) {
            params['shipping_method'] = this.state.selectedShippingId;
        }
        if (this.state.userConfirmed) {
            params['order_confirm'] = true
        }
        if (this.state.couponCode && this.state.couponCodeApplied) {
            params['coupon'] = this.state.couponCode
        }
        if (this.state.giftCode && this.state.giftCodeApplied) {
            params['voucher'] = this.state.giftCode
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_CHECKOUT_CART)
            .reqURL(ApiURL.checkoutCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    applyCouponRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
            "coupon": this.state.couponCode
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_APPLY_COUPON_CODE)
            .reqURL(ApiURL.applyCoupon)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    applyGiftCodeRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "customer_id": this.props.user.customer_id,
            "voucher": this.state.giftCode
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_APPLY_GIFT_CODE)
            .reqURL(ApiURL.applyGiftCode)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    paymentStatusRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        new APIRequest.Builder()
            .get()
            .setReqId(API_PAYMENT_STATUS)
            .reqURL(`${ApiURL.getPaymentStatus}&tap_id=${this.state.paymentRefID}`)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false,
        });
        switch (reqId) {
            case API_CHECKOUT_CART:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            if (this.state.userConfirmed && (response.data.success)) {
                                if (response.data.success && response.data.success.url) {
                                    this.setState({
                                        paymentModalVisible: true,
                                        paymentHref: response.data.success.url
                                    })
                                } else {
                                    this.addRevenueEvent();
                                    showSuccessSnackBar(response.data.success.message);
                                    this.redirectBack()
                                }

                            } else {
                                let {
                                    addresses = [],
                                    shipping_method = null,
                                    payment_method = null,
                                    totals = [],
                                    coupon = null,
                                    voucher = null,
                                    confirm_order
                                } = response.data;

                                this.setState({
                                    userAddresses: addresses,
                                    paymentMethods: payment_method,
                                    shippingMethods: shipping_method,
                                    totals,
                                    enableBtn: confirm_order,
                                    couponCode: coupon ? coupon.code.trim() : null,
                                    giftCode: voucher ? voucher.code.trim() : null,
                                }, () => {
                                    if (this.isFirstTimeAPI) {
                                        this.setSelectedData();
                                        this.isFirstTimeAPI = false;
                                    }
                                });
                            }
                        }
                        break
                }
                break;
            case API_APPLY_COUPON_CODE:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            showSuccessSnackBar(response.data.success.message);
                            this.setState({
                                couponCodeApplied: true
                            }, () => {
                                this.checkoutCartRequest()
                            })
                        }
                        break
                }
                break;
            case API_APPLY_GIFT_CODE:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            showSuccessSnackBar(response.data.success.message);
                            this.setState({
                                giftCodeApplied: true
                            }, () => {
                                this.checkoutCartRequest()
                            })
                        }
                        break
                }
                break;
            case API_PAYMENT_STATUS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        console.log(response);
                        if (response.data.success) {
                            this.addRevenueEvent();
                            showSuccessSnackBar(response.data.success.message);
                            this.redirectBack();
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
                    showErrorSnackBar(error.meta.message)
                }
                break;
            case API_APPLY_COUPON_CODE:
                if (error && error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
            case API_APPLY_GIFT_CODE:
                if (error && error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
            case API_PAYMENT_STATUS:
                if (error && error.meta && error.meta.message) {
                    setTimeout(() => {
                        Alert.alert('',
                            error.meta.message, [
                                {
                                    text: this.props.localeStrings.ok, onPress: () => {
                                        console.log('dismissed')
                                    }
                                }
                            ])
                    }, 250);
                }
                break;
        }

    };

    //Utility
    getPaymentIcon = (method_id) => {
        switch (method_id) {
            case 'cod':
                return (
                    <Image
                        source={COD_LOGO}
                        style={{width: 30, height: 30}}
                        resizeMode={'contain'}
                    />);

            case 'bank_transfer':
                return (<Icon name={'bank_transfer'}
                              size={20}
                              color={Color.TEXT_DARK}/>);

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
                    </View>);
            case 'tap-mada':
                return (
                    <Image
                        source={MADA_LOGO}
                        style={{width: 40, height: (40 * 65) / 199}}
                        resizeMode={'contain'}
                    />);

            case 'paytabs':
                return (
                    <Image
                        source={VISA_LOGO}
                        style={{width: 20, aspectRatio: 2}}
                        resizeMode={'contain'}
                    />);

            case 'sadad':
                return (
                    <Image
                        source={SADAD_LOGO}
                        style={{width: 20, aspectRatio: 2}}
                        resizeMode={'contain'}
                    />);
            default:
                return (<Icon name={'bank_transfer'}
                              size={20}
                              color={Color.TEXT_DARK}/>);
        }
    };

    getDefaultSelected = (array = []) => {
        if (Array.isArray(array) && array.length > 0) {
            let defaultItemIdx = array.findIndex(item => (item.default && item.default === true))
            if (defaultItemIdx !== -1) return defaultItemIdx;
        }
        return 0
    };

    setSelectedData = () => {
        let isSelectedChanged = false;
        if (Array.isArray(this.state.userAddresses)) {
            for (let i = 0; i < this.state.userAddresses.length; i++) {
                if (this.state.userAddresses[i].selected === true) {
                    this.setState({
                        selectedAddressId: this.state.userAddresses[i].address_id,
                        selectedAddressIndex: i
                    });
                    isSelectedChanged = true;
                    break;
                }
            }
        }

        if (this.state.paymentMethods) {
            for (let key in this.state.paymentMethods) {
                if (this.state.paymentMethods[key].selected === true) {
                    this.setState({selectedPaymentId: this.state.paymentMethods[key].method_id});
                    isSelectedChanged = true;
                    break;
                }
            }
        }

        if (this.state.shippingMethods) {
            for (let key in this.state.shippingMethods) {
                if (this.state.shippingMethods[key].selected === true) {
                    this.setState({selectedShippingId: this.state.shippingMethods[key].shipping_id});
                    isSelectedChanged = true;
                    break;
                }
            }
        }

        if (isSelectedChanged) {
            this.checkoutCartRequest()
        }
    };

    parseAPIData = (data) => {
        let exists = false;
        if (Array.isArray(data) && data.length > 0) {
            exists = true
        } else if (!Array.isArray(data) && data !== null && data !== undefined) {
            exists = true
        }
        return exists
    };

    handleHardwareBack = () => {
        BackHandler.removeEventListener("CheckoutBack", this.handleHardwareBack);
        this.redirectBack();
        return true;
    };

    redirectBack = () => {
        let redirectRoute = this.props.navigation.getParam('isFromRoute', null);
        if (redirectRoute) {
            this.props.navigation.navigate(redirectRoute)
        } else {
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                key: undefined,
                actions: [
                    NavigationActions.navigate({routeName: Routes.MainTabs}),
                ]
            }));
        }
    };

    onPaymentModalClose = (refID) => {
        this.setState({
            paymentModalVisible: false,
            paymentRefID: refID
        }, () => {
            if (refID) {
                setTimeout(() => {
                    this.paymentStatusRequest()
                }, 250)
            }
        })
    };

    addRevenueEvent = () => {
        let total = this.state.totals && this.state.totals.length > 0 ?
            this.state.totals.find(item => item.title === this.props.localeStrings.total || item.title === 'الاجمالي النهائي') : null;
        if (total && total.text) {
            let amount = total.text.replace('SR', "").trim();
            amount = amount ? parseFloat(amount) : 0.0;
            console.log(amount);
            AdjustAnalyticsService.revenueEvent(amount);
        }
    };

    //User Interaction
    onSelectAddress = (index, value) => {
        if (value && value !== this.state.selectedAddressId) {
            this.setState({
                selectedAddressId: value,
                selectedAddressIndex: index
            }, () => {
                this.checkoutCartRequest()

            });
        }
    };

    onSelectPayment = (index, value) => {
        if (value && value !== this.state.selectedPaymentId) {
            switch (value) {
                case 'paytabs':
                    Alert.alert(this.props.localeStrings.information,
                        this.props.localeStrings.cardPaymentError,
                        [{
                            text: this.props.localeStrings.ok, onPress: () => {
                            }
                        }]
                    );
                    break;

                case 'bank_transfer':
                    Alert.alert(this.props.localeStrings.information,
                        this.props.localeStrings.bankTransferInfo,
                        [{
                            text: this.props.localeStrings.ok, onPress: () => {
                                this.setState({
                                    selectedPaymentId: value
                                }, () => {
                                    setTimeout(() => {
                                        this.checkoutCartRequest()
                                    }, 500);
                                });
                            }
                        }, {
                            cancelable: false
                        }]
                    );
                    break;
                default:
                    this.setState({
                        selectedPaymentId: value
                    }, () => {
                        this.checkoutCartRequest()
                    });
                    break;
            }
        }
    };

    onSelectShipping = (index, value) => {
        if (value) {
            this.setState({
                selectedShippingId: value
            }, () => {
                this.checkoutCartRequest()
            });
        }
    };

    onClickAddNewAddress = () => {
        this.props.navigation.navigate(Routes.AddNewAddress, {
            isFromCheckout: true,
            isFromRoute: this.props.navigation.state.routeName,
            toRoute: this.props.navigation.state.routeName
        });
    };

    onClickApplyCoupon = () => {
        // this.setState(prevState => ({couponCodeApplied: !prevState.couponCodeApplied}))
        if (this.state.couponCodeApplied) {
            this.setState({
                couponCodeApplied: false,
                couponCode: ''
            }, () => {
                this.checkoutCartRequest()
            })
        } else if (this.state.couponCode) {
            this.applyCouponRequest()
        }
    };

    onClickApplyGift = () => {
        // this.setState(prevState => ({giftCodeApplied: !prevState.giftCodeApplied}))
        if (this.state.giftCodeApplied) {
            this.setState({
                giftCodeApplied: false,
                giftCode: ''
            }, () => {
                this.checkoutCartRequest()
            })
        } else if (this.state.giftCode) {
            this.applyGiftCodeRequest()
        }
    };

    onClickConfirmOrder = () => {

        //analytics
        AdjustAnalyticsService.confirmEvent();

        Alert.alert(
            null,
            this.props.localeStrings.placeOrderConfirmMessage,
            [{
                text: this.props.localeStrings.yes,
                onPress: () => {
                    this.setState({userConfirmed: true}, () => {
                        this.checkoutCartRequest()
                    })
                }
            }, {
                text: this.props.localeStrings.no,
                onPress: () => {
                }
            }])
    };

    //UI methods
    renderAddressSection = () => {
        return (
            <View style={styles.sectionBlock}>
                <Label small
                       color={Color.TEXT_DARK}
                       mt={10}
                       mb={10}>
                    {this.props.localeStrings.chooseDeliveryAddress}
                </Label>
                {this.state.userAddresses.length > 0 &&
                <RadioComponent.RadioGroup
                    onSelect={this.onSelectAddress}
                    selectedIndex={this.state.selectedAddressIndex}
                    color={Color.PRIMARY}>
                    {this.state.userAddresses.map((address, idx) => (
                        <RadioComponent.RadioButton value={address.address_id}
                                                    key={`${idx}`}>
                            <View style={styles.addressBox}>
                                <Label nunito_bold large color={Color.TEXT_DARK}
                                       style={styles.addressLabel}>{address.fullname}</Label>
                                {address.address_label ?
                                    <View style={styles.tagBoxView}>
                                        <Label xsmall color={Color.WHITE}>{address.address_label}</Label>
                                    </View> : null
                                }
                                <Label small color={Color.TEXT_LIGHT}
                                       style={styles.addressLabel}>{address.street_name}</Label>
                                <Label small color={Color.TEXT_LIGHT}
                                       style={styles.addressLabel}>{address.zone}</Label>
                                <Label small color={Color.TEXT_LIGHT}
                                       style={styles.addressLabel}>{address.country}</Label>
                                <Label small color={Color.TEXT_LIGHT}
                                       style={styles.addressLabel}>{this.props.localeStrings.mobile}:+{address.telephone}</Label>
                            </View>
                        </RadioComponent.RadioButton>
                    ))}
                </RadioComponent.RadioGroup>
                }
                <View style={{
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
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
        )
    };

    renderPaymentsSection = () => {
        return (
            <View style={styles.sectionBlock}>
                <Label small
                       color={Color.TEXT_DARK}
                       mb={10}>
                    {this.props.localeStrings.paymentMethodTitle}
                </Label>
                {this.parseAPIData(this.state.paymentMethods) ?
                    <RadioComponent.RadioGroup
                        onSelect={this.onSelectPayment}
                        showSeparator={true}
                        separatorStyle={styles.radioSeparator}
                        color={Color.PRIMARY}>
                        {this.renderPaymentOptions()}
                    </RadioComponent.RadioGroup> :
                    <View/>
                }
            </View>
        )
    };

    renderPaymentOptions = () => {
        let options = [];
        for (let method_id in this.state.paymentMethods) {
            let method = this.state.paymentMethods[method_id];
            let methodTitle =
                /* this.props.langCode === Constants.API_LANGUAGES.EN ?
                 this.paymentStaticTypes[method_id].name :
                 this.paymentStaticTypes[method_id].name_ar;*/
                this.props.localeStrings[method_id] ?
                    this.props.localeStrings[method_id] :
                    Strings[method_id];

            options.push(
                <RadioComponent.RadioButton
                    style={{
                        marginVertical: 5,
                        alignItems: 'center'
                    }}
                    value={method.code}
                    key={`${method_id}`}>
                    <View style={{flex: 1}}>
                        <View style={styles.paymentOptionContainer}>
                            <View style={{alignItems: 'flex-start', paddingEnd: 10}}>
                                <Label small color={Color.TEXT_DARK}>
                                    {methodTitle}
                                </Label>
                            </View>
                            <View style={{alignItems: 'center', marginHorizontal: 5}}>
                                {this.getPaymentIcon(method_id)}
                            </View>
                        </View>
                        {method_id === 'bank_transfer' && this.state.selectedPaymentId === 'bank_transfer' ?
                            <View style={{marginVertical: 10}}>
                                <AutoHeightWebView
                                    style={{width: ThemeUtils.relativeWidth(80)}}
                                    source={{html: `<html><meta name="viewport" content="width=device-width, initial-scale=1.0">${this.state.paymentMethods[method_id]['bank_transfer']}</html>`}}
                                    zoomable={false}
                                />
                            </View> : null

                        }
                        {method_id === 'cod' && this.state.selectedPaymentId === 'cod' ?
                            <Label color={Color.TEXT_LIGHT}
                                   small
                                   mt={10}>
                                {this.state.paymentMethods[method_id].title}
                            </Label> : null
                        }
                    </View>
                </RadioComponent.RadioButton>
            )
        }
        return options
    };

    renderShippingSection = () => {
        return (
            <View style={styles.sectionBlock}>
                <Label small
                       color={Color.TEXT_DARK}
                       mb={10}>
                    {this.props.localeStrings.shippingMethodTitle}
                </Label>
                {this.parseAPIData(this.state.shippingMethods) ?
                    <RadioComponent.RadioGroup
                        onSelect={this.onSelectShipping}
                        showSeparator={true}
                        separatorStyle={styles.radioSeparator}
                        color={Color.PRIMARY}>
                        {this.renderShippingOptions()}
                    </RadioComponent.RadioGroup> :
                    <View/>
                }
            </View>
        )
    };

    renderShippingOptions = () => {
        let options = [];
        for (let method_id in this.state.shippingMethods) {
            if ("quote" in this.state.shippingMethods[method_id]
                && this.state.shippingMethods[method_id]["quote"] !== null
                && this.state.shippingMethods[method_id]["quote"] !== undefined
            ) {
                for (let quote_id in this.state.shippingMethods[method_id]["quote"]) {
                    let method = this.state.shippingMethods[method_id]["quote"][quote_id];
                    let methodTitle = "",
                        costText = null;
                    if (method.title !== "") {
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
                                <Label small color={Color.TEXT_DARK}
                                       style={styles.addressLabel}>
                                    {methodTitle}
                                </Label>
                                {costText ?
                                    <Label small
                                           ms={5}
                                           color={Color.TEXT_LIGHT}
                                           style={styles.addressLabel}>
                                        {`(${costText})`}
                                    </Label> : null
                                }
                            </View>
                        </RadioComponent.RadioButton>
                    )
                }
            }
        }
        return options
    };

    renderCouponSection = () => {
        return (
            <View style={styles.sectionBlock}>
                <View style={{marginVertical: 10}}>
                    <Label small
                           color={Color.TEXT_DARK}
                           mb={10}>
                        {this.props.localeStrings.couponCode}
                    </Label>
                    <View style={styles.couponCodeContainer}>
                        <Icon name={'coupon_code'}
                              size={20}
                              color={Color.PRIMARY}/>
                        <TextInput style={[styles.couponInput, {
                            borderColor: this.state.couponCode ? Color.PRIMARY : Color.LIGHT_GRAY,
                            textAlign: !this.state.couponCode && !this.state.couponCodeFocused ?
                                'center' :
                                (I18nManager.isRTL ? 'right' : 'left')
                        }]}
                                   numberOfLines={1}
                                   placeholder={this.props.localeStrings.couponCodePlaceholder}
                                   placeholderTextColor={Color.TEXT_LIGHT}
                                   onChangeText={(text) => this.setState({couponCode: text})}
                                   value={this.state.couponCode}
                                   editable={!this.state.couponCodeApplied}
                                   onFocus={() => {
                                       this.setState({couponCodeFocused: true})
                                   }}
                                   onBlur={() => {
                                       this.setState({couponCodeFocused: false})
                                   }}/>
                        <View>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(25)}
                                backgroundColor={
                                    this.state.couponCode ?
                                        Color.PRIMARY : Color.LIGHT_GRAY
                                }
                                disabled={!this.state.couponCode}
                                border_radius={5}
                                btn_sm
                                textColor={Color.WHITE}
                                click={this.onClickApplyCoupon}>
                                {this.state.couponCodeApplied ? this.props.localeStrings.remove : this.props.localeStrings.applyString}
                            </RoundButton>
                        </View>
                    </View>
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
                <View style={{marginVertical: 10}}>
                    <Label small
                           color={Color.TEXT_DARK}
                           mb={10}>
                        {this.props.localeStrings.giftCode}
                    </Label>
                    <View style={styles.couponCodeContainer}>
                        <Icon name={'gift_code'}
                              size={20}
                              color={Color.PRIMARY}/>
                        <TextInput style={[styles.couponInput, {
                            borderColor: this.state.giftCode ? Color.PRIMARY : Color.LIGHT_GRAY,
                            textAlign: !this.state.giftCode && !this.state.giftCodeFocused ?
                                'center' :
                                (I18nManager.isRTL ? 'right' : 'left')
                        }]}
                                   placeholder={this.props.localeStrings.giftCodePlaceholder}
                                   numberOfLines={1}
                                   placeholderTextColor={Color.TEXT_LIGHT}
                                   onChangeText={(text) => this.setState({giftCode: text})}
                                   editable={!this.state.giftCodeApplied}
                                   value={this.state.giftCode}
                                   onFocus={() => {
                                       this.setState({giftCodeFocused: true})
                                   }}
                                   onBlur={() => {
                                       this.setState({giftCodeFocused: false})
                                   }}/>
                        <View>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(25)}
                                backgroundColor={
                                    this.state.giftCode ?
                                        Color.PRIMARY : Color.LIGHT_GRAY
                                }
                                disabled={!this.state.giftCode}
                                border_radius={5}
                                btn_sm
                                textColor={Color.WHITE}
                                click={this.onClickApplyGift}>
                                {this.state.giftCodeApplied ? this.props.localeStrings.remove : this.props.localeStrings.applyString}
                            </RoundButton>
                        </View>
                    </View>
                </View>
            </View>
        )
    };

    renderFinalPriceSection = () => {
        let total = this.state.totals && this.state.totals.length > 0 ?
            this.state.totals.find(item => item.title === this.props.localeStrings.total || item.title === 'الاجمالي النهائي') : null;
        let filtered = this.state.totals && this.state.totals.length > 0 ?
            this.state.totals.filter(item => item.title !== this.props.localeStrings.total && item.title !== 'الاجمالي النهائي') : [];

        return (
            <View style={styles.sectionBlock}>
                <Label small
                       color={Color.TEXT_DARK}
                       mt={10}
                       mb={10}>
                    {this.props.localeStrings.orderSummery}
                </Label>
                {filtered && filtered.length > 0 ? filtered.map(costType => costType.title ? (
                    <View
                        key={`${costType.title}`}
                        style={styles.costTypeContainer}>
                        <Label color={Color.TEXT_LIGHT}
                               small>
                            {costType.title}
                        </Label>
                        <Label color={Color.TEXT_DARK}
                               small>
                            {costType.text}
                        </Label>
                    </View>
                ) : null) : null}
                <Hr lineStyle={styles.lineSeparator}/>
                {total ?
                    <View style={styles.costTypeContainer}>
                        <Label color={Color.TEXT_DARK}
                               nunito_medium>
                            {total.title}
                        </Label>
                        <Label color={Color.TEXT_DARK}
                               nunito_medium>
                            {total.text}
                        </Label>
                    </View> : null}
            </View>
        )
    };


    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let backHandler = navigation.getParam('backHandler', null);
        return {
            title: "navCheckout",
            header: (props) => <CustomNavigationHeader {...props}
                                                       titleCenter={true}
                                                       showRightButton={false}
                                                       btnLeftHandler={backHandler}
                                                       isMainTitle={false}/>
        }
    };

    constructor(props) {
        super(props);

        let checkoutParams = this.props.navigation.getParam('checkoutParams', {});
        let {
            addresses = [],
            shipping_method = null,
            payment_method = null,
            totals = [],
            coupon = [],
            voucher = [],
            confirm_order
        } = checkoutParams;

        this.state = {
            userAddresses: addresses,
            paymentMethods: payment_method,
            shippingMethods: shipping_method,
            totals,
            couponCode: "",
            couponCodeApplied: false,
            giftCode: "",
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
        };

        this.paymentStaticTypes = {
            'cod': {
                name: 'Cash on Delivery',
                name_ar: 'الدفع عند الاستلام'
            },
            'bank_transfer': {
                name: 'Bank Transfer',
                name_ar: 'التحويل المصرفي'
            },
            'tap-card': {
                name: 'Credit or Debit Card',
                name_ar: 'البطاقة الإئتمانيه'
            },
            'tap-mada': {
                name: 'MADA Payment',
                name_ar: 'بطاقة مدى'
            }
        };

        this._panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => {
                this.setState({
                    enableScrollViewScroll: true,
                    showCountryDropdown: false,
                    showStateDropdown: false,
                });
                return false;
            }
        });

        this.isFirstTimeAPI = true;
    }

    componentDidMount() {
    }

    componentWillMount() {
        let redirectRoute = this.props.navigation.getParam('isFromRoute', null);
        if (redirectRoute) {
            BackHandler.addEventListener("CheckoutBack", this.handleHardwareBack);
            this.props.navigation.setParams({
                backHandler: this.handleHardwareBack
            });
        }

    }

    componentWillUnmount() {
        BackHandler.removeEventListener("CheckoutBack", this.handleHardwareBack);
    }

    render() {
        return (
            <View style={CommonStyle.safeArea}
                  {...this._panResponder.panHandlers}>
                <NavigationEvents
                    onDidFocus={payload => {
                        this.checkoutCartRequest();
                    }}
                />
                <Spinner visible={this.state.isLoaderVisible}/>
                <PaymentWebView isOpen={this.state.paymentModalVisible}
                                href={this.state.paymentHref}
                                onClose={this.onPaymentModalClose}/>
                <KeyboardAwareScrollView
                    innerRef={ref => {
                        this.scrollView = ref
                    }}
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={this.state.enableScrollViewScroll}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.container}>
                    {this.renderAddressSection()}
                    {this.renderPaymentsSection()}
                    {this.renderShippingSection()}
                    {this.renderCouponSection()}
                    {this.renderFinalPriceSection()}
                    <View style={CommonStyle.contentVerticalBottom}>
                        <TouchableOpacity style={[CommonStyle.bottomContainer,
                            {backgroundColor: this.state.enableBtn ? Color.PRIMARY : Color.GRAY}]}
                                          activeOpacity={0.8}
                                          underlayColor={Color.TRANSPARENT}
                                          disabled={!this.state.enableBtn}
                                          onPress={this.onClickConfirmOrder}>
                            <Label color={Color.WHITE}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   ms={5}>
                                {this.props.localeStrings.confirmOrder}
                            </Label>
                        </TouchableOpacity>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Checkout)

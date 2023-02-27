import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    I18nManager,
    View,
    DeviceEventEmitter,
    Image,
    ScrollView,
    FlatList, BackHandler, RefreshControl,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import AutoHeightWebView from "react-native-autoheight-webview";
import {NavigationActions, StackActions} from "react-navigation";

//Custom component
import {
    Label,
    RoundButton,
    CustomNavigationHeader,
    Hr,
    CancelReasonPopUp,
    Ripple
} from "src/component";

//Utility
import Action from "src/redux/action";
import {
    API_GET_ORDER_DETAIL,
    API_ORDER_CANCEL,
    API_RETURN_ORDER_DETAIL,
    APIRequest,
    ApiURL
} from "src/api";
import {
    Color,
    ThemeUtils,
    Constants,
    Strings,
    Icon,
    decodeImageUrl,
    IS_IOS,
    isHexValid,
    showErrorSnackBar,
    showSuccessSnackBar,
    numberWithCommas
} from "src/utils";
import styles from "./styles";
import Routes from "src/router/routes";

//Assets
const VISA_LOGO = require('src/assets/images/logo_assets/visa_logo.png');
const SADAD_LOGO = require('src/assets/images/logo_assets/sadad_logo.png');

class OrderDetail extends Component {

    //Server request
    getOrderDetailRequest = (refreshing = false) => {
        this.setState({isLoaderVisible: !refreshing, refreshLoader: refreshing});
        let params = {
            "customer_id": this.props.user.customer_id,
        };

        if (this.state.orderData && this.state.orderData.order_id) {
            params["order_id"] = this.state.orderData.order_id;
        }

        if (this.state.notificationId !== null && this.state.notificationId !== undefined) {
            params["notification_id"] = this.state.notificationId
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_ORDER_DETAIL)
            .reqURL(ApiURL.getOrderDetail)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    getReturnOrderDetail = (refreshing = false) => {
        this.setState({isLoaderVisible: !refreshing, refreshLoader: refreshing});
        let params = {
            "customer_id": this.props.user.customer_id,
        };
        if (this.state.orderData && this.state.orderData.return_id) {
            params["return_id"] = this.state.orderData.return_id;
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_RETURN_ORDER_DETAIL)
            .reqURL(ApiURL.getReturnOrderDetail)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    }

    orderCancelRequest = () => {
        this.setState({isLoaderVisible: true, refreshLoader: false});
        let params = {
            "customer_id": this.props.user.customer_id,
            "order_id": this.state.orderData.order_id,
            "reason_id": this.state.selectedReasonId,
        };

        if (this.state.reasonText) {
            params["comment"] = this.state.reasonText;
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_ORDER_CANCEL)
            .reqURL(ApiURL.orderCancel)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false, refreshLoader: false});
        switch (reqId) {
            case API_GET_ORDER_DETAIL:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            this.setState({orderDetail: response.data})
                        }
                        break
                }
                break;
            case API_RETURN_ORDER_DETAIL:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data.return) {
                            this.setState({orderDetail: response.data.return})
                        }
                        break
                }
                break;
            case API_ORDER_CANCEL:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            let listType = this.props.navigation.getParam('currentOrderType', null);
                            if (listType) {
                                DeviceEventEmitter.emit(Constants.APP_EVENTS.ORDER_DETAIL_UPDATE, {listType});
                            }
                            this.props.navigation.pop();
                            if (response.data.success && response.data.success.message) {
                                showSuccessSnackBar(response.data.success.message)
                            }
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false, refreshLoader: false});
        switch (reqId) {
            case API_GET_ORDER_DETAIL:
                if (!this.state.orderDetail) {
                    this.setState({
                        errMessage: this.props.localeStrings.errOrderDetail
                    })
                }
                break;
            case API_ORDER_CANCEL:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    //User Interaction
    onClickTrackOrder = () => {
        this.props.navigation.navigate(Routes.TrackOrder, {
            orderDetail: this.state.orderDetail
        })
    };

    onClickCancelOrder = () => {
        this.setState({showCancelPopUp: true})
    };

    onClickReturnOrder = () => {
        DeviceEventEmitter.addListener(Constants.APP_EVENTS.RETURN_SUCCESS, this.handleBackFromReturnOrder);
        this.props.navigation.navigate(Routes.ReturnOrder, {
            orderData: this.state.orderData
        });
    };

    onCloseCancelPopUp = () => {
        this.setState({showCancelPopUp: false})
    };

    onSubmitReason = (selectedReasonId, reasonText = "") => {
        this.setState({
            selectedReasonId,
            reasonText,
        }, () => {
            setTimeout(() => {
                this.orderCancelRequest()
            }, 100)
        })
    };

    backHandler = () => {
        BackHandler.removeEventListener("OrderDetailPopUpBack", this.backHandler);
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            key: undefined,
            actions: [
                NavigationActions.navigate({routeName: Routes.MainRoute}),
            ]
        }));
        return true;
    };

    onClickExpandPayment = () => {
        this.setState(prevState => ({
            paymentSeeMore: !prevState.paymentSeeMore
        }))
    };

    handleBackFromReturnOrder = () => {
        this.getOrderDetailRequest();
    };

    //Utility
    extractOptionName = (text) => {
        let opt = text.toLowerCase().replace(this.props.localeStrings.choose.toLowerCase(), '');
        opt = opt.toLowerCase().replace(this.props.localeStrings.select.toLowerCase(), '');
        opt = opt.trim();
        return I18nManager.isRTL ? text : (opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : '');
    };

    getImage = (item) => {
        if (item.image) {
            return decodeImageUrl( this.state.orderDetail.product_path+item.image)
        }
        return decodeImageUrl(this.state.orderDetail.product_path+item.thumb)
    };

    getQuantityPrice = (item) => {
        if (item.total) {
            return item.total
        }
        let priceVal = 0;
        if (item.special) {
            priceVal = parseInt(item.special.replace(/[^0-9.]/g, ''));
        } else {
            priceVal = parseInt(item.price.replace(/[^0-9.]/g, ''));
        }
        let qty = parseInt(item.quantity) || 1;

        if (!isNaN(priceVal) && !isNaN(qty)) {
            return `SR ${numberWithCommas(priceVal * qty)}`
        }
        return `SR 0`
    };


    //UI methods
    getPaymentIcon = (method_id) => {
        switch (method_id) {
            case 'cod':
                return (<Icon name={'cod'}
                              size={ThemeUtils.fontNormal}
                              color={Color.TEXT_DARK}/>);
            case 'bank_transfer':
                return (<Icon name={'bank_transfer'}
                              size={ThemeUtils.fontNormal}
                              color={Color.TEXT_DARK}/>);

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
            default :
                return (<Icon name={'bank_transfer'}
                              size={ThemeUtils.fontNormal}
                              color={Color.TEXT_DARK}/>);
        }
    };

    getPaymentTitle = (method) => {
        let methodTitle =
        /* this.props.langCode === Constants.API_LANGUAGES.EN ?
             this.paymentStaticTypes[method_id].name :
             this.paymentStaticTypes[method_id].name_ar;*/
        this.props.localeStrings[method.code]
          ? this.props.localeStrings[method.code]
          : Strings[method.code];
        switch (method.code) {
            case 'tap':
                let title = '';
                if (this.state.orderDetail && this.state.orderDetail.transaction_data && this.state.orderDetail.transaction_data.source){
                    let {payment_method='',payment_type=''}=this.state.orderDetail.transaction_data.source;
                    if(payment_type){
                        title+=`${payment_type}`
                    }
                    if(payment_method){
                        title+=` (${payment_method})`
                    }
                }
                return title;
            default:
                return methodTitle;
        }
    };

    renderOrderData = () => {
        let item = this.state.orderDetail;
        let isReturnOrder = this.state.currentOrderType && this.state.currentOrderType.type === Constants.OrderTypeReturn;

        return item ? (isReturnOrder ? this.renderReturnOrderData() :
            (<>
                    <View style={styles.blockContainer}>
                        <View style={styles.orderIdStatus}>
                            <Label small
                                   color={Color.TEXT_DARK}
                                   nunito_medium
                                   me={5}>
                                {`${this.props.localeStrings.orderID}: `}
                                <Label small
                                       color={Color.TEXT_LIGHT}
                                       nunito_regular>
                                    {`#${item.order_id}`}
                                </Label>
                            </Label>
                            <Label small
                                   color={Color.PRIMARY}
                                   nunito_medium
                                   ms={5}>
                                {item.status}
                            </Label>
                        </View>
                        {item.date_added ?
                            <Label small
                                   color={Color.TEXT_DARK}
                                   nunito_medium
                                   mt={5}
                                   mb={5}>
                                {`${this.props.localeStrings.dateAddedLabel}: `}
                                <Label small
                                       color={Color.TEXT_LIGHT}
                                       nunito_regular>
                                    {`${item.date_added}`}
                                </Label>
                            </Label> : null
                        }
                        {item.date_last_status ?
                            <Label small
                                   color={Color.TEXT_DARK}
                                   nunito_medium
                                   mt={5}
                                   mb={5}>
                                {`${this.props.localeStrings.dateStatusLabel} ${item.status.toLowerCase()} : `}
                                <Label small
                                       color={Color.TEXT_LIGHT}
                                       nunito_regular>
                                    {`${item.date_last_status}`}
                                </Label>
                            </Label> : null
                        }

                        <View style={styles.buttonContainer}>
                            <RoundButton backgroundColor={Color.PRIMARY}
                                         textColor={Color.WHITE}
                                         btn_sm
                                         width={ThemeUtils.relativeWidth(30)}
                                         border_radius={5}
                                         click={this.onClickTrackOrder}>
                                {this.props.localeStrings.trackOrder}
                            </RoundButton>
                            {item.cancel ?
                                <RoundButton backgroundColor={Color.LIGHT_WHITE}
                                             textColor={Color.TEXT_DARK}
                                             btn_xs
                                             border_radius={5}
                                             borderWidth={0.5}
                                             borderColor={Color.GRAY}
                                             width={ThemeUtils.relativeWidth(30)}
                                             ms={10}
                                             click={this.onClickCancelOrder}>
                                    {this.props.localeStrings.cancelOrder}
                                </RoundButton> : null
                            }
                            {item.return ?
                                <RoundButton backgroundColor={Color.LIGHT_WHITE}
                                             textColor={Color.TEXT_DARK}
                                             btn_xs
                                             border_radius={5}
                                             borderWidth={0.5}
                                             borderColor={Color.GRAY}
                                             width={ThemeUtils.relativeWidth(30)}
                                             ms={10}
                                             click={this.onClickReturnOrder}>
                                    {this.props.localeStrings.returnOrder}
                                </RoundButton> : null
                            }
                        </View>
                    </View>
                    <Hr lineStyle={styles.lineSeparator}/>
                </>
            )) : null
    };

    renderReturnOrderData = () => {
        let item = this.state.orderDetail;
        return (<>
                <View style={styles.blockContainer}>
                    <View style={styles.orderIdStatus}>
                        <Label small
                               color={Color.TEXT_DARK}
                               nunito_medium
                               me={5}>
                            {`${this.props.localeStrings.returnID}: `}
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   nunito_regular>
                                {`#${item.return_id}`}
                            </Label>
                        </Label>
                        <Label small
                               color={Color.PRIMARY}
                               nunito_medium
                               ms={5}>
                            {item.status}
                        </Label>
                    </View>
                    <Label small
                           color={Color.TEXT_DARK}
                           nunito_medium
                           me={5}>
                        {`${this.props.localeStrings.orderID}: `}
                        <Label small
                               color={Color.TEXT_LIGHT}
                               nunito_regular>
                            {`#${item.order_id}`}
                        </Label>
                    </Label>
                    {item.date_added ?
                        <Label small
                               color={Color.TEXT_DARK}
                               nunito_medium
                               mt={5}
                               mb={5}>
                            {`${this.props.localeStrings.dateAddedLabel}: `}
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   nunito_regular>
                                {`${item.date_added}`}
                            </Label>
                        </Label> : null
                    }
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>

        )
    };

    renderContactInfo = () => {
        let contactInfo = this.state.orderDetail ? this.state.orderDetail.contact_info : null;
        return contactInfo ? (
            <>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.orderContactInfo}
                    </Label>
                    <View style={styles.labelContainer}>
                        <Icon name={"mail"}
                              color={Color.PRIMARY}
                              size={ThemeUtils.fontNormal}
                              style={{marginEnd: 10}}/>
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={5}>
                            {contactInfo.email}
                        </Label>
                    </View>
                    <View style={styles.labelContainer}>
                        <Icon name={"call"}
                              color={Color.PRIMARY}
                              size={ThemeUtils.fontNormal}
                              style={{marginEnd: 10}}/>
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={5}>
                            {contactInfo.telephone}
                        </Label>
                    </View>
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        ) : null
    };

    renderPaymentInfo = () => {
   
        let paymentInfo = this.state.orderDetail ? this.state.orderDetail.payment_method : null;
    
        return paymentInfo ? (
            <>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.orderPaymentMethod}
                    </Label>
                    <View style={styles.paymentLabel}>
                        {this.getPaymentIcon(paymentInfo.code)}
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={10}>
                            {this.getPaymentTitle(paymentInfo)}
                        </Label>
                    </View>
                    {paymentInfo.code === 'bank_transfer' && this.state.paymentSeeMore ?
                        <View style={{flex: 1, marginVertical: 10}}>
                            <AutoHeightWebView
                                style={{width: ThemeUtils.relativeWidth(80)}}
                                source={{html: `<html><meta name="viewport" content="width=device-width, initial-scale=1.0">${paymentInfo['bank_transfer']}</html>`}}
                                zoomable={false}
                            />
                        </View> : null

                    }
                    {paymentInfo.code === 'bank_transfer' ?
                        <View style={{marginVertical: 5, alignItems: 'flex-start'}}>
                            <Ripple style={styles.squareButton}
                                    rippleContainerBorderRadius={0}
                                    onPress={this.onClickExpandPayment}>
                                <Label color={Color.BLACK}
                                       xsmall>
                                    {this.state.paymentSeeMore ?
                                        this.props.localeStrings.seeLess :
                                        this.props.localeStrings.seeMore}
                                </Label>
                            </Ripple>
                        </View> : null
                    }
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        ) : null
    };

    renderShippingInfo = () => {
        let shippingMethod = this.state.orderDetail ? this.state.orderDetail.shipping_method : null,
            shippingInfo = this.state.orderDetail ? this.state.orderDetail.shipping_address : null;

        return shippingMethod ? (
            <>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.orderShippingTitle}
                    </Label>
                    <View style={styles.shipmentLabel}>
                        <Label small
                               color={Color.TEXT_LIGHT}>
                            {shippingMethod}
                        </Label>
                    </View>
                    {shippingInfo ?
                        <>
                            <Label small
                                   mt={10}
                                   color={Color.TEXT_DARK}>
                                {this.props.localeStrings.orderShippingAddress}
                            </Label>
                            <View style={styles.addressMain}>
                                <View style={styles.addressBox}>
                                    <Label nunito_medium
                                           small
                                           color={Color.TEXT_DARK}
                                           style={styles.addressLabel}>{shippingInfo.fullname}</Label>
                                    {shippingInfo.address_label ?
                                        <View style={styles.tagBoxView}>
                                            <Label xsmall color={Color.WHITE}>{shippingInfo.address_label}</Label>
                                        </View> : null
                                    }
                                    <Label small color={Color.TEXT_LIGHT}
                                           style={styles.addressLabel}
                                           mb={5}>{shippingInfo.street_name}</Label>
                                    <Label small color={Color.TEXT_LIGHT}
                                           style={styles.addressLabel}
                                           mb={5}>{shippingInfo.zone}</Label>
                                    <Label small color={Color.TEXT_LIGHT}
                                           style={styles.addressLabel}
                                           mb={5}>{shippingInfo.country}</Label>
                                    <Label small color={Color.TEXT_LIGHT}
                                           style={styles.addressLabel}
                                           mb={5}>{this.props.localeStrings.mobile}:+{shippingInfo.telephone}</Label>
                                </View>
                            </View>
                        </> : null
                    }
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        ) : null
    };

    renderOrderSummary = () => {
        let summaryData = this.state.orderDetail ? this.state.orderDetail.totals : null;

        let total = summaryData && summaryData.length > 0 ?
            summaryData.find(item => item.title === this.props.localeStrings.total) : null;
        let filtered = summaryData && summaryData.length > 0 ?
            summaryData.filter(item => item.title !== this.props.localeStrings.total) : [];

        return total ? (
            <View style={styles.blockContainer}>
                <Label small
                       color={Color.TEXT_DARK}
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
                            {`SR ${costType.text}`}
                        </Label>
                    </View>
                ) : null) : null}
                <Hr lineStyle={[styles.lineSeparator, {marginVertical: 5}]}/>
                {total ?
                    <View style={styles.costTypeContainer}>
                        <Label color={Color.TEXT_DARK}
                               nunito_medium>
                            {total.title}
                        </Label>
                        <Label color={Color.TEXT_DARK}
                               nunito_medium>
                            {`SR ${total.text}`}
                        </Label>
                    </View> : null}
            </View>
        ) : null
    };

    renderProductList = () => {
        let orderProducts = this.state.orderDetail ? this.state.orderDetail.products : [];
        return Array.isArray(orderProducts) && orderProducts.length > 0 ? (
            <>
                <Label color={Color.TEXT_DARK}
                       nunito_medium
                       large
                       mt={10}
                       mb={15}
                       ms={ThemeUtils.relativeWidth(5)}
                       style={{alignSelf: 'flex-start'}}>
                    {this.props.localeStrings.items}
                </Label>
                <FlatList
                    data={orderProducts}
                    renderItem={
                        ({index, item}) => this.renderProductItem(index, item)
                    }
                    ItemSeparatorComponent={() =>
                        <Hr lineStyle={[styles.lineSeparator, {marginVertical: 5}]}/>}
                />
            </>
        ) : null
    };

    renderProductItem = (index, item) => {
        return (
            <View style={styles.itemTopMain}>
                <View style={styles.itemLeftDetail}>
                    <View style={styles.cartImgContainer}>
                        <Image
                            source={{uri: this.getImage(item)}}
                            style={styles.cartImg}
                        />
                    </View>
                </View>
                <View style={styles.itemRightDetail}>
                    <View style={styles.cartProductName}>
                        <Label color={Color.TEXT_DARK}
                               nunito_medium>
                            {item.name}
                        </Label>
                    </View>
                    <View style={styles.cartPrice}>
                        <Label
                            color={item.special ? Color.ERROR : Color.TEXT_DARK}
                            nunito_bold
                            bolder={IS_IOS}
                            xsmall
                            me={5}>
                            {item.special ? item.special : item.price}
                        </Label>
                        {item.special &&
                        <Label color={Color.TEXT_LIGHT}
                               me={5}
                               ms={5}
                               xsmall
                               nunito_bold
                               bolder={IS_IOS}
                               style={{textDecorationLine: 'line-through'}}>
                            {item.price}
                        </Label>
                        }
                        {item.special &&
                        <View style={styles.cartDiscountView}>
                            <Label color={Color.WHITE}
                                   nunito_medium
                                   xsmall>
                                {I18nManager.isRTL ?
                                    `${this.props.localeStrings.off} %${item.percentage}` :
                                    `${item.percentage}% ${this.props.localeStrings.off}`}
                            </Label>
                        </View>
                        }
                    </View>
                    {this.renderOptionsSection(item)}
                    {this.renderQuantitySection(item)}
                </View>
            </View>
        )
    };

    renderOptionsSection = (item) => {
        let options = Array.isArray(item.option) && item.option.length > 0 ?
            item.option : null,
            colorOpt = null,
            sizeOpt = null,
            otherOpt = null;

        if (options) {
            colorOpt = options.find((optionType) =>
                optionType.name.trim().toLowerCase() === this.props.localeStrings.chooseColor
                || optionType.name === 'اختيار اللون'
            );
            sizeOpt = options.find((optionType) =>
                optionType.name.trim().toLowerCase() === this.props.localeStrings.chooseSize
                || optionType.name === 'اختيار المقاس');
            otherOpt = options.find((optionType) =>
                (optionType.name.trim().toLowerCase() !== this.props.localeStrings.chooseColor
                    && optionType.name !== 'اختيار اللون'
                    && optionType.name.trim().toLowerCase() !== this.props.localeStrings.chooseSize
                    && optionType.name !== 'اختيار المقاس'
                )
            )
        }

        return options ? (
            <>
                {colorOpt ?
                    <View style={styles.optionTypeContainer} key={colorOpt.product_option_id}>
                        <Label color={Color.TEXT_DARK}
                               me={5}
                               small>
                            {`${this.extractOptionName(colorOpt.name)} : `}
                        </Label>
                        {
                            this.renderSelectedOption(colorOpt)
                        }
                    </View> : null
                }
                {sizeOpt ?
                    <View style={styles.optionTypeContainer} key={sizeOpt.product_option_id}>
                        <Label color={Color.TEXT_DARK}
                               me={5}
                               small>
                            {`${this.extractOptionName(sizeOpt.name)} : `}
                        </Label>
                        {
                            this.renderSelectedOption(sizeOpt)
                        }
                    </View> : null
                }
                {otherOpt ?
                    <View style={styles.optionTypeContainer} key={otherOpt.product_option_id}>
                        <Label color={Color.TEXT_DARK}
                               me={5}
                               small>
                            {`${this.extractOptionName(otherOpt.name)} : `}
                        </Label>
                        {
                            this.renderSelectedOption(otherOpt)
                        }
                    </View> : null
                }

            </>
        ) : null
    };

    renderSelectedOption = (optionType) => {
        switch (optionType.name.trim().toLowerCase()) {
            case this.props.localeStrings.chooseColor:
            case 'choose color':
            case 'اختيار اللون': {
                let isOutOfStock = optionType.qty && parseInt(optionType.qty) === 0;
                return optionType.hex_code || optionType.value ? (
                    <View
                        style={{flexDirection: 'row', alignItems: 'center'}}
                        key={optionType.product_option_value_id}>
                        <View style={[
                            styles.colorOption,
                            isHexValid(optionType.hex_code) ?
                                {backgroundColor: optionType.hex_code} :
                                {backgroundColor: Color.LIGHT_GRAY},
                            isOutOfStock ? {opacity: 0.5} : styles.shadowBg
                        ]}>
                            {!isHexValid(optionType.hex_code) ?
                                optionType.value ?
                                    <Label xsmall
                                           nunito_medium
                                           color={Color.TEXT_DARK}>
                                        {optionType.value[0].toUpperCase()}
                                    </Label>
                                    : <View/>
                                : <View/>}
                        </View>
                        <Label xsmall
                               color={Color.TEXT_DARK}>
                            {optionType.value}
                        </Label>
                    </View>
                ) : <View/>
            }
            case this.props.localeStrings.chooseSize:
            case 'choose size':
            case 'اختيار المقاس':
            default: {
                let isOutOfStock = optionType.qty && parseInt(optionType.qty) === 0;
                return (
                    <View
                        key={optionType.product_option_value_id}
                        style={[
                            styles.sizeOption,
                            {backgroundColor: Color.PRIMARY},
                            isOutOfStock ? {opacity: 0.5} : null
                        ]}>
                        <Label xsmall
                               mt={3}
                               mb={3}
                               me={3}
                               ms={3}
                               color={Color.WHITE}>
                            {optionType.value ? optionType.value.toLowerCase() : ""}
                        </Label>
                    </View>
                )
            }
        }
    };

    renderQuantitySection = (item) => {
        return (
            <View>
                <View style={styles.quantityContainer}>
                    <Label color={Color.TEXT_DARK}
                           me={5}
                           xsmall>
                        {`${this.props.localeStrings.quantity} : `}
                    </Label>
                    <Label xsmall
                           color={Color.TEXT_DARK}>
                        {item.quantity}
                    </Label>
                </View>
                <View style={styles.quantityContainer}>
                    <Label color={Color.TEXT_DARK}
                           xsmall>
                        {`${this.props.localeStrings.quantityPrice} : `}
                    </Label>
                    <Label small
                           ms={5}
                           nunito_bold
                           bolder={IS_IOS}
                           color={Color.TEXT_DARK}>
                        {this.getQuantityPrice(item)}
                    </Label>
                </View>
            </View>
        )
    };

    renderReturnDetails = () => {
        let isReturnOrder = this.state.currentOrderType && this.state.currentOrderType.type === Constants.OrderTypeReturn,
            orderDetail = this.state.orderDetail ? this.state.orderDetail : null;
        return orderDetail && isReturnOrder ? (
            <>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.productIsOpened}
                    </Label>
                    <View style={styles.labelContainer}>
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={5}>
                            {orderDetail.opened === "1" ? this.props.localeStrings.yes : this.props.localeStrings.no}
                        </Label>
                    </View>
                </View>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.returnReasonTitle}
                    </Label>
                    <View style={styles.labelContainer}>
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={5}>
                            {orderDetail.reason}
                        </Label>
                    </View>
                </View>
                {orderDetail.comment ?
                    <View style={styles.blockContainer}>
                        <Label small
                               color={Color.TEXT_DARK}>
                            {this.props.localeStrings.returnComments}
                        </Label>
                        <View style={styles.labelContainer}>
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   ms={5}>
                                {orderDetail.comment}
                            </Label>
                        </View>
                    </View> : null
                }
            </>
        ) : null
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let backHandler = navigation.getParam('backHandler', null);
        return {
            title: "navOrderDetails",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       btnLeftHandler={backHandler}
                                                       showLeftButton={true}
                                                       showRightButton={false}
                                                       showBack/>
        }
    };

    constructor(props) {
        super(props);

        let orderData = this.props.navigation.getParam('orderData', null);
        let notificationId = this.props.navigation.getParam('fromNotif', null);
        let fromSplash = this.props.navigation.getParam('fromSplash', false);
        let currentOrderType = this.props.navigation.getParam('currentOrderType', null);
        this.state = {
            orderData,
            notificationId,
            fromSplash,
            currentOrderType,
            isLoaderVisible: false,
            orderDetail: null,
            showCancelPopUp: false,
            selectedReasonId: null,
            reasonText: "",
            paymentSeeMore: false,
            refreshLoader: false
        };
    }

    componentWillMount() {
        if (this.state.fromSplash) {
            this.props.navigation.setParams({
                backHandler: this.backHandler
            });
        }
    }

    componentDidMount() {
        if (this.state.currentOrderType &&
            this.state.currentOrderType.type === Constants.OrderTypeReturn) {
            this.getReturnOrderDetail()
        } else {
            this.getOrderDetailRequest();
        }
        if (this.state.fromSplash) {
            BackHandler.addEventListener("OrderDetailPopUpBack", this.backHandler)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <ScrollView style={{backgroundColor: Color.LIGHT_WHITE}}
                        refreshControl={
                            <RefreshControl refreshing={this.state.refreshLoader}
                                            onRefresh={() => {
                                                if (this.state.currentOrderType &&
                                                    this.state.currentOrderType.type === Constants.OrderTypeReturn) {
                                                    this.getReturnOrderDetail(true)
                                                } else {
                                                    this.getOrderDetailRequest(true);
                                                }
                                            }}/>}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <CancelReasonPopUp showPopup={this.state.showCancelPopUp}
                                   onClosePopUp={this.onCloseCancelPopUp}
                                   onSubmit={this.onSubmitReason}/>
                <View style={styles.detailContainer}>
                    {this.renderOrderData()}
                    {this.renderContactInfo()}
                    {this.renderPaymentInfo()}
                    {this.renderShippingInfo()}
                    {this.renderOrderSummary()}
                    {this.renderReturnDetails()}
                </View>
                <View style={{backgroundColor: Color.WHITE}}>
                    {this.renderProductList()}
                </View>
            </ScrollView>
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
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetail)

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    I18nManager,
    Button,
    ScrollView, Image, FlatList, RefreshControl,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import moment from "moment/moment";

//Custom component
import {
    Label,
    StepIndicator,
    RoundButton,
    Hr,
    CustomNavigationHeader
} from "src/component";

//Utility
import Action from "src/redux/action";
import {API_GET_TRACKING_DETAILS, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {
    Color,
    ThemeUtils,
    Icon,
    Strings,
    Constants,
    DateUtils,
    findLastIndex
} from "src/utils";
import Routes from "src/router/routes";

//Assets
const VISA_LOGO = require('src/assets/images/logo_assets/visa_logo.png');
const SADAD_LOGO = require('src/assets/images/logo_assets/sadad_logo.png');


const labels = ["Placed", "Accepted", "Processed", "Shipped", "Delivered"];
const customStyles = {
    stepIndicatorSize: 20,
    currentStepIndicatorSize: 20,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 0,
    stepStrokeWidth: 1,

    stepStrokeCurrentColor: Color.PRIMARY,
    stepStrokeFinishedColor: Color.PRIMARY,
    stepStrokeUnFinishedColor: Color.GRAY,

    separatorFinishedColor: Color.PRIMARY,
    separatorUnFinishedColor: Color.GRAY,

    stepIndicatorFinishedColor: Color.PRIMARY,
    stepIndicatorUnFinishedColor: Color.WHITE,
    stepIndicatorCurrentColor: Color.PRIMARY,

    stepIndicatorLabelCurrentColor: Color.PRIMARY,
    stepIndicatorLabelFinishedColor: Color.PRIMARY,
    stepIndicatorLabelUnFinishedColor: Color.GRAY,
    labelAlign: 'flex-start'
};


class TrackOrder extends Component {

    //Server request
    getTrackStatusRequest = (refreshing) => {
        this.setState({isLoaderVisible: !refreshing, refreshLoader: refreshing});
        let params = {
            "customer_id": this.props.user.customer_id,
        };

        params["order_id"] = this.state.orderDetail.order_id;

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_TRACKING_DETAILS)
            .reqURL(ApiURL.getTrackingDetail)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false, refreshLoader: false});
        switch (reqId) {
            case API_GET_TRACKING_DETAILS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            let trackDetail = response.data,
                                statuses = [],
                                trackHistory = [],
                                completedPos = 0;

                            if (response.data.order_status &&
                                response.data.order_status.length > 0) {

                                statuses = response.data.order_status.map((statusObj) => {
                                    console.log('data 1...',statusObj,I18nManager.isRTL)

                                    return I18nManager.isRTL ? statusObj.name_ar : statusObj.name
                                });

                               // completedPos = findLastIndex(response.data.order_status, 'status', true)
                            }
                            console.log('data 2...',statuses)
                            console.log('data 3...',trackHistory)
                            console.log('data 4...',completedPos)

                            if (Array.isArray(response.data.order_track_history) &&
                                response.data.order_track_history.length > 0) {
                                trackHistory = response.data.order_track_history
                            }
                            console.log('data 3...',trackHistory)
                            console.log('data 4...',completedPos)

                            this.setState({
                               trackDetail,
                               statuses,
                               trackHistory,
                                completedPos
                            })
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false, refreshLoader: false});
        switch (reqId) {
            case API_GET_TRACKING_DETAILS:
                if (!this.state.trackDetail) {
                    this.setState({
                        errMessage: this.props.localeStrings.errOrderDetail
                    })
                }
                break;
        }
    };

    //User Interaction

    //Utility
    getParsedDate = (timestamp) => {
        return moment(timestamp).format(DateUtils.dd_MMM_yyyy)
    };

    getParsedDateTime = (timestamp) => {
        return moment(timestamp).format(DateUtils.dd_MM_yyyy_hh_mm_a)
    };

    getOrderId = () => {
        if (this.state.trackHistory.length > 0) {
            for (let i = 0; i < this.state.trackHistory.length - 1; i++) {
                if (this.state.trackHistory[i] &&
                    this.state.trackHistory[i].order_id
                ) {
                    return this.state.trackHistory[i].order_id
                }
            }
            return ""
        }
        return ""
    };

    getLabel = () => {

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
        }
    };

    renderTrackingView = () => {
        console.log('hgchcj',this.state.statuses)
        return (this.state.trackDetail &&
            this.state.statuses.length > 0) ? (
            <View style={[
                styles.trackingStepsContainer,
                {height: this.state.statuses.length * (35 + 15)}
            ]}>
                <StepIndicator
                    customStyles={customStyles}
                    currentPosition={this.state.completedPos}
                    labels={this.state.statuses}
                    stepCount={this.state.statuses.length}
                    direction={'vertical'}
                    renderStepIndicator={() => <></>}
                    renderLabel={this.renderStatusLabel}
                />
            </View>
        ) : null
    };

    renderStatusLabel = ({position, stepStatus, label, currentPosition}) => {
        let textColor = Color.TEXT_DARK;
        let statusObj = this.state.statuses[position];
        switch (stepStatus) {
            case 'unfinished':
                textColor = Color.TEXT_LIGHT;
                break;
            default:
                textColor = Color.TEXT_DARK;
                break;
        }


        return (
            <Label small
                   ms={10}
                   nunito_medium
                   color={textColor}>
                {label}
                {/* {stepStatus !== 'unfinished' ?
                    <Label small
                           color={Color.TEXT_LIGHT}>
                        {`  ${this.getParsedDate(statusObj.date_added)}  `}
                    </Label> :
                     ""
                } */}
            </Label>
        )
    };

    renderTrackItem = (item, index) => {
        let statusLang = 'status_en';
        switch (this.props.langCode) {
            case Constants.API_LANGUAGES.EN:
                statusLang = 'status_en';
                break;
            case Constants.API_LANGUAGES.AR:
                statusLang = 'status_ar';
                break;
        }


        return (
            <>
                {item[statusLang] ?
                    <Label small
                           color={Color.TEXT_DARK}
                           nunito_medium
                           mt={5}
                           mb={5}>
                        {`${item[statusLang]}`}
                    </Label> : null
                }

                {item.tracking_date ?
                    <Label small
                           color={Color.TEXT_LIGHT}
                           mt={5}
                           mb={5}>
                        {`${this.getParsedDateTime(item.tracking_date)}`}
                    </Label> : null
                }
            </>
        )
    };

    renderOrderData = () => {
        return Array.isArray(this.state.trackHistory) && this.state.trackHistory.length > 0 ? (
            <View style={{
                marginTop: 10,
                paddingHorizontal: ThemeUtils.relativeWidth(5),
                backgroundColor: Color.WHITE,
            }}>
                <Label small
                       color={Color.TEXT_DARK}
                       nunito_medium
                       mt={10}
                       mb={10}>
                    {I18nManager.isRTL ?
                        ` : ${this.props.localeStrings.orderID}` :
                        `${this.props.localeStrings.orderID}: `}
                    <Label small
                           color={Color.TEXT_LIGHT}
                           nunito_regular>
                        {I18nManager.isRTL ?
                            `${this.getOrderId()}#` :
                            `#${this.getOrderId()}`}
                    </Label>
                </Label>
                <View style={styles.listContainer}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        extraData={this.state}
                        data={this.state.trackHistory}
                        keyExtractor={item => `${item.tracking_date}`}
                        renderItem={({index, item}) => this.renderTrackItem(item, index)}
                        ItemSeparatorComponent={() => <Hr lineStyle={styles.lineSeparator}/>}/>
                </View>
            </View>
        ) : null
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
                            {paymentInfo.title}
                        </Label>
                    </View>
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
                            {costType.text}
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
                            {total.text}
                        </Label>
                    </View> : null}
            </View>
        ) : null
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation;
        return {
            title: "trackOrder",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    constructor(props) {
        super(props);

        let orderDetail = this.props.navigation.getParam('orderDetail', null)
        this.state = {
            orderDetail,
            trackDetail: null,
            statuses: [],
            trackHistory: [],
            currentPosition: 0,
            isLoaderVisible: false,
            refreshLoader: false
        };
    }


    componentDidMount() {
        this.getTrackStatusRequest()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return this.state.isLoaderVisible ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Label color={Color.TEXT_DARK}
                           mb={5}>
                        {this.props.localeStrings.pleaseWait}
                    </Label>
                    <Label small
                           color={Color.TEXT_LIGHT}
                           mt={5}>
                        {this.props.localeStrings.trackingDetailLoadingMessage}
                    </Label>
                </View>
            ) :
            (
                <ScrollView style={{backgroundColor: Color.LIGHT_WHITE}}
                            refreshControl={
                                <RefreshControl refreshing={this.state.refreshLoader}
                                                onRefresh={() => this.getTrackStatusRequest(true)}/>}>
                    {this.renderTrackingView()}
                    {/* {this.renderOrderData()} */}
                </ScrollView>
            );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(Action.logout()),
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        langCode: state.langCode,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TrackOrder)
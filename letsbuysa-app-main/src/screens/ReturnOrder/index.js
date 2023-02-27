import React, {Component} from 'react';
import {
    Button,
    InputAccessoryView,
    I18nManager,
    View,
    DeviceEventEmitter,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
    RefreshControl,
    Keyboard,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import Spinner from "react-native-loading-spinner-overlay";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {SafeAreaView} from "react-navigation";

//Custom component
import {
    Label,
    RadioComponent,
    CustomNavigationHeader,
    Hr,
    ModalDropdown,
    RoundButton
} from "src/component";

//Utility
import Action from "src/redux/action";
import {
    API_GET_ORDER_DETAIL,
    API_RETURN_ORDER,
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
    numberWithCommas,
    CommonStyle
} from "src/utils";
import styles from "./styles";

class ReturnOrder extends Component {

    //Server request
    getOrderDetailRequest = (refreshing = false) => {
        this.setState({isLoaderVisible: !refreshing, refreshLoader: refreshing});
        let params = {
            "customer_id": this.props.user.customer_id,
            "type": 'return_order'
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

    returnOrderRequest = () => {
        this.setState({isLoaderVisible: true, refreshLoader: false});
        let params = {
            "customer_id": this.props.user.customer_id,
            "order_id": this.state.orderData.order_id,
            "return_reason_id": this.state.selectedReasonId,
            "opened": this.state.selectedOpenedAnswerId === this.props.localeStrings.yes,
        };

        this.state.selectedItems.map(item => {
            if (item) {
                params[`order_product_id[${item.order_product_id}]`] = this.state[`${item.order_product_id}_currentQty`];
            }
        });

        if (this.state.reasonText) {
            params["comment"] = this.state.reasonText;
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_RETURN_ORDER)
            .reqURL(ApiURL.orderReturn)
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
                            this.setState({orderDetail: response.data});
                            if (Array.isArray(response.data.products)
                                && response.data.products.length > 0) {
                                this.setProductQtys(response.data.products)
                            }
                        }
                        break
                }
                break;
            case API_RETURN_ORDER:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            this.props.navigation.pop();
                            if (response.data.success && response.data.success.message) {
                                showSuccessSnackBar(response.data.success.message);
                                DeviceEventEmitter.emit(Constants.APP_EVENTS.RETURN_SUCCESS)
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
            case API_RETURN_ORDER:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };

    //User Interaction
    onChangeQuantity = (index, value, item) => {
        this.setState({
            [`${item.order_product_id}_currentQty`]: value
        });
    };

    onItemSelected = (item) => {
        let selectedItems = this.state.selectedItems.slice();
        if (this.getIsItemSelected(item)) {
            selectedItems = selectedItems.filter(product => product.order_product_id !== item.order_product_id)
        } else {
            selectedItems.push({
                order_product_id: item.order_product_id,
                returnQuantity: this.state[`${item.order_product_id}_currentQty`]
            });
        }

        this.setState({
            selectedItems,
            itemsSelectError: ""
        });
    };

    onClickSelectAll = () => {
        let selectedItems = [];
        if (this.getAllSelected()) {
            selectedItems = [];
        } else {
            this.state.orderDetail.products.map(product => {
                if (product.return) {
                    selectedItems.push({
                        order_product_id: product.order_product_id,
                        returnQuantity: this.state[`${product.order_product_id}_currentQty`]
                    });
                }
            });
        }
        this.setState({
            selectedItems,
            itemsSelectError: ""
        });
    };

    onSelectReason = (index, value) => {
        this.setState({
            selectedReasonId: value,
            reasonIdError: ""
        });
    };

    onSelectOpenedAnswer = (index, value) => {
        this.setState({
            selectedOpenedAnswerId: value,
            productOpenedError: ""
        });
    };

    onClickSubmit = () => {
        this.setState(prevState => ({
            reasonText: prevState.reasonText ? prevState.reasonText.trim() : "",
        }), () => {
            if (this.validateForm()) {
                this.returnOrderRequest()
            }
        });
    };

    //Utility
    validateForm = () => {
        Keyboard.dismiss();

        let itemsSelectError, reasonIdError, productOpenedError;
        let isValide = true;

        if (this.state.selectedItems.length === 0) {
            itemsSelectError = this.props.localeStrings.itemsSelectError
        }

        if (this.state.selectedReasonId === null) {
            reasonIdError = this.props.localeStrings.returnReasonError
        }

        if (this.state.selectedOpenedAnswerId === null) {
            productOpenedError = this.props.localeStrings.productOpenedError
        }

        if (itemsSelectError ||
            reasonIdError ||
            productOpenedError) {
            this.setState({
                itemsSelectError,
                reasonIdError,
                productOpenedError
            });

            isValide = false;
        } else {
            this.setState({
                itemsSelectError: "",
                reasonIdError: "",
                productOpenedError: ""
            });
            isValide = true;
        }
        return isValide;
    };

    extractOptionName = (text) => {
        let opt = text.toLowerCase().replace(this.props.localeStrings.choose.toLowerCase(), '');
        opt = opt.toLowerCase().replace(this.props.localeStrings.select.toLowerCase(), '');
        opt = opt.trim();
        return I18nManager.isRTL ? text : (opt ? opt.charAt(0).toUpperCase() + opt.slice(1) : '');
    };

    getImage = (item) => {
        if (item.image) {
            return decodeImageUrl(item.image)
        }
        return decodeImageUrl(item.thumb)
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
        let qty = parseInt(this.state[`${item.order_product_id}_currentQty`]) || 1;

        if (!isNaN(priceVal) && !isNaN(qty)) {
            return `SR ${numberWithCommas(priceVal * qty)}`
        }
        return `SR 0`
    };

    setProductQtys = (products) => {
        let newState = {},
            availableItemsCount = 0;
        products.map(product => {
            if (product.return) {
                availableItemsCount += 1;
            }
            newState[`${product.order_product_id}_currentQty`] = product.quantity;
        });
        newState.availableItemsCount = availableItemsCount;
        this.setState(newState);
    };

    getIsItemSelected = (product) => {
        let exists = false;
        if (this.state.selectedItems.length > 0) {
            for (let i = 0; i < this.state.selectedItems.length; i++) {
                if (product.order_product_id === this.state.selectedItems[i].order_product_id) {
                    exists = true;
                    break;
                }
            }
        }
        return exists;
    };

    getAllSelected = () => {
        return this.state.orderDetail && this.state.availableItemsCount &&
            this.state.selectedItems.length === this.state.availableItemsCount;
    };

    //UI methods
    renderProductList = () => {
        let orderProducts = this.state.orderDetail ? this.state.orderDetail.products : [];
        let isAllSelected = this.getAllSelected();
        return Array.isArray(orderProducts) && orderProducts.length > 0 ? (
            <View style={styles.mainBlock}>
                <View style={styles.mainContainer}>
                    <Label color={Color.TEXT_DARK}
                           nunito_medium
                           large
                           mt={10}
                           mb={10}
                           style={{alignSelf: 'flex-start'}}>
                        {this.props.localeStrings.selectItemsReturn}
                    </Label>
                    {this.state.itemsSelectError ?
                        <Label color={Color.ERROR}
                               xsmall
                               ms={10}
                               mb={5}>
                            {this.state.itemsSelectError}
                        </Label> : null
                    }
                    {orderProducts.length > 1 ?
                        <TouchableOpacity style={styles.selectAllBtn}
                                          activeOpacity={0.8}
                                          underlayColor={Color.TRANSPARENT}
                                          onPress={this.onClickSelectAll}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_medium
                                   small
                                   me={10}>
                                {isAllSelected ? this.props.localeStrings.removeAll : this.props.localeStrings.selectAll}
                            </Label>
                            <Icon name={isAllSelected ? 'checkbox_filled' : 'checkbox_normal'}
                                  size={ThemeUtils.fontNormal}
                                  color={isAllSelected ? Color.PRIMARY : Color.TEXT_DARK}/>
                        </TouchableOpacity> : null
                    }
                    <FlatList
                        data={orderProducts}
                        extraData={this.state}
                        style={{marginVertical: 10}}
                        renderItem={
                            ({index, item}) => this.renderProductItem(index, item)
                        }
                        ItemSeparatorComponent={() =>
                            <Hr lineStyle={[styles.lineSeparator, {marginVertical: 5}]}/>}
                    />
                </View>
            </View>
        ) : null
    };

    renderProductItem = (index, item) => {
        let isSelected = this.getIsItemSelected(item);
        let enabled = item.return;
        return (
            <TouchableOpacity style={styles.itemTouchContainer}
                              activeOpacity={0.7}
                              disabled={!enabled}
                              underlayColor={Color.TRANSPARENT}
                              onPress={() => this.onItemSelected(item)}>
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
                {enabled ?
                    <Icon name={isSelected ? 'checkbox_filled' : 'checkbox_normal'}
                          size={ThemeUtils.fontNormal}
                          mt={10}
                          ms={10}
                          me={10}
                          color={isSelected ? Color.PRIMARY : Color.TEXT_DARK}/>
                    :
                    <Label color={Color.RED}
                           style={{position: 'absolute', end: 0, top: 5}}
                           nunito_medium
                           xsmall>
                        {this.props.localeStrings.returnedStatus}
                    </Label>
                }
            </TouchableOpacity>
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
                || optionType.name === 'اختيار المقاس'
            );
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
        let maxQty = parseInt(item.quantity),
            enabled = item.return,
            currentItemQty =
                parseInt(this.state[`${item.order_product_id}_currentQty`]) ?
                    parseInt(this.state[`${item.order_product_id}_currentQty`]) : 1;
        return (
            <View>
                <View style={styles.quantityContainer}>
                    <Label color={Color.TEXT_DARK}
                           me={10}
                           xsmall>
                        {this.props.localeStrings.quantity}
                    </Label>
                    <ModalDropdown options={new Array(maxQty).fill(0).map((item, idx) => `${idx + 1}`)}
                                   style={styles.quantityBtn}
                                   disabled={!enabled}
                                   dropdownStyle={styles.quantityDropdown}
                                   dropdownTextStyle={{marginStart: 5}}
                                   onSelect={(index, value) => this.onChangeQuantity(index, value, item)}>
                        <View style={styles.quantityBtnMain}>
                            <Label xsmall
                                   ms={10}
                                   color={Color.TEXT_DARK}>
                                {currentItemQty}
                            </Label>
                            <Icon name={"dropdown_arrow"}
                                  style={{marginEnd: 10}}
                                  size={ThemeUtils.fontXSmall}
                                  color={Color.TEXT_DARK}
                            />
                        </View>
                    </ModalDropdown>
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

    renderContactInfo = () => {
        let contactInfo = this.props.user;
        return contactInfo ? (
            <>
                <View style={styles.blockContainer}>
                    <Label small
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.orderContactInfo}
                    </Label>
                    <View style={styles.labelContainer}>
                        <Icon name={"account_fill"}
                              color={Color.PRIMARY}
                              size={ThemeUtils.fontNormal}
                              style={{marginEnd: 10}}/>
                        <Label small
                               color={Color.TEXT_LIGHT}
                               ms={5}>
                            {contactInfo.full_name}
                        </Label>
                    </View>
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

    renderOrderDetails = () => {
        return (
            <>
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
                                {`#${this.state.orderDetail.order_id}`}
                            </Label>
                        </Label>
                    </View>
                    {this.state.orderDetail.date_added ?
                        <Label small
                               color={Color.TEXT_DARK}
                               nunito_medium
                               mt={5}
                               mb={5}>
                            {`${this.props.localeStrings.dateAddedLabel}: `}
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   nunito_regular>
                                {this.state.orderDetail.date_added}
                            </Label>
                        </Label> : null
                    }
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        )
    };

    renderRadioOptions = () => {
        return this.options && this.options.length > 0 ? (
            <RadioComponent.RadioGroup
                onSelect={this.onSelectReason}
                color={Color.PRIMARY}>
                {this.options.map((reason, idx) => (
                    <RadioComponent.RadioButton value={reason.id}
                                                key={`${idx}`}
                                                showSeparator>
                        <Label small
                               color={Color.TEXT_DARK}
                               ms={10}>
                            {reason.title}
                        </Label>
                    </RadioComponent.RadioButton>
                ))}
            </RadioComponent.RadioGroup>
        ) : null
    };

    renderReturnReasons = () => {
        let inputEnabled = true;
        return (
            <>
                <View style={{flex: 1}}>
                    <Label small
                           mt={5}
                           mb={5}
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.returnReasonTitle}
                    </Label>
                    {this.state.reasonIdError ?
                        <Label color={Color.ERROR}
                               xsmall
                               ms={10}
                               mb={5}>
                            {this.state.reasonIdError}
                        </Label> : null
                    }
                    {this.renderRadioOptions()}
                    <View style={[styles.inputContainer, {
                        borderColor: inputEnabled ? Color.PRIMARY : Color.TEXT_LIGHT,
                    }]}>
                        <TextInput
                            ref={input => {
                                this.reasonTextInput = input
                            }}
                            style={[styles.reviewInput, {
                                textAlign: I18nManager.isRTL ? 'right' : 'left'
                            }]}
                            disabled={!inputEnabled}
                            placeholder={this.props.localeStrings.returnReasonPlaceholder}
                            placeholderTextColor={Color.TEXT_LIGHT}
                            multiline
                            value={this.state.reasonText}
                            autoCorrect={false}
                            inputAccessoryViewID={'inputAccessoryViewID'}
                            onFocus={() => {
                                this.setState({reasonTextError: ""})
                            }}
                            onChangeText={(val) => {
                                this.setState({
                                    reasonText: val
                                })
                            }}
                        />
                    </View>
                    {this.state.reasonTextError ?
                        <Label color={Color.ERROR}
                               xsmall
                               ms={10}>
                            {this.state.reasonTextError}
                        </Label> : null
                    }
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        )
    };

    renderOpenedQuestion = () => {
        let answersOptions = [this.props.localeStrings.yes, this.props.localeStrings.no];
        return (
            <>
                <View style={{flex: 1}}>
                    <Label small
                           mt={10}
                           mb={5}
                           color={Color.TEXT_DARK}>
                        {this.props.localeStrings.productIsOpened}
                    </Label>
                    {this.state.productOpenedError ?
                        <Label color={Color.ERROR}
                               xsmall
                               ms={10}
                               mb={5}>
                            {this.state.productOpenedError}
                        </Label> : null
                    }
                    <RadioComponent.RadioGroup
                        onSelect={this.onSelectOpenedAnswer}
                        color={Color.PRIMARY}>
                        {answersOptions.map((reason, idx) => (
                            <RadioComponent.RadioButton value={reason}
                                                        key={`${idx}`}>
                                <Label small
                                       color={Color.TEXT_DARK}
                                       ms={10}>
                                    {reason}
                                </Label>
                            </RadioComponent.RadioButton>
                        ))}
                    </RadioComponent.RadioGroup>
                </View>
                <Hr lineStyle={styles.lineSeparator}/>
            </>
        )
    };

    renderDetails = () => {
        return this.state.orderDetail ? (
            <View style={styles.detailsContainer}>
                {this.renderOrderDetails()}
                {this.renderContactInfo()}
                {this.renderReturnReasons()}
                {this.renderOpenedQuestion()}
                <View style={styles.submitBtn}>
                    <RoundButton width={ThemeUtils.relativeWidth(90)}
                                 backgroundColor={Color.PRIMARY}
                                 mt={10}
                                 mb={10}
                                 border_radius={5}
                                 btnPrimary
                                 textColor={Color.WHITE}
                                 click={this.onClickSubmit}>
                        {this.props.localeStrings.submit}
                    </RoundButton>
                </View>
            </View>
        ) : null
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            title: "navReturnOrder",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    constructor(props) {
        super(props);

        let orderData = this.props.navigation.getParam('orderData', null);
        this.state = {
            orderData,
            isLoaderVisible: false,
            orderDetail: null,
            selectedItems: [],
            availableItemsCount: 0,
            selectedReasonId: null,
            selectedOpenedAnswerId: null,
            reasonText: "",
            itemsSelectError: "",
            reasonIdError: "",
            productOpenedError: "",
            paymentSeeMore: false,
            refreshLoader: false
        };

        this.options = [];
        if (this.props.appConfig && Array.isArray(this.props.appConfig.languages)) {
            let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode);
            if (selectedLang && selectedLang.return_reason) {
                selectedLang.return_reason.map(reason => {
                    this.options.push({
                        id: reason.return_reason_id,
                        title: reason.name
                    })
                });
            }
        }
    }

    componentWillMount() {

    }

    componentDidMount() {
        this.getOrderDetailRequest();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <KeyboardAwareScrollView
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={true}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}
                    style={{backgroundColor: Color.LIGHT_WHITE}}>
                    {this.renderProductList()}
                    {this.renderDetails()}
                </KeyboardAwareScrollView>
                {
                    IS_IOS && <InputAccessoryView
                        nativeID={'inputAccessoryViewID'}
                        style={{width: '100%'}}
                        backgroundColor={Color.INPUT_ASSESORY_BG}>
                        <View style={{alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <Button
                                style={{textAlign: 'right'}}
                                onPress={() => Keyboard.dismiss()}
                                title={this.props.localeStrings.done}
                            />
                        </View>
                    </InputAccessoryView>
                }
            </SafeAreaView>
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
        appConfig: state.appConfig,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ReturnOrder)

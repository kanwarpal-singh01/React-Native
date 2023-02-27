import React, {Component} from 'react';
import {
    Animated,
    View,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Image,
    ScrollView, I18nManager,
} from 'react-native';

//Third Party
import {connect} from "react-redux";
import PropTypes from "prop-types";

//Custom Components
import {
    Label,
    Hr,
    RoundButton
} from 'src/component';

//Utils
import {
    Color,
    ThemeUtils,
    decodeImageUrl,
    Icon,
    IS_IOS,
    Constants,
    showErrorSnackBar,
    isHexValid,
    IS_ANDROID
} from "src/utils";
import styles from "./styles";
import {API_GET_PRODUCT_DETAIL, APIRequest, ApiURL} from "src/api";

class ProductOptionPopUp extends Component {

    //Server request
    getProductDetailRequest = (option_value_id = null) => {
        this.setState({
            showLoader: true
        });
        let params = {
            "product_id": this.state.productDetail.product_id
        };

        if (option_value_id !== null && option_value_id !== undefined) {
            params["option_value_id"] = option_value_id
        }

        if (this.props.user) {
            params["customer_id"] = this.props.user.customer_id
        }
        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_PRODUCT_DETAIL)
            .reqURL(ApiURL.getProductDetail)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            showLoader: false,
        });
        switch (reqId) {
            case API_GET_PRODUCT_DETAIL:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.product) {
                            this.setState({
                                productDetail: {...response.data.product},
                            });
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({
            showLoader: false
        });
        switch (reqId) {
            case API_GET_PRODUCT_DETAIL:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar("Could not fetch product detail")
                }
                this.setState({
                    productDetail: null,
                    selectedOptions: []
                });
                break;
            default:
                if (error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break
        }
    };

    //utility
    getProductImages = () => {
        if (this.state.productDetail &&
            this.state.productDetail.images &&
            this.state.productDetail.images.length > 0) {
            return this.state.productDetail.images;
        } else if (this.state.productDetail &&
            this.state.productDetail.thumb) {
            return [{popup: this.state.productDetail.thumb}]
        }
        return []
    };

    getIsOptionSelected = (optionType, selectedOptionValueId) => {
        let isSelected = false;
        if (this.state.selectedOptions.length > 0) {
            for (let i = 0; i < this.state.selectedOptions.length; i++) {

                //selectedOptions is an array like
                //[{"option_type_id":"option_value_id"}]
                //So find optionType id in keys of object in selectedOptions array

                if (
                    Object.keys(this.state.selectedOptions[i]).includes(optionType.product_option_id) &&
                    this.state.selectedOptions[i][optionType.product_option_id] == selectedOptionValueId
                ) {
                    isSelected = true;
                    break;
                }
            }
        }
        return isSelected;
    };

    setOptionScroll = (contentWidth, contentHeight) => {
        if (I18nManager.isRTL) {
            this.optionScroll.scrollTo({x: -contentWidth});
        }
    };

    //UI methods
    startAnimation = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(0),
            duration: 300,
        }).start();
    };

    renderOptionsSection = () => {
        let options = this.state.productDetail && Array.isArray(this.state.productDetail.options) && this.state.productDetail.options.length > 0 ?
            this.state.productDetail.options : null;
        return options ? (
            <>
                {options.map((optionType) => (
                    <View key={optionType.product_option_id}>
                        <Hr lineStyle={styles.lineSeparator}/>
                        <View style={styles.detailsContainer}>
                            <View style={[styles.optionTypeContainer]}>
                                <Label color={Color.TEXT_DARK}
                                       me={10}
                                       nunito_bold
                                       bolder={IS_IOS}>
                                    {optionType.name}
                                </Label>
                                {
                                    this.renderOptionChoices(optionType)
                                }
                            </View>
                        </View>
                    </View>
                ))}
            </>
        ) : null

    };

    renderOptionChoices = (optionType) => {
        switch (optionType.name.trim().toLowerCase()) {
            case this.props.localeStrings.chooseColor:
            case 'اختيار اللون':
                return Array.isArray(optionType.product_option_value) && optionType.product_option_value.length > 0 ?
                    (<ScrollView horizontal
                                 showsHorizontalScrollIndicator={false}
                                 ref={node => this.optionScroll = node}
                                 onContentSizeChange={(width, height) => this.setOptionScroll(width, height)}
                                 style={{
                                     flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                                     transform: [{
                                         scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1
                                     }]
                                 }}>
                            {optionType.product_option_value.map((optionValue) => {
                                    let isColorSelected = this.getIsOptionSelected(optionType, optionValue.product_option_value_id)
                                    let isOutOfStock = optionValue.qty && parseInt(optionValue.qty) === 0;

                                    return optionValue.hex_code || optionValue.name ? (
                                        <TouchableOpacity
                                            disabled={isOutOfStock}
                                            key={optionValue.product_option_value_id}
                                            activeOpacity={0.9}
                                            underlayColor={Color.TRANSPARENT}
                                            style={[
                                                styles.colorOption,
                                                isColorSelected ? styles.selectedOption : null,
                                                isHexValid(optionValue.hex_code) ?
                                                    {backgroundColor: optionValue.hex_code} :
                                                    {backgroundColor: Color.LIGHT_GRAY},
                                                isOutOfStock ? styles.noStockOption : styles.shadowBg
                                            ]}
                                            onPress={() => this.onSelectProductOption(
                                                optionType,
                                                optionValue.product_option_value_id,
                                                optionValue.option_value_id
                                            )}>
                                            {!isHexValid(optionValue.hex_code) ?
                                                optionValue.name ?
                                                    <Label xsmall
                                                           nunito_medium
                                                           style={{includeFontPadding: false}}
                                                           color={Color.TEXT_DARK}>
                                                        {optionValue.name[0].toUpperCase()}
                                                    </Label>
                                                    : <View/>
                                                : <View/>}
                                        </TouchableOpacity>
                                    ) : <View/>
                                }
                            )}
                        </ScrollView>
                    ) : null;

            case this.props.localeStrings.chooseSize:
            case 'اختيار المقاس':
            default:
                return Array.isArray(optionType.product_option_value) && optionType.product_option_value.length > 0 ?
                    (<ScrollView horizontal
                                 showsHorizontalScrollIndicator={false}
                                 ref={node => this.optionScroll = node}
                                 onContentSizeChange={(width, height) => this.setOptionScroll(width, height)}
                                 style={{
                                     flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
                                     transform: [{
                                         scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1
                                     }]
                                 }}>
                            {optionType.product_option_value.map((optionValue) => {
                                    let isSizeSelected = this.getIsOptionSelected(optionType, optionValue.product_option_value_id);
                                    let isOutOfStock = optionValue.qty && parseInt(optionValue.qty) === 0;

                                    return (
                                        <TouchableOpacity
                                            disabled={isOutOfStock}
                                            key={optionValue.product_option_value_id}
                                            activeOpacity={0.9}
                                            underlayColor={Color.TRANSPARENT}
                                            style={[
                                                styles.sizeOption,
                                                isSizeSelected ?
                                                    {...styles.selectedOption, backgroundColor: Color.PRIMARY} :
                                                    {backgroundColor: Color.WHITE},
                                                isOutOfStock ? styles.noStockOption : null,
                                                {
                                                    transform: [{
                                                        scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1
                                                    }]
                                                }
                                            ]}
                                            onPress={() => this.onSelectProductOption(
                                                optionType,
                                                optionValue.product_option_value_id,
                                                optionValue.option_value_id
                                            )}>
                                            <Label xsmall
                                                   mt={3}
                                                   me={3}
                                                   ms={3}
                                                   mb={3}
                                                   color={isSizeSelected ? Color.WHITE : Color.TEXT_DARK}>
                                                {optionValue.name ? optionValue.name.toLowerCase() : ""}
                                            </Label>
                                        </TouchableOpacity>
                                    )
                                }
                            )}
                        </ScrollView>
                    ) : null;
        }
    };

    renderBottomBtn = () => {
        return this.state.productDetail ? (
            <View style={{marginVertical: 10, alignItems: 'center', justifyContent: 'center'}}>
                <RoundButton
                    width={ThemeUtils.relativeWidth(90)}
                    backgroundColor={Color.PRIMARY}
                    border_radius={5}
                    textColor={Color.WHITE}
                    click={this.onClickApply}>
                    {this.props.localeStrings.apply}
                </RoundButton>
            </View>
        ) : null
    };

    //User interaction
    closePopUp = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(100),
            duration: 300,
        }).start(() => {
            this.props.onClosePopUp();
            this.setState({
                productDetail: null,
                selectedOptions: []
            });
        });

    };

    handleHardwareBack = () => {
        this.closePopUp();
        return true;
    };

    onSelectProductOption = (optionType, productValueID, selectedOptionValueId) => {

        let newOptions = this.state.selectedOptions.slice();
        let optionObj = {[optionType.product_option_id]: productValueID};

        console.log(optionType, productValueID, selectedOptionValueId);

        if (this.state.selectedOptions.length > 0) {
            //Find option object in state selectionOptions
            let findOptionIdx = this.state.selectedOptions.findIndex((selectOption) =>
                Object.keys(selectOption).includes(optionType.product_option_id)
            );
            console.log('findOptionIdx', findOptionIdx);

            //If found, update current option with option value
            if (findOptionIdx !== -1) {
                newOptions[findOptionIdx] = optionObj;
            }
            //If not found, add the current option type
            else {
                newOptions.push(optionObj)
            }

        } else {
            newOptions.push(optionObj);
        }
        console.log('newOptions', newOptions);
        this.setState({
            selectedOptions: newOptions
        }, () => {
            this.getProductDetailRequest(selectedOptionValueId)
        })
    };

    onClickApply = () => {
        if (this.state.selectedOptions.length > 0) {
            this.props.onClickApply(this.state.selectedOptions);
            this.closePopUp()
        } else {
            this.props.onClickApply(this.state.selectedOptions);
            this.closePopUp()
        }
    };

    //lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            productDetail: props.productDetail,
            showLoader: props.showLoader,
            selectedOptions: []
        };
        this.animatedHeight = new Animated.Value(ThemeUtils.relativeHeight(100));
    }

    componentDidMount() {

    }

    componentWillUnmount() {
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.showPopup !== prevProps.showPopup) {
            if (this.props.showPopup) {
                setTimeout(() => {
                    this.startAnimation();
                }, 0);
            }
        }
        if (this.props.productDetail !== prevProps.productDetail) {
            this.setState({productDetail: this.props.productDetail})
        }
        if (this.props.showLoader !== prevProps.showLoader) {
            this.setState({showLoader: this.props.showLoader})
        }
    }

    render() {
        return (
            <Modal transparent={true}
                   visible={this.props.showPopup}
                   onRequestClose={this.handleHardwareBack}>
                <View style={styles.container}>
                    <TouchableOpacity style={{flex: 1, backgroundColor: Color.TRANSPARENT}}
                                      activeOpacity={1}
                                      underlayColor={Color.TRANSPARENT}
                                      onPress={this.handleHardwareBack}/>
                    <Animated.View
                        style={[
                            styles.bottomViewContainer,
                            {
                                minHeight: ThemeUtils.relativeHeight(65),
                                transform: [{
                                    translateY: this.animatedHeight
                                }]
                            },
                        ]}>
                        <View style={styles.titleContainer}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   large>
                                {this.props.localeStrings.productOptions}
                            </Label>
                            <TouchableOpacity activeOpacity={0.7}
                                              underlayColor={Color.TRANSPARENT}
                                              style={styles.closeBtnContainer}
                                              onPress={this.closePopUp}>
                                <Icon name={'cancel'}
                                      size={15}
                                      color={Color.TEXT_LIGHT}/>
                            </TouchableOpacity>
                        </View>
                        {this.getProductImages().length > 0 ?
                            <ScrollView horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.imageScrollContainer}>
                                {this.getProductImages().map((item, idx) => (
                                    <View style={styles.productImage} key={idx.toString()}>
                                        <Image
                                            source={{uri: decodeImageUrl(item.popup)}}
                                            style={{flex: 1}}
                                            resizeMode={'contain'}
                                        />
                                    </View>)
                                )}
                            </ScrollView>
                            : null
                        }
                        {this.renderOptionsSection()}

                        {this.renderBottomBtn()}

                        {this.state.showLoader ?
                            <View style={styles.loader}>
                                <ActivityIndicator size={'large'} color={Color.PRIMARY}/>
                            </View> : null
                        }
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}

ProductOptionPopUp.defaultProps = {
    showPopup: false,
    showLoader: false,
    productDetail: null
};

ProductOptionPopUp.propTypes = {
    showPopup: PropTypes.bool.isRequired,
    showLoader: PropTypes.bool.isRequired,
    productDetail: PropTypes.object,
    onClosePopUp: PropTypes.func
};

export default ProductOptionPopUp;

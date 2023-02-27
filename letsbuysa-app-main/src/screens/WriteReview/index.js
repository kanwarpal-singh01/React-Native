import React from 'react';
import {
    InputAccessoryView,
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableHighlight,
    View,
    Button,
    Keyboard, TouchableOpacity,
    I18nManager
} from 'react-native';

//Third party
import {
    NavigationActions,
    SafeAreaView,
    StackActions
} from 'react-navigation';
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import ImagePicker from "react-native-image-crop-picker";
import BottomSheet from "react-native-bottomsheet";
import Spinner from "react-native-loading-spinner-overlay";
import {connect} from "react-redux";

//Custom components
import {
    Label,
    Hr,
    CustomNavigationHeader,
    RoundButton
} from 'src/component';

//Utility
import Routes from "src/router/routes";
import styles from './styles';
import {
    CommonStyle,
    Constants,
    Color,
    IS_IOS,
    Strings,
    UtilityManager,
    ThemeUtils,
    Icon,
    showErrorSnackBar,
    showSuccessSnackBar,
    decodeImageUrl,
    validation,
    capitalizeLetters
} from "src/utils";
import {API_ADD_REVIEW, APIRequest, ApiURL} from "src/api";

//assets

class WriteReview extends React.Component {

    //Server request
    addReviewRequest = () => {
        this.setState({
            isLoaderVisible: true
        });

        let params = {
            "name": this.state.reviewName,
            "text": this.state.reviewText,
            "rating": this.state.starCount,
            "product_id": this.state.productDetail.product_id
        };

        if (this.props.user) {
            params["customer_id"] = this.props.user.customer_id
        }

        let builder = new APIRequest.Builder()
            .post()
            .setReqId(API_ADD_REVIEW)
            .reqURL(ApiURL.addReview)
            .formData(params);

        this.state.reviewImages.map((obj, index, array) => {
            if (index < array.length - 1)
                builder.addFile("images[]", obj.path, obj.mime, "review_image.jpg");
        });

        builder.response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_ADD_REVIEW:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.success) {
                            showSuccessSnackBar(response.data.success.message);
                            this.props.navigation.pop();
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        console.log('error', error);
        switch (reqId) {
            case API_ADD_REVIEW:
                if (error && error.meta && error.meta.message) {
                    showErrorSnackBar(error.meta.message)
                }
                break;
        }
    };


    //User interaction
    onClickSubmit = () => {
        this.setState(prevState => ({
            reviewName: prevState.reviewName ? prevState.reviewName.trim() : "",
            reviewText: prevState.reviewText ? prevState.reviewText.trim() : ""
        }), () => {
            if (this.validateForm()) {
                this.addReviewRequest()
            }
        });
    };

    //Utility
    removeImage = (index) => {
        let array = this.state.reviewImages;
        array.splice(index, 1);

        this.setState({
            reviewImages: array
        });
    };

    imageErrorHandler = (error) => {
        switch (error.code) {
            case 'E_PICKER_CANCELLED':
                break;
            default:
                showErrorSnackBar(error.message);
                break;
        }
    };

    openBottomSheet = () => {
        BottomSheet.showBottomSheetWithOptions({
            options: [this.props.localeStrings.openCamera, this.props.localeStrings.openGallery, this.props.localeStrings.cancel],
            title: this.props.localeStrings.pickImage,
            cancelButtonIndex: 2,
        }, (value) => {
            switch (value) {
                case 0:
                    this.openCameraPicker();
                    break;
                case 1:
                    this.openGallery();
                    break;
            }
        });
    };

    openCameraPicker() {
        ImagePicker.openCamera({
            width: Constants.ImageUtils.WIDTH,
            height: Constants.ImageUtils.HEIGHT,
            cropping: true,
            compressImageMaxWidth: Constants.ImageUtils.COMPRESS_IMG_MAX_WIDTH,
            compressImageMaxHeight: Constants.ImageUtils.COMPRESS_IMG_MAX_HEIGHT,
            compressImageQuality: Constants.ImageUtils.COMPRESS_IMG_QUALITY,
            compressVideoPreset: Constants.ImageUtils.COMPRESS_VID_PRESET,
        }).then(image => {
            let array = this.state.reviewImages;
            array.unshift(image);
            array.slice(0, Constants.ImageUtils.MAX_IMG_NUM);
            this.setState({
                reviewImages: array
            });
        }).catch(this.imageErrorHandler);
    }

    openGallery() {
        ImagePicker.openPicker({
            width: Constants.ImageUtils.WIDTH,
            height: Constants.ImageUtils.HEIGHT,
            cropping: true,
            mediaType: Constants.ImageUtils.MEDIA_TYPE,
            compressImageMaxWidth: Constants.ImageUtils.COMPRESS_IMG_MAX_WIDTH,
            compressImageMaxHeight: Constants.ImageUtils.COMPRESS_IMG_MAX_HEIGHT,
            compressImageQuality: Constants.ImageUtils.COMPRESS_IMG_QUALITY,
            compressVideoPreset: Constants.ImageUtils.COMPRESS_VID_PRESET,
            multiple: true
        }).then(images => {
            let array = images.concat(this.state.reviewImages);
            let filteredImages = array.filter((obj, index) => index < Constants.ImageUtils.MAX_IMG_NUM || obj.isAddButton);
            this.setState({
                reviewImages: filteredImages
            });
        }).catch(this.imageErrorHandler);
    }

    validateForm = () => {
        Keyboard.dismiss();

        let reviewNameError, reviewTextError, starCountError;
        let isValide = true;

        if (this.state.starCount === 0) {
            starCountError = this.props.localeStrings.ratingCountError
        }
        reviewNameError = validation("name", this.state.reviewName);
        reviewTextError = validation("reviewText", this.state.reviewText);

        if (reviewNameError ||
            reviewTextError ||
            starCountError) {
            this.setState({
                reviewNameError,
                reviewTextError,
                starCountError
            });

            isValide = false;
        } else {
            this.setState({
                reviewNameError: "",
                reviewTextError: "",
                starCountError: ""
            });
            isValide = true;
        }
        console.log(reviewNameError, '\n', reviewTextError, '\n', starCountError)
        return isValide;
    };

    //UI methods
    renderProductDetail = () => {
        return (
            <View style={{flex: 1}}>
                <View style={styles.nameContainer}>
                    <Label color={Color.TEXT_DARK}
                           xlarge
                           bolder={IS_IOS}
                           nunito_bold>
                        {this.state.productDetail.name}
                    </Label>
                </View>
                <View style={styles.priceRatingContainer}>
                    <View style={styles.priceContainer}>
                        <Label
                            color={this.state.productDetail.special ? Color.ERROR : Color.TEXT_DARK}
                            nunito_bold
                            bolder={IS_IOS}
                            me={5}>
                            {this.state.productDetail.price}
                        </Label>
                        {this.state.productDetail.special &&
                        <Label color={Color.TEXT_LIGHT}
                               me={5}
                               ms={5}
                               nunito_bold
                               bolder={IS_IOS}
                               style={{textDecorationLine: 'line-through'}}>
                            {this.state.productDetail.special}
                        </Label>
                        }
                        {this.state.productDetail.special &&
                        <View style={styles.discountView}>
                            <Label color={Color.WHITE}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   xsmall>
                                {`${this.state.productDetail.percentage}% ${this.props.localeStrings.off}`}
                            </Label>
                        </View>
                        }
                    </View>
                </View>
            </View>
        )
    };

    renderRatings = (productRating, iconSize = ThemeUtils.fontNormal) => {
        return (
            <View style={{
                flex: 1,
                marginVertical: 10
            }}>
                <Label color={Color.TEXT_DARK}
                       me={10}
                       nunito_bold
                       bolder={IS_IOS}>
                    {this.props.localeStrings.rateProduct}
                </Label>
                <View style={styles.ratingsContainer}>
                    {new Array(5).fill(0).map((item, index) => {
                        return (
                            <TouchableHighlight
                                key={`${index}`}
                                style={{marginEnd: 10}}
                                underlayColor={Color.TRANSPARENT}
                                activeOpacity={0.9}
                                onPress={() => {
                                    this.setState({
                                        starCount: index + 1,
                                        starCountError: ''
                                    }, () => {
                                        console.log('rating', index + 1);
                                    })
                                }}>
                                <Icon
                                    name={'star_fill'}
                                    size={30}
                                    color={(index + 1) > this.state.starCount ? Color.TEXT_LIGHT : Color.RATING_COLOR}/>
                            </TouchableHighlight>)
                    })}
                </View>
                {this.state.starCountError ?
                    <Label color={Color.ERROR}
                           mt={5}
                           xsmall>
                        {this.state.starCountError}
                    </Label> : null
                }
            </View>
        )
    };

    renderNameInput = () => {
        return (
            <View style={{
                flex: 1,
                marginVertical: 5
            }}>
                <Label color={Color.TEXT_DARK}
                       me={10}
                       mb={5}
                       nunito_bold
                       bolder={IS_IOS}>
                    {this.props.localeStrings.yourName}
                    <Label color={Color.ERROR}>{'  *'}</Label>
                </Label>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={[styles.nameInput, {
                            textAlign: I18nManager.isRTL ? 'right' : 'left'
                        }]}
                        placeholder={this.props.localeStrings.reviewFullName}
                        placeholderTextColor={Color.TEXT_LIGHT}
                        value={this.state.reviewName}
                        autoCorrect={false}
                        onFocus={() => {
                            this.setState({reviewNameError: ""})
                        }}
                        onChangeText={(val) => {
                            this.setState({
                                reviewName: val
                            })
                        }}
                        onBlur={() => {
                            if (this.state.reviewName) {
                                this.setState(prevState => ({
                                    reviewName: capitalizeLetters(prevState.reviewName)
                                }))
                            }
                        }}
                    />
                </View>
                {this.state.reviewNameError ?
                    <Label color={Color.ERROR}
                           xsmall>
                        {this.state.reviewNameError}
                    </Label> : null
                }
            </View>
        )
    };

    renderReviewInput = () => {
        return (
            <View style={{
                flex: 1,
                marginVertical: 5
            }}>
                <Label color={Color.TEXT_DARK}
                       me={10}
                       mb={5}
                       nunito_bold
                       bolder={IS_IOS}>
                    {this.props.localeStrings.yourReview}
                    <Label color={Color.ERROR}>{'  *'}</Label>
                </Label>
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={input => {
                            this.reviewTextInput = input
                        }}
                        style={[styles.reviewInput, {
                            textAlign: I18nManager.isRTL ? 'right' : 'left'
                        }]}
                        placeholder={this.props.localeStrings.writeYourReview}
                        placeholderTextColor={Color.TEXT_LIGHT}
                        multiline
                        value={this.state.reviewText}
                        autoCorrect={false}
                        inputAccessoryViewID={'inputAccessoryViewID'}
                        onFocus={() => {
                            this.setState({reviewTextError: ""})
                        }}
                        onChangeText={(val) => {
                            this.setState({
                                reviewText: val
                            })
                        }}
                    />
                </View>
                {this.state.reviewTextError ?
                    <Label color={Color.ERROR}
                           xsmall>
                        {this.state.reviewTextError}
                    </Label> : null
                }
            </View>
        )
    };

    renderImageItems = (index, item) => {
        if (!item.isAddButton) return (
            <View style={styles.reviewImageContainer}>
                <Image source={{uri: item.path}}
                       style={styles.reviewImage}
                       cache='force-cache'/>
                <Icon name="cancel" size={15} style={styles.closeIcon}
                      onPress={() => this.removeImage(index)}
                />
            </View>
        );
        else if (this.state.reviewImages.length < 6) return (
            <TouchableOpacity style={styles.reviewImageContainer}
                              activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              onPress={this.openBottomSheet}>
                <Text style={{fontSize: 50, color: Color.TEXT_LIGHT, includeFontPadding: false}}>
                    {'+'}
                </Text>
            </TouchableOpacity>
        )
    };

    renderAddImage = () => {
        return (
            <View style={{flex: 1, marginVertical: 5}}>
                <Label color={Color.TEXT_DARK}
                       me={10}
                       mb={5}
                       nunito_bold
                       bolder={IS_IOS}>
                    {this.props.localeStrings.addImages}
                </Label>
                <FlatList
                    data={this.state.reviewImages}
                    renderItem={
                        ({index, item}) => this.renderImageItems(index, item)
                    }
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    extraData={this.state}/>
            </View>
        )
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation;

        return {
            title: "navWriteReview",
            header: (props) => <CustomNavigationHeader {...props}
                                                       showRightButton={false}
                                                       showLeftButton
                                                       isMainTitle={false}/>
        }
    };

    constructor(props) {
        super(props);
        let productData =
            this.props.navigation.state.params &&
            this.props.navigation.state.params.productData ?
                this.props.navigation.state.params.productData : null;

        this.state = {
            productDetail: productData,
            isLoaderVisible: false,
            starCount: 0,
            starCountError: '',
            reviewName: '',
            reviewNameError: '',
            reviewText: '',
            reviewTextError: '',
            reviewImages: [{
                size: 1907,
                mime: "image/jpeg",
                height: 200,
                width: 300,
                path: "",
                isAddButton: true
            }]
        };
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
                    style={{flex: 1}}
                >
                    <View style={styles.container}>
                        {this.state.productDetail &&
                        this.state.productDetail.images &&
                        this.state.productDetail.images.length > 0 &&
                        <View style={styles.imgContainer}>
                            <Image
                                source={{uri: decodeImageUrl(this.state.productDetail.images[0].popup)}}
                                style={styles.image}
                            />
                        </View>
                        }
                        {this.state.productDetail &&
                        <View style={{flex: 1}}>
                            <View style={styles.detailsContainer}>
                                {this.renderProductDetail()}
                            </View>
                            <Hr lineStyle={styles.lineSeparator}/>
                            <View style={styles.detailsContainer}>
                                {this.renderRatings()}
                            </View>
                            <View style={styles.detailsContainer}>
                                {this.renderNameInput()}
                            </View>
                            <View style={styles.detailsContainer}>
                                {this.renderReviewInput()}
                            </View>
                            <View style={styles.detailsContainer}>
                                {this.renderAddImage()}
                            </View>
                        </View>
                        }
                    </View>
                    <View style={styles.submitBtn}>
                        <RoundButton width={ThemeUtils.relativeWidth(90)}
                                     backgroundColor={Color.PRIMARY_DARK}
                                     mt={10}
                                     mb={10}
                                     border_radius={5}
                                     btnPrimary
                                     textColor={Color.WHITE}
                                     click={this.onClickSubmit}>
                            {this.props.localeStrings.submit}
                        </RoundButton>
                    </View>
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
        )
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
        appConfig: state.appConfig,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(WriteReview);
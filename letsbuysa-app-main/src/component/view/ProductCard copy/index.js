import React, {Component} from 'react';
import {Image, TouchableOpacity, View,} from 'react-native';
//Third party
import {connect} from "react-redux";
import PropTypes from "prop-types";
//Custom component
import {Bounceable, Label,} from "src/component";
//Utility
import {API_ADD_TO_CART, API_ADD_WISHLIST, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {
    Color,
    Constants,
    decodeImageUrl,
    Icon,
    IS_IOS,
    showErrorSnackBar,
    showInfoSnackBar,
    showSuccessSnackBar,
    ThemeUtils,
    AdjustAnalyticsService
} from "src/utils";
import Action from "src/redux/action";


class ProductCard extends Component {

    //Server request
    addToWishlistRequest = () => {
        let params = {
            "customer_id": this.props.user.customer_id,
            "product_id": this.props.productData.product_id,
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_ADD_WISHLIST)
            .reqURL(ApiURL.addToWishlist)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    addToCart = () => {
        let params = {
            "customer_id": this.props.user.customer_id,
            "product_id": this.props.productData.product_id,
            "quantity": 1
        };

        if (Array.isArray(this.props.productData.options)
            && this.props.productData.options.length > 0) {
            this.props.productData.options.map((option) => {
                params[`option[${option.product_option_id}]`] = option.product_option_value[0].product_option_value_id;
            });
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_ADD_TO_CART)
            .reqURL(ApiURL.addToCart)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        switch (reqId) {
            case API_ADD_WISHLIST:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            response.data.wishlist !== null &&
                            response.data.wishlist !== undefined) {
                            //show toast
                            showSuccessSnackBar(response.data.wishlist ? this.props.localeStrings.productAddWishlist : this.props.localeStrings.productRemoveWishlist);
                            if (response.data.wishlist_count !== null && response.data.wishlist_count !== undefined) {
                                this.props.setWishlistCount(parseInt(response.data.wishlist_count));
                            }
                            this.updateProductData(this.currentWishlistProduct, response.data.wishlist);
                        }
                        break;
                }
                break;
            case API_ADD_TO_CART:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            response.data.success) {
                            //show toast
                            setTimeout(() => {
                                showSuccessSnackBar(this.props.localeStrings.productAddCart);
                                if (response.data.cart_count !== null && response.data.cart_count !== undefined) {
                                    this.props.setCartCount(parseInt(response.data.cart_count));
                                }
                            }, 500)
                        }
                        break;
                }
                break;
        }
    };

    onError = (error, reqId) => {
        console.log('error', error);
        switch (reqId) {
            case API_ADD_WISHLIST:
            case API_ADD_TO_CART:
                let msg = this.props.localeStrings.errorMessage;
                if (error && error.meta.message) {
                    msg = error.meta.message
                }
                showErrorSnackBar(msg);
                break;
        }
    };

    //Utility
    updateProductData = (product, updateVal) => {
        this.props.onUpdateProduct(product, updateVal)
    };

    getImageThumb = (url) => {

        if (url) {
            let thumb_url = decodeImageUrl(url);
            // thumb_url = thumb_url.replace('500x500', '200x200');
            return thumb_url
        }
        return ""
    };

    getWishlistStatus = (item) => {
        if (this.props.user) {
            return item.wishlist ? "wishlist_fill" : "wishlist_normal"
        } else {
            let findIdx = this.props.wishlist.findIndex(
                product => product.product_id === item.product_id);
            return findIdx === -1 ? "wishlist_normal" : "wishlist_fill"
        }
    };

    //User Interaction
    onClickProduct = (item) => {
        this.props.onPress(item);
    };

    onClickWishlist = () => {

        //analytics
        AdjustAnalyticsService.addToWishlistEvent();

        this.currentWishlistProduct = this.props.productData;
        if (this.props.user) {
            this.addToWishlistRequest();
        } else {
            this.props.addToWishlist(this.props.productData);
        }
    };

    onClickCart = () => {

        //analytics
        AdjustAnalyticsService.addToCartEvent();

        if (Array.isArray(this.props.productData.options)
            && this.props.productData.options.length > 0) {
            /*let selectedOptions = {},
                selectedOptionsDetail = [];
            this.props.productData.options.map(option => {
                let optionType = option.product_option_id; //type of option id eg. "Choose Color"
                let optionValue = option.product_option_value[0].product_option_value_id; //value of option id eg. "Purple"

                //add key value pairs eg.: {"344":"255"}
                selectedOptions = {
                    ...selectedOptions,
                    ...{[`${optionType}`]: `${optionValue}`}
                }
            });

            this.props.productData.options.map(option => {
                //add key value pairs eg.: {"344":"255"}
                option.product_option_value[0].value = option.product_option_value[0].name;
                let {name, ...rest} = option.product_option_value[0];
                selectedOptionsDetail.push({
                    name: option.name,
                    ...option,
                    ...rest
                })
            });


            addedProduct[`selectedOptions`] = selectedOptions;
            selectedOptionsDetail.length > 0 ? addedProduct[`option`] = selectedOptionsDetail : null;*/

            showInfoSnackBar(this.props.localeStrings.optionsError);
            this.props.onPress(this.props.productData);
        } else {
            if (this.props.user) {
                this.addToCart()
            } else {
                setTimeout(() => {
                    let addedProduct = {
                            type: 'increment_local',
                            quantity: 1,
                            ...this.props.productData
                        };
                    this.props.addToCart(addedProduct);
                    showSuccessSnackBar(this.props.localeStrings.productAddCart)
                }, 500);
            }
        }
    };

//UI methods

//Lifecycle methods

    constructor(props) {
        super(props);

        this.state = {};

        this.currentWishlistProduct = null;
    }

    componentWillMount() {
    };

    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.wishlist !== prevProps.wishlist && this.currentWishlistProduct) {
            let findIndex = this.props.wishlist.findIndex(product => product.product_id === this.currentWishlistProduct.product_id);
            if (findIndex === -1) {
                //if product removed
                console.log('called in productcard remove')
                this.updateProductData(this.currentWishlistProduct, false);
            } else {
                //if product added
                console.log('called in productcard add')
                this.updateProductData(this.currentWishlistProduct, true);
            }
        }
    }

    render() {
        let isDisabled = true,
            isOutOfStock = false;
        if (this.props.productData) {
            if (this.props.productData.qty !== null && this.props.productData.qty !== undefined) {
                if (parseInt(this.props.productData.qty) === 0) {
                    isOutOfStock = true;
                } else {
                    isOutOfStock = false;
                    isDisabled = false;
                }
            }
        }
        let item = this.props.productData;
        return item ? (
            <View
                style={[
                    styles.itemContainer, {
                        width: this.props.itemWidth
                    }]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    underlayColor={Color.TRANSPARENT}
                    onPress={() => {
                        this.onClickProduct(item)
                    }}>
                    <View style={styles.itemImageContainer}>
                        <Image source={{uri: this.getImageThumb(item.thumb)}}
                               style={[
                                   styles.itemImage, {
                                       width: this.props.itemWidth,
                                   }, isOutOfStock ? {opacity: 0.5} : null]}/>
                        {item.special &&
                        <View style={styles.discountContainer}>
                            <Label color={Color.WHITE}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   xsmall>
                                {`${item.percentage}% ${this.props.localeStrings.off}`}
                            </Label>
                        </View>
                        }
                    </View>
                    <View style={styles.itemDetailContainer}>
                        <Label color={Color.TEXT_DARK}
                               mt={5}
                               small
                               singleLine>
                            {item.name.trim()}
                        </Label>
                        {this.props.showDescription ?
                            <Label color={Color.TEXT_LIGHT}
                                   mt={5}
                                   numberOfLines={2}
                                   xsmall>
                                {item.description.trim()}
                            </Label> : null
                        }
                    </View>
                    <View style={styles.itemPriceContainer}>
                        <Label color={item.special ? Color.ERROR : Color.TEXT_DARK}
                               xsmall
                               nunito_bold
                               bolder={IS_IOS}
                               me={5}>
                            {item.special ? item.special : item.price}
                        </Label>
                        {item.special &&
                        <Label color={Color.TEXT_LIGHT}
                               xsmall
                               ms={5}
                               nunito_bold
                               bolder={IS_IOS}
                               style={{textDecorationLine: 'line-through'}}>
                            {item.price}
                        </Label>
                        }
                    </View>
                </TouchableOpacity>
                <View style={{flex: 1, justifyContent: 'flex-end'}}>
                    <View style={styles.itemActionContainer}>
                        <Bounceable
                            onPress={this.onClickWishlist} level={1.3}>
                            <View style={styles.btnFavourite}>
                                <Icon color={Color.PRIMARY}
                                      size={18}
                                      name={this.getWishlistStatus(item)}
                                />
                            </View>
                        </Bounceable>

                        <TouchableOpacity
                            style={styles.btnAddToCart}
                            activeOpacity={0.5}
                            underlayColor={Color.TRANSPARENT}
                            disabled={isDisabled}
                            onPress={this.onClickCart}>
                            <Icon color={isOutOfStock ? Color.RED : Color.PRIMARY}
                                  size={18}
                                  name={"order_normal"}
                            />
                            <Label color={isOutOfStock ? Color.RED : Color.TEXT_DARK}
                                   xsmall
                                   ms={8}
                                   nunito_bold
                                   bolder={IS_IOS}>
                                {isOutOfStock ? this.props.localeStrings.outOfStock : this.props.localeStrings.addToCart}
                            </Label>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ) : null;
    }
}

ProductCard
    .defaultProps = {
    itemWidth: ThemeUtils.relativeWidth(43),
    showDescription: false
};

ProductCard
    .propTypes = {
    productData: PropTypes.object.isRequired,
    onPress: PropTypes.func.isRequired,
    onUpdateProduct: PropTypes.func.isRequired,
    itemWidth: PropTypes.number,
    showDescription: PropTypes.bool
};

const
    mapDispatchToProps = (dispatch) => {
        return {
            setWishlistCount: (count) => dispatch(Action.setWishlistCount(count)),
            addToCart: (product) => dispatch(Action.addToCart(product)),
            addToWishlist: (product) => dispatch(Action.addToWishlist(product)),
            setCartCount: (count) => dispatch(Action.setCartCount(count)),
        }
    };

const
    mapStateToProps = (state) => {
        if (state === undefined)
            return {};
        return {
            user: state.user,
            wishlist: state.wishlist,
            cart: state.cart,
            localeStrings: state.localeStrings
        }
    };

export default connect(mapStateToProps, mapDispatchToProps)(ProductCard)

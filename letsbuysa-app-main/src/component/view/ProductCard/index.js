import React, {Component} from 'react';
import {Image, TouchableOpacity,TouchableHighlight, View,} from 'react-native';
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
    AdjustAnalyticsService,
    numberWithCommas,
} from "src/utils";

import Action from "src/redux/action";


class ProductCard extends Component {


    
    //Server request
    addToWishlistRequest = () => {
        let params = {
            "customer_id": this.props.user.customer_id,
            "product_id": this.props.productData.id || this.props.productData.product_id,
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
            "product_id": this.props.productData.id,
            "quantity": 1
        };

        if (Array.isArray(this.props.productData?.options)
            && this.props.productData?.options?.length > 0) {
            this.props.productData?.options.map((option) => {
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
            let thumb_url = decodeImageUrl(this.props?.imagepath + url);
            // thumb_url = thumb_url.replace('500x500', '200x200');
            return thumb_url
        }
        return ""
    };

    getWishlistStatus = (item) => {
        // console.log('wiss',item)
        // console.log('wiss',this.props.wishlist)

        if (this.props.user) {
            return item.wishlist ? "wishlist_fill" : "wishlist_normal"
        } else {
            let findIdx = this.props.wishlist.findIndex(
                product => product.id === item.id);
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

        console.log('my options are',this.props.productData)

        if (this.props.productData.optionid > 0) {

            showInfoSnackBar(this.props.localeStrings.optionsError);
            this.props.onPress(this.props.productData);
        } else {
            if (this.props.user) {
                this.addToCart()
            } else {
                const updatedProductData = {...this.props.productData,qty:this.props.productData.quantity,quantity:1, productPath:this.props.imagepath}
                setTimeout(() => {
                    let addedProduct = {
                        type: 'increment_local',
                            ...updatedProductData
                        };
                        this.props.addToCart(addedProduct);
                        //this.props.setCartCount(parseInt('1'));
                            showSuccessSnackBar(this.props.localeStrings.productAddCart)
                }, 500);
                                                  
            }
        }
    };

//UI methods

renderRatings = (productRating, iconSize = ThemeUtils.fontXXXSmall) => {
    return (
        <View style={{
           
        }}>
          
            <View style={styles.ratingsContainer}>
                {new Array(5).fill(0).map((item, index) => {
                    return (
                        <TouchableHighlight
                            key={`${index}`}
                            style={{marginEnd: 2}}
                            underlayColor={Color.TRANSPARENT}
                            activeOpacity={0.9}
                           >
                            <Icon
                                name={'star_fill'}
                                size={iconSize}
                                color={(index + 1) > parseInt(productRating) ? Color.TEXT_LIGHT : Color.BLACK}/>
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
            let findIndex = this.props.wishlist.findIndex(product => product.id === this.currentWishlistProduct.id);
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
        const regex = /(<([^>]+)>)/ig;
        let isDisabled = true,
            isOutOfStock = false;
        if (this.props.productData) {
            if (this.props.productData?.quantity !== null && this.props.productData?.quantity !== undefined) {
                if (parseInt(this.props.productData?.quantity) === 0) {
                    isOutOfStock = true;
                }
                if (parseInt(this.props.productData?.stock_availabity) !== 1) {
                    isOutOfStock = true;
                } else {
                    isOutOfStock = false;
                    isDisabled = false;
                }
            }
        }
        let item = this.props.productData;
        let card=null;
        if(item){
            card=!this.props.newDesign?(
                <View
                    style={[
                        styles.itemContainer, {
                            width: this.props.itemWidth
                        }]}>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        underlayColor={Color.TRANSPARENT}
                        style={{alignItems:'flex-end'}}
                        onPress={() => {
                            this.onClickProduct(item)
                        }}>
                        <View style={styles.itemImageContainer}>
                            <Image source={{uri: this.getImageThumb(item.thumb || item.img)}}
                                style={[
                                    styles.itemImage, {
                                        width: this.props.itemWidth,
                                    }, isOutOfStock ? {opacity: 0.5} : null]}/>
                            {item.offer_price &&  item.discount_available &&
                            <View style={styles.discountContainer}>
                                <Label color={Color.WHITE}
                                    nunito_bold
                                    bolder={IS_IOS}
                                    xsmall>
                                    {`${item.discount_available}% ${this.props.localeStrings.off}`}
                                </Label>
                            </View>
                            }
                             {isOutOfStock &&
                            <View style={styles.newOutOfStockContainer}>
                                <Label 
                                    color={Color.WHITE}
                                    nunito_bold
                                    bolder={IS_IOS}
                                    xsmall
                                >
                                    {`${this.props.localeStrings.soldout || 'Sold Out'}`}
                                </Label>
                            </View>
                            }
                        </View>
                        <View style={styles.itemDetailContainer}>
                            {item?.brandname?  <Label 
                                color={Color.BLACK}
                                mt={5}
                                xxsmall
                                opensans_regular
                                singleLine
                            >
                                {item?.brandname?.trim()}
                            </Label> : null}
                            <Label color={Color.BLACK}
                                mt={5}
                                small
                                singleLine>
                                {item.name?.trim()}
                            </Label>
                            {/* {this.props.showDescription ?
                                <Label color={Color.TEXT_LIGHT}
                                    mt={5}
                                    numberOfLines={2}
                                    xsmall>
                                    {item.description?.trim()}
                                </Label> : null
                            } */}
                             {/* {this.props.showDescription ?
                                <Label color={Color.TEXT_LIGHT}
                                    mt={5}
                                    numberOfLines={2}
                                    xsmall>
                                    {item.description?.replace(regex, '')}
                                </Label> : null
                            } */}
                        </View>
                        <View style={styles.itemPriceContainer}>
                            <View style={{flexDirection:'row'}}>
                            <Label color={item.offer_price ? Color.ERROR : Color.TEXT_DARK}
                                large
                                nunito_bold
                                bolder={IS_IOS}
                                me={5}>
                                {item?.offer_price ? `SR ${numberWithCommas(item.price)}` : `SR ${numberWithCommas(item?.price || '0')}`}
                            </Label>
                            {item.offer_price && item.price &&
                            <Label color={Color.TEXT_LIGHT}
                                xsmall
                                ms={5}
                                nunito_bold
                                bolder={IS_IOS}
                                style={{textDecorationLine: 'line-through'}}>
                                {`SR ${numberWithCommas(item?.offer_price || '0')}`}
                            </Label>
                            }
                            </View>
                            {item.rating && this.renderRatings(item.rating)}
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
                                style={[styles.btnAddToCart,{opacity : isDisabled ? 0.6 : 1.0}]}
                                activeOpacity={0.5}
                                underlayColor={Color.TRANSPARENT}
                                disabled={isDisabled}
                                onPress={this.onClickCart}>
                                <Icon color={isOutOfStock ? Color.TEXT_LIGHT_GRAY :Color.PRIMARY}
                                    size={18}
                                    name={"order_normal"}
                                />
                                <Label 
                                    color={isOutOfStock ? Color.TEXT_LIGHT_GRAY :Color.TEXT_DARK}
                                    xxsmall
                                    ms={8}
                                    opensans_bold
                                    bolder={IS_IOS}>
                                    {isOutOfStock ? this.props.localeStrings.outOfStock: this.props.localeStrings.addToCart}
                                </Label>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            ):
            (
                <View
                    style={[
                        styles.itemContainer, {
                            width: this.props.itemWidth
                    }]}
                >
                    <TouchableOpacity
                        activeOpacity={0.7}
                        underlayColor={Color.TRANSPARENT}
                        onPress={() => {
                            this.onClickProduct(item)
                        }}>
                        <View style={styles.itemImageContainer}>
                            <Image source={{uri: this.getImageThumb(item.thumb || item.img)}}
                                style={[
                                    styles.itemImage, {
                                        width: this.props.itemWidth,
                                    }, isOutOfStock ? {opacity: 0.5} : null]}/>
                            {item.offer_price && item.discount_available &&
                            <View style={styles.newDiscountContainer}>
                                <Label 
                                    color={Color.BLACK}
                                    nunito_bold
                                    bolder={IS_IOS}
                                    xsmall
                                >
                                    {`${item.discount_available}% ${this.props.localeStrings.off}`}
                                </Label>
                            </View>
                            }

                        {isOutOfStock &&
                            <View style={styles.newOutOfStockContainer}>
                                <Label 
                                    color={Color.WHITE}
                                    nunito_bold
                                    bolder={IS_IOS}
                                    xsmall
                                >
                                    {`${this.props.localeStrings.soldout || 'Sold Out'}`}
                                </Label>
                            </View>
                            }
                        </View>
                       
                        <View style={styles.itemDetailContainer}>
                        {item?.brandname?  <Label 
                                color={Color.BLACK}
                                mt={5}
                                xxsmall
                                opensans_regular
                                singleLine
                            >
                                {item?.brandname?.trim()}
                            </Label> : null}
                            <Label 
                                color={Color.BLACK}
                                mt={5}
                                small
                                opensans_bold
                                singleLine
                            >
                                {item.name?.trim()}
                            </Label>
                        </View>
                        <View style={styles.itemPriceContainer}>
                          <View style={{flexDirection:'row'}}>
                            <Label color={item.offer_price ? Color.RED : Color.TEXT_DARK}
                                small
                                opensans_bold
                                bolder={IS_IOS}
                                me={2}>
                                {item.offer_price ? `SR ${numberWithCommas(item.price)}` : `SR ${numberWithCommas(item?.price || '0')}`}
                            </Label>
                            {item.offer_price && item.price &&
                                <Label color={Color.TEXT_LIGHT_GRAY}
                                    small
                                    ms={2}
                                    opensans_regular
                                    bolder={IS_IOS}
                                    style={{textDecorationLine: 'line-through'}}>
                                    {`SR ${numberWithCommas(item?.offer_price || '0')}`}
                                </Label>
                                }
                          </View>
                        </View>
                        <View style={styles.itemPriceContainer}>

                        {item.rating && this.renderRatings(item.rating)} 
                        </View>   

                      
                    </TouchableOpacity>
                    <View style={{flex: 1, justifyContent: 'flex-end'}}>
                        <View style={styles.newItemActionContainer}>
                            <TouchableOpacity
                                style={[styles.newBtnAddToCart,{opacity:isDisabled ? 0.6 : 1.0}]}
                                activeOpacity={0.5}
                                underlayColor={Color.TRANSPARENT}
                                disabled={isDisabled}
                                onPress={this.onClickCart}>
                                <Icon color={isOutOfStock ? Color.TEXT_LIGHT_GRAY : Color.PRIMARY}
                                    size={18}
                                    name={"order_normal"}
                                />
                                <Label 
                                    color={isOutOfStock ? Color.TEXT_LIGHT_GRAY :Color.PRIMARY}
                                    xxsmall
                                    ms={8}
                                    opensans_bold
                                    bolder={IS_IOS}>
                                    {isOutOfStock ? this.props.localeStrings.outOfStock : this.props.localeStrings.addToCart}

                                </Label>
                            </TouchableOpacity>
                            <View style={ styles.heartContainer }>
                                <Bounceable
                                    onPress={this.onClickWishlist} 
                                    level={1.3}
                                >
                                    <View>
                                        <Icon color={Color.BLACK}
                                            size={18}
                                            name={this.getWishlistStatus(item)}
                                        />
                                    </View>
                                </Bounceable>
                            </View>
                        </View>
                    </View>
                </View>
            )    
        }

        return card;
    }
}

ProductCard.defaultProps = {
    itemWidth: ThemeUtils.relativeWidth(42),
    showDescription: false,
    newDesign:false,
};

ProductCard.propTypes = {
    productData: PropTypes.object.isRequired,
    onPress: PropTypes.func.isRequired,
    onUpdateProduct: PropTypes.func.isRequired,
    itemWidth: PropTypes.number,
    showDescription: PropTypes.bool,
    newDesign:PropTypes.bool,
};

const mapDispatchToProps = (dispatch) => {
    return {
        setWishlistCount: (count) => dispatch(Action.setWishlistCount(count)),
        addToCart: (product) => dispatch(Action.addToCart(product)),
        addToWishlist: (product) => dispatch(Action.addToWishlist(product)),
        setCartCount: (count) => dispatch(Action.setCartCount(count)),
    }
};

const mapStateToProps = (state) => {
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

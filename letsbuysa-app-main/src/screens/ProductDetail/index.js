import React, {Component} from 'react';
import {
  Animated,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  I18nManager,
  Alert,
  Share,
  BackHandler,
  Keyboard,
  Text
} from 'react-native';

//Third party
import {connect} from 'react-redux';
import Spinner from 'react-native-loading-spinner-overlay';
import {IndicatorViewPager, PagerDotIndicator} from 'rn-viewpager';
import {NavigationActions, SafeAreaView, StackActions} from 'react-navigation';
import moment from 'moment';
import ReadMore from 'react-native-read-more-text';
import HTML from "react-native-render-html";


import {AntDesign} from 'react-native-vector-icons';

//Custom component
import {
  Label,
  Hr,
  Ripple,
  ProductCard,
  CustomNavigationHeader,
  Bounceable,
  ModalDropdown,
} from 'src/component';

//Utility
import Action from 'src/redux/action';
import {
  API_GET_PRODUCT_DETAIL,
  API_ADD_WISHLIST,
  API_ADD_TO_CART,
  API_CHECKOUT_CART,
  APIRequest,
  ApiURL,
} from 'src/api';
import styles from './styles';
import Routes from 'src/router/routes';
import {
  Color,
  ThemeUtils,
  Constants,
  IS_IOS,
  Icon,
  Strings,
  showSuccessSnackBar,
  CommonStyle,
  decodeImageUrl,
  showErrorSnackBar,
  isHexValid,
  extractProductSlug,
  IS_ANDROID,
  AdjustAnalyticsService,
} from 'src/utils';

const AnimatedIcon = Animated.createAnimatedComponent(Icon);
const animationDuration = 300;
const animType = {
  ANIM_WISHLIST: 1,
  ANIM_CART: 2,
};

class ProductDetail extends Component {
  //Localized assets
  MenuItems = [
    {
      id: 1,
      label: this.props.localeStrings.features,
    },
    {
      id: 2,
      label: this.props.localeStrings.descriptions,
    },
  ];

  //Server request
  addToWishlistRequest = () => {
    let params = {
      customer_id: this.props.user.customer_id,
      product_id: this.state.product_id,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_ADD_WISHLIST)
      .reqURL(ApiURL.addToWishlist)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  addToCartRequest = () => {
    let params = {
      customer_id: this.props.user.customer_id,
      product_id: this.state.product_id,
      quantity: parseInt(this.state.currentQuantity),
    };

    if (Array.isArray(this.state.options) && this.state.options.length > 0) {
      let isSubOptions = false;
      this.state.options.map(aOption => {
        if (aOption?.productoptions1?.length > 0) {
          isSubOptions = true;
        }
      });

      if (isSubOptions) {
        if (
          Array.isArray(this.state.selectedOptions) &&
          this.state.selectedOptions.length > 0
        ) {
          this.state.selectedOptions.map(option => {
            params[`option_id`] = option[Object.keys(option)[0]];
          });
        } else {
          /*this.state.productDetail.options.map((option) => {
                    params[`option[${option.product_option_id}]`] = option.product_option_value[0].product_option_value_id;
                });*/
          showErrorSnackBar(this.props.localeStrings.optionsError);
          return;
        }
      } else {
        if (this.state.selectedColor) {
          params[`option_id`] = this.state.selectedColor.id;
        }
      }
    } else {
      if (this.state.selectedColor) {
        params[`option_id`] = this.state.selectedColor.id;
      }
    }
    this.startImgAnim(animType.ANIM_CART);

    new APIRequest.Builder()
      .post()
      .setReqId(API_ADD_TO_CART)
      .reqURL(ApiURL.addToCart)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  getProductDetail = (option_value_id = null) => {
    this.setState({
      isLoaderVisible: true,
    });
    let params = {};
    if (
      this.state.fromDeeplink &&
      extractProductSlug(this.state.fromDeeplink)
    ) {
      let slug = extractProductSlug(this.state.fromDeeplink);
      slug = slug.replace('/', '');
      params['slug'] = slug;
    } else {
      params['product_id'] =
        this.state.productData?.id || this.state.productData?.product_id;
    }

    if (option_value_id !== null && option_value_id !== undefined) {
      params['option_value_id'] = option_value_id;
    }

    if (this.props.user) {
      params['customer_id'] = this.props.user.customer_id;
    }

    if (this.state.fromNotif !== null && this.state.fromNotif !== undefined) {
      params['notification_id'] = this.state.fromNotif;
    }
    new APIRequest.Builder()
      .post()
      .setReqId(API_GET_PRODUCT_DETAIL)
      .reqURL(ApiURL.getProductDetail)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  checkoutCartRequest = () => {
    this.setState({
      isLoaderVisible: true,
    });

    let params = {
      customer_id: this.props.user.customer_id,
    };

    new APIRequest.Builder()
      .post()
      .setReqId(API_CHECKOUT_CART)
      .reqURL(ApiURL.checkoutCart)
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
      case API_GET_PRODUCT_DETAIL:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.product) {
              //check for local and server data for wishlist
              let wishlist =
                this.getWishlistStatus(response.data.product) ===
                'wishlist_fill';

              this.setState({
                productDetail: {...response.data.product, wishlist},
                productFeatures: response.data.product_delivery_features,
                product_id:
                  response.data.product.id || response.data.product.product_id,
                currentQuantity: response.data.product?.quantity || 1,
                // options: response.data.option,
                options: response.data.option.filter(
                  option => option?.productoptions1?.length > 0,
                ),

                product_attribute: response.data.product_attribute,
                colors: response.data.color.filter(
                  item => item?.color !== null,
                ),
                selectedColor:
                  response.data.color !== null || response.data.color.length > 0
                    ? response.data.color[0]
                    : null,
                attributes:
                  response.data.product?.product_attributes_en ||
                  response.data.product?.product_attributes_ar,
                productReviews: response.data.productreviews[0].product_reviews,
                recentlyViewProducts: response.data.all_recently_products,
                relatedProducts: response.data.related,
                product_path: response.data.product_path,
                review_path: response.data.review_path,
                recently: response.data.recently,
              });

              if (!this.props.user) {
                let recentProductsFilteres = this.props.recentProducts.filter(
                  product => product.id !== this.state.productData.id,
                );
                this.setState({
                  recentlyViewProducts: recentProductsFilteres.reverse(),
                });
              }
              if (
                this.getWishlistStatus(response.data.product) ===
                'wishlist_fill'
              ) {
              }
            }
            break;
        }
        break;
      case API_ADD_WISHLIST:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (
              response.data &&
              response.data.wishlist !== null &&
              response.data.wishlist !== undefined
            ) {
              //show toast
              showSuccessSnackBar(
                response.data.wishlist
                  ? this.props.localeStrings.productAddWishlist
                  : this.props.localeStrings.productRemoveWishlist,
              );
              let newDetail = {...this.state.productDetail};
              newDetail.wishlist = response.data.wishlist;
              if (
                response.data.wishlist_count !== null &&
                response.data.wishlist_count !== undefined
              ) {
                this.props.setWishlistCount(
                  parseInt(response.data.wishlist_count),
                );
              }
              this.setState({productDetail: newDetail});
            }
            break;
        }
        break;
      case API_ADD_TO_CART:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data && response.data.success) {
              if (
                response.data.cart_count !== null &&
                response.data.cart_count !== undefined
              ) {
                this.props.setCartCount(parseInt(response.data.cart_count));
              }
              if (this.state.buyNow) {
                this.checkoutCartRequest();
              } else {
                //show toast
                setTimeout(() => {
                  showSuccessSnackBar(this.props.localeStrings.productAddCart);
                }, 500);
              }
            }
            break;
        }
        break;
      case API_CHECKOUT_CART:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data) {
              if (
                Array.isArray(response.data.addresses) &&
                response.data.addresses.length > 0
              ) {
                this.props.navigation.navigate(Routes.Checkout, {
                  checkoutParams: response.data,
                });
              } else {
                setTimeout(() => {
                  this.showNoAddressAlert();
                }, 250);
              }
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
      case API_GET_PRODUCT_DETAIL:
      case API_ADD_WISHLIST:
      case API_ADD_TO_CART:
        if (error && error.meta && error.meta.message) {
          showErrorSnackBar(error.meta.message);
        }
        break;
    }
  };

  //User Interaction
  onClickExpandFeature = () => {
    this.setState({featuresExpanded: true});
  };

  onChangeFeatureSection = menuItem => {
    this.setState({currentMenuItem: menuItem});
  };

  onClickExpandReviews = () => {
    this.props.navigation.navigate(Routes.AllReviews, {
      productData: this.state.productDetail,
    });
  };

  onClickWriteReview = () => {
    this.props.navigation.navigate(Routes.WriteReview, {
      productData: this.state.productDetail,
    });
  };

  onClickShareBtn = async () => {
    try {
      let url = this.state.productDetail.href
        ? this.state.productDetail.href.replace(
            'http://localhost/letsbuy',
            Constants.API_CONFIG.BASE_URL,
          )
        : '';
      if (url) {
        const result = await Share.share({
          message: this.state.productDetail.href,
        });
      }
    } catch (error) {}
  };

  onClickProduct = item => {
    this.props.navigation.push(Routes.ProductDetail, {
      productData: item,
    });
  };

  onClickWishlist = () => {
    //analytics
    AdjustAnalyticsService.addToWishlistEvent();

    this.currentProductFavourite = true;
    if (!this.state.productDetail.wishlist) {
      this.startImgAnim(animType.ANIM_WISHLIST);
    }
    if (this.props.user) {
      this.addToWishlistRequest();
    } else {
      this.props.addToWishlist(this.state.productDetail);
    }
  };

  onClickAddToCart = () => {
    //analytics
    AdjustAnalyticsService.addToCartEvent();

    this.setState({buyNow: false}, () => {
      if (this.props.user) {
        this.addToCartRequest();
      } else {
        let addedProduct = {
          ...this.state.productDetail,
          quantity: parseInt(this.state.currentQuantity),
          productPath: this.state.product_path,
        };

        if (
          Array.isArray(this.state.options) &&
          this.state.options.length > 0
        ) {
          if (this.state.selectedColor) {
            addedProduct[`selectedColor`] = this.state.selectedColor;
          }

          if (this.state.selectedSubOption) {
            addedProduct[`selectedOption`] = this.state.selectedOption;
            addedProduct[`selectedSubOption`] = this.state.selectedSubOption;

            //animate and add
            this.onAddToLocalAction(addedProduct);
          } else {
            showErrorSnackBar(this.props.localeStrings.optionsError);
          }
        } else {
          if (this.state.selectedColor) {
            addedProduct[`selectedColor`] = this.state.selectedColor;
          }
          this.onAddToLocalAction(addedProduct);
        }
      }
    });
  };

  onClickBuyNow = () => {
    //analytics
    AdjustAnalyticsService.buyNowEvent();

    if (this.props.user) {
      this.setState({buyNow: true}, () => {
        this.showAdditionalItemsInCart();
      });
    } else {
      this.props.navigation.navigate(Routes.Login, {
        fromRoute: this.props.navigation.state.routeName,
      });
    }
  };

  onChangeQuantity = (index, value) => {
    this.setState({currentQuantity: value});
  };

  onSelectProductOption = (
    optionType,
    productOption,
    selectedOptionValueId,
  ) => {
    let newOptions = [];

    let optionObj = {[optionType.id]: productOption.id};
    newOptions.push(optionObj);

    // if (this.state.selectedOptions.length > 0) {
    //    // Find option object in state selectionOptions
    //     let findOptionIdx = this.state.selectedOptions.findIndex((selectOption) =>
    //         Object.keys(selectOption).includes(optionType.id)
    //     );

    //     //If found, update current option with option value
    //     if (findOptionIdx !== -1) {
    //         newOptions[findOptionIdx] = optionObj;
    //     }
    //     //If not found, add the current option type
    //     else {
    //         newOptions.push(optionObj)
    //     }

    //     newOptions = []

    // } else {
    //     newOptions.push(optionObj);
    // }
    this.setState(
      {
        selectedOptions: newOptions,
        selectedOption: optionType,
        selectedSubOption: productOption,
      },
      () => {
        // this.getProductDetail(productValueID)
      },
    );
  };

  backHandler = () => {
    BackHandler.removeEventListener('ProductDetailPopUpBack', this.backHandler);
    if (
      this.props.navigation.state.params &&
      this.props.navigation.state.params.appState === 'background'
    ) {
      this.props.navigation.pop();
    } else {
      this.props.navigation.dispatch(
        StackActions.reset({
          index: 0,
          key: undefined,
          actions: [NavigationActions.navigate({routeName: Routes.MainRoute})],
        }),
      );
    }

    return true;
  };

  //Utility
  getStockColor = quantity => {
    let qty = parseInt(quantity);
    let textColor = Color.PRIMARY;
    let textLabel = this.props.localeStrings.inStock;

    if (
      this.props.appConfig &&
      this.props.appConfig.min_stock_qty !== null &&
      this.props.appConfig.min_stock_qty !== undefined
    ) {
      if (qty > 0) {
        textColor = Color.PRIMARY;
        textLabel = this.props.localeStrings.inStock;
      } else {
        textColor = Color.RED;
        textLabel = this.props.localeStrings.outOfStock;
      }
    }
    return {textColor, textLabel};
  };

  updateProductData = (product, updateVal) => {
    let similarProducts = this.state.relatedProducts,
      recentProducts = this.state.recentlyViewProducts;

    //first check in similar products
    let idxInSimilar = similarProducts.findIndex(
      item => item.id === product.id,
    );
    if (idxInSimilar !== -1) {
      similarProducts[idxInSimilar] = {...product, wishlist: updateVal};
      this.setState({relatedProducts: similarProducts});
    }
    //second check in recentProducts products
    else {
      let idxInRecent = recentProducts.findIndex(
        item => item.id === product.id,
      );
      if (idxInRecent !== -1) {
        recentProducts[idxInRecent] = {...product, wishlist: updateVal};
        this.setState({recentlyViewProducts: recentProducts});
      }
    }
    showSuccessSnackBar(
      updateVal
        ? this.props.localeStrings.productAddWishlist
        : this.props.localeStrings.productRemoveWishlist,
    );
  };

  onScrollEvent = ({nativeEvent}) => {
    let {contentOffset} = nativeEvent;
    let currentDiff = contentOffset.y - this.prevOffset;
    if (currentDiff > 0) {
      if (contentOffset.y > 300 && this.state.isBtnVisible) {
        Animated.sequence([
          Animated.timing(this.btnIconOpacity, {
            toValue: 0,
            duration: animationDuration / 2,
          }),
          Animated.parallel([
            Animated.timing(this.btnHeight, {
              toValue: 0,
              duration: animationDuration,
            }),
            Animated.timing(this.btnRadius, {
              toValue: 0,
              duration: animationDuration,
            }),
            Animated.timing(this.btnEndMargin, {
              toValue: 30,
              duration: animationDuration,
            }),
            Animated.timing(this.btnBottomMargin, {
              toValue: ThemeUtils.relativeHeight(7) + 20,
              duration: animationDuration,
            }),
          ]),
        ]).start(() => {
          this.setState({isBtnVisible: false});
        });
        this.prevOffset = contentOffset.y;
      }
    } else if (currentDiff < 0) {
      if (contentOffset.y > 200 && !this.state.isBtnVisible) {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(this.btnHeight, {
              toValue: 40,
              duration: animationDuration,
            }),
            Animated.timing(this.btnRadius, {
              toValue: 20,
              duration: animationDuration,
            }),
            Animated.timing(this.btnEndMargin, {
              toValue: 15,
              duration: animationDuration,
            }),
            Animated.timing(this.btnBottomMargin, {
              toValue: ThemeUtils.relativeHeight(8) + 10,
              duration: animationDuration,
            }),
          ]),
          Animated.timing(this.btnIconOpacity, {
            toValue: 1,
            duration: animationDuration / 2,
          }),
        ]).start(() => {
          this.setState({isBtnVisible: true});
        });
        this.prevOffset = contentOffset.y;
      }
    }
  };

  setAnimInit = () => {
    this.animatedImgSize = new Animated.Value(1);
    let initialTop = ThemeUtils.relativeWidth(100) / 2 - 40,
      initialLeft = ThemeUtils.relativeWidth(50) - 40;
    this.animatedImgTop = new Animated.Value(initialTop);
    this.animatedImgLeft = new Animated.Value(
      I18nManager.isRTL ? -initialLeft : initialLeft,
    );
  };

  startImgAnim = type => {
    let leftValue = 0,
      topValue = -30,
      startPoint = ThemeUtils.relativeWidth(100);

    switch (type) {
      case animType.ANIM_WISHLIST:
        leftValue = I18nManager.isRTL
          ? -(ThemeUtils.relativeWidth(50) + 45)
          : startPoint - 125;
        break;
      case animType.ANIM_CART:
        leftValue = I18nManager.isRTL
          ? -(ThemeUtils.relativeWidth(50) + 90)
          : startPoint - 90;
        break;
      default:
        leftValue = startPoint - 75;
        break;
    }
    this.setState(
      {
        isAnimationStarted: true,
      },
      () => {
        Animated.sequence([
          Animated.timing(this.animatedImgSize, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(this.animatedImgTop, {
              toValue: topValue,
              duration: 550,
              useNativeDriver: true,
            }),
            Animated.timing(this.animatedImgLeft, {
              toValue: leftValue,
              duration: 550,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          // this.addToWishlist();
          this.setState({isAnimationStarted: false}, () => {
            this.setAnimInit();
          });
        });
      },
    );
  };

  getWishlistStatus = item => {
    if (this.props.user) {
      return item?.wishlist ? 'wishlist_fill' : 'wishlist_normal';
    } else {
      let findIdx = this.props.wishlist.findIndex(
        product => product.product_id === item.product_id,
      );
      return findIdx === -1 ? 'wishlist_normal' : 'wishlist_fill';
    }
  };

  getProductImages = () => {
    let imgArr = [];
    if (this.state.productDetail) {
      if (
        this.state.productDetail.img !== null &&
        this.state.productDetail.img !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img);
      }
      if (
        this.state.productDetail.img1 !== null &&
        this.state.productDetail.img1 !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img1);
      }
      if (
        this.state.productDetail.img2 !== null &&
        this.state.productDetail.img2 !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img2);
      }
      if (
        this.state.productDetail.img3 !== null &&
        this.state.productDetail.img3 !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img3);
      }
      if (
        this.state.productDetail.img4 !== null &&
        this.state.productDetail.img4 !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img4);
      }
      if (
        this.state.productDetail.img5 !== null &&
        this.state.productDetail.img5 !== ''
      ) {
        imgArr.push(this.state.product_path + this.state.productDetail.img5);
      }
    }
    return imgArr;
    // if (this.state.productDetail &&
    //     this.state.productDetail.images &&
    //     this.state.productDetail.images.length > 0) {
    //     return this.state.productDetail.images;
    // }
    // if (this.state.productDetail &&
    //     this.state.productDetail.thumb) {
    //     return [{popup: this.state.productDetail.thumb}]
    // }
    // return []
  };

  getIsOptionSelected = (optionType, selectedOptionValueId) => {
    let isSelected = false;
    if (this.state.selectedOptions.length > 0) {
      for (let i = 0; i < this.state.selectedOptions.length; i++) {
        if (
          Object.keys(this.state.selectedOptions[i]).includes(
            `${optionType.id}`,
          ) &&
          this.state.selectedOptions[i][`${optionType.id}`] ==
            selectedOptionValueId
        ) {
          isSelected = true;
          break;
        }
      }
    }

    return isSelected;
  };

  onAddToLocalAction = finalProduct => {
    let addedProduct = {
      type: 'increment_local',
      ...finalProduct,
    };
    this.startImgAnim(animType.ANIM_CART);
    setTimeout(() => {
      this.props.addToCart(addedProduct);
      showSuccessSnackBar(this.props.localeStrings.productAddCart);
    }, 500);
  };

  _handleKeyboardShow = () => {
    this.setState({keyboard: true}, () =>
      Animated.timing(this.state.bottomVisible, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }).start(),
    );
  };

  _handleKeyboardHide = () => {
    Animated.timing(this.state.bottomVisible, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      this.setState({keyboard: false});
    });
  };

  _handleLayout = e => {
    const {layout} = this.state;
    const {height, width} = e.nativeEvent.layout;

    if (height === layout.height && width === layout.width) {
      return;
    }

    this.setState({
      layout: {
        height,
        width,
      },
    });
  };

  showAdditionalItemsInCart = () => {
    if (this.props.cartCount > 0) {
      Alert.alert(
        this.props.localeStrings.warning,
        this.props.localeStrings.additionalItemsWarning,
        [
          {
            text: this.props.localeStrings.no,
            onPress: () => {
              this.setState({buyNow: false});
            },
          },
          {
            text: this.props.localeStrings.yes,
            onPress: () => {
              setTimeout(() => {
                this.addToCartRequest();
              }, 250);
            },
          },
        ],
      );
    } else {
      this.addToCartRequest();
    }
  };

  showNoAddressAlert = () => {
    Alert.alert(
      this.props.localeStrings.warning,
      this.props.localeStrings.noAddressAddedError,
      [
        {
          text: this.props.localeStrings.cancel,
          onPress: () => {},
        },
        {
          text: this.props.localeStrings.ok,
          onPress: () => {
            this.props.navigation.navigate(Routes.MyAddress, {
              isFromCheckout: true,
              isFromRoute: this.props.navigation.state.routeName,
            });
          },
        },
      ],
    );
  };

  setOptionScroll = (contentWidth, contentHeight) => {
    if (I18nManager.isRTL) {
      this.optionScroll.scrollTo({x: -contentWidth});
    }
  };

  getReviewImages = string => {
    const imageArr = string.split(',');
    return imageArr;
  };

  onClickViewAll = () => {
    this.props.navigation.navigate(Routes.ProductListHome, {
      type: this.state.recently,
    });
  };

  //UI methods
  _renderDotIndicator = () => {
    return (
      <PagerDotIndicator
        pageCount={this.getProductImages().length}
        dotStyle={{backgroundColor: Color.LIGHT_GRAY}}
        selectedDotStyle={{backgroundColor: Color.PRIMARY}}
        hideSingle
      />
    );
  };

  renderImageItems = (item, index) => {
    return (
      <View style={styles.reviewImageContainer}>
        <Image
          source={{uri: decodeImageUrl(this.state.review_path + item)}}
          style={styles.reviewImage}
          cache="force-cache"
        />
      </View>
    );
  };

  renderRatings = (productRating, iconSize = ThemeUtils.fontNormal) => {
    let items = [1, 2, 3, 4, 5];
    return productRating > 0 ? (
      <View style={styles.ratingsContainer}>
        {items.map((item, index) => {
          return (
            <View
              key={`${index}`}
              style={
                index === 0
                  ? {marginStart: 0, marginEnd: 3}
                  : {marginHorizontal: 3}
              }>
              <Icon
                name={
                  index + 1 > Math.floor(parseFloat(productRating))
                    ? 'my_favourites'
                    : 'star_fill'
                }
                size={iconSize}
                color={Color.RATING_COLOR}
              />
            </View>
          );
        })}
      </View>
    ) : (
      <View style={styles.ratingsContainer} />
    );
  };

  renderLessStockLabel = () => {
    let maxQty = this.state.productDetail.qty

    if (this.state.selectedColor) {
      maxQty =
        parseInt(this.state.selectedColor.quantity) > 10
          ? 10
          : parseInt(this.state.selectedColor.quantity);
    }
    if (this.state.selectedSubOption) {
      maxQty =
        parseInt(this.state.selectedSubOption.quantity) > 10
          ? 10
          : parseInt(this.state.selectedSubOption.quantity);
    }
    if (
      maxQty > 0 &&
      maxQty <= this.props.appConfig.min_stock_qty
    ) {
      return (
        <View
          style={{
            marginVertical: 5,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <Label color={Color.PRIMARY} small nunito_bold bolder={IS_IOS}>
            {`${this.props.localeStrings.only} ${
              maxQty
            } ${this.props.localeStrings.left}`}
          </Label>
        </View>
      );
    }
    return null;
  };
  
  brantTapped = () =>{
    const obj = {id:this.state.productDetail.brandname, title: this.state.productDetail.brandname }
    this.props.navigation.navigate(Routes.ProductListHome, {
      brand_id: this.state.productDetail.brand_id,
      type:obj
    });

  }

  renderOptionsSection = () => {
    let options =
      Array.isArray(this.state.options) && this.state.options.length > 0
        ? this.state.options
        : [];
    let colors = this.state.colors;

    return (
      <>
        {colors.length > 0 ? this.renderColor() : null}
        {options.map(optionType => {
          if (optionType?.productoptions1.length > 0) {
            return (
              <View key={optionType.id}>
                <Hr lineStyle={styles.lineSeparator} />
                <View style={styles.detailsContainer}>
                  <View style={[styles.optionTypeContainer]}>
                    <Label
                      color={Color.TEXT_DARK}
                      me={10}
                      nunito_bold
                      bolder={IS_IOS}>
                      {I18nManager.isRTL
                        ? optionType.name_ar
                        : optionType.name_en}
                    </Label>
                    {this.renderOptionChoices(optionType)}
                  </View>
                </View>
              </View>
            );
          }
        })}
      </>
    );
  };

  renderProductAttribute = () => {
    return (
      <View style={styles.featureProductContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          ref={node => (this.optionScroll = node)}
          onContentSizeChange={(width, height) =>
            this.setOptionScroll(width, height)
          }
          style={{
            flex: 1,
            flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
            
            transform: [
              {
                scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1,
              },
            ]
          }}>
          {this.state.productFeatures.map(features => {
            return (
              <View
                style={[styles.newBtnAddToCart,{ flexDirection: 'row',
                transform: [
                  {
                    scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1,
                  }
                ]}]}
                activeOpacity={0.5}
                underlayColor={Color.TRANSPARENT}>
                <Image
                  source={{uri: this.state.product_path + features?.image}}
                  style={{
                    height: ThemeUtils.relativeHeight(3),
                    width: ThemeUtils.relativeHeight(3),
                    resizeMode: 'contain',
                  }}
                />
                <Label
                  color={Color.textColor}
                  xsmall
                  ms={3}
                  opensans_bold
                  bolder={IS_IOS}>
                  {features?.title}
                </Label>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  renderFeatures = () => {
    return this.state.product_attribute.length > 0 ? (
      <View>
        <Hr lineStyle={styles.lineSeparator} />

        <View style={[styles.detailsContainer,{marginVertical:ThemeUtils.relativeHeight(1)}]}>
          <TouchableOpacity
            onPress={() => {
              this.setState({attributeShow: !this.state.attributeShow});
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Label
                color={Color.TEXT_DARK}
                me={10}
                nunito_bold
                bolder={IS_IOS}>
                {this.props.localeStrings.product_attribute}
              </Label>
              <Icon
                name={'dropdown_arrow'}
                style={{marginEnd: 10}}
                size={ThemeUtils.fontXSmall}
                color={Color.TEXT_DARK}
              />
            </View>
          </TouchableOpacity>

          {this.state.attributeShow
            ? this.state.product_attribute.map(attribute => {
                let title = attribute?.title;
                let name = attribute?.name;
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      marginHorizontal: ThemeUtils.relativeWidth(3),
                    }}>
                    <Label
                      color={Color.TEXT_DARK}
                      me={10}
                      small
                      mt={5}
                      // nunito_bold
                    >
                      {I18nManager.isRTL
                        ? `${name}  :  ${title}`
                        : `${title}  :  ${name}`}
                    </Label>
                  </View>
                );
              })
            : null}
        </View>
      </View>
    ) : null;
  };

  renderColor = () => {
    return this.state.colors.length > 0 ? (
      <View style={styles.detailsContainer}>
        <View style={[styles.optionTypeContainer]}>
          <Label color={Color.TEXT_DARK} me={10} nunito_bold bolder={IS_IOS}>
            {this.props.localeStrings.chooseColor}
          </Label>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            ref={node => (this.optionScroll = node)}
            onContentSizeChange={(width, height) =>
              this.setOptionScroll(width, height)
            }
            style={{
              flex: 1,
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
              transform: [
                {
                  scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1,
                },
              ],
            }}>
            {this.state.colors.map(optionValue => {
              let isColorSelected =
                optionValue.id == this.state.selectedColor.id;
              let isOutOfStock =
                optionValue.quantity && parseInt(optionValue.quantity) === 0;
              return optionValue.color ? (
                <TouchableOpacity
                  disabled={isOutOfStock}
                  key={optionValue.id}
                  activeOpacity={0.9}
                  underlayColor={Color.TRANSPARENT}
                  style={[
                    styles.colorOption,
                    isOutOfStock
                      ? {
                          padding: 5,
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                        }
                      : null,
                    isOutOfStock ? styles.noStockOption : styles.shadowBg,
                  ]}
                  onPress={() => this.selectColor(optionValue)}>
                  <View
                    style={[
                      styles.colorOption,{borderColor:optionValue.color === "#ffffff" ? Color.PRIMARY : Color.WHITE},
                      isColorSelected ? styles.selectedOption : null,
                      isHexValid(optionValue.color)
                        ? {backgroundColor: optionValue.color}
                        : {backgroundColor: Color.LIGHT_GRAY},
                    ]}>
                    {/* {isHexValid(optionValue.hex_code) ?
                                                    <View/> 
                                                } */}
                  </View>
                </TouchableOpacity>
              ) : (
                <View />
              );
            })}
          </ScrollView>
        </View>
      </View>
    ) : null;
  };

  selectColor = colorItem => {
    if (this.state.selectedColor.id === colorItem.id) {
      return;
    }

    this.setState({selectedColor: colorItem,selectedOptions:[], selectedSubOption:null}, () => {});
  };

  renderOptionChoices = optionType => {


    let filtered = this.state.selectedColor ? optionType.productoptions1.filter(item=>(item.color === this.state.selectedColor.color) ) : optionType.productoptions1

    

    switch (optionType.optionname?.trim().toLowerCase()) {
      case this.props.localeStrings.chooseSize || 'Size' || 'Select Letter':
      case 'اختيار المقاس':
      default:
        return Array.isArray(filtered) &&
          filtered.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            ref={node => (this.optionScroll = node)}
            onContentSizeChange={(width, height) =>
              this.setOptionScroll(width, height)
            }
            style={{
              flex: 1,
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
              transform: [
                {
                  scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1,
                },
              ],
            }}>
            { 
            filtered.map(optionValue => {
              let isSizeSelected = this.getIsOptionSelected(
                optionType,
                optionValue.id,
              );

              console.log('filtered option',optionValue)

              let isOutOfStock =  parseInt(optionValue.quantity) === 0 ? true : false;

              return (
                <TouchableOpacity
                  disabled={isOutOfStock}
                  key={optionValue.option_id}
                  activeOpacity={0.9}
                  underlayColor={Color.TRANSPARENT}
                  style={[
                    styles.sizeOption,
                    isSizeSelected
                      ? {
                          ...styles.selectedOption,
                          backgroundColor: Color.PRIMARY,
                        }
                      : {backgroundColor: Color.WHITE},
                    isOutOfStock
                      ? styles.noStockOption
                      : {
                          borderWidth: 0.5,
                          borderColor: Color.TEXT_DARK,
                        },
                    {
                      transform: [
                        {
                          scaleX: IS_ANDROID && I18nManager.isRTL ? -1 : 1,
                        },
                      ],
                    },
                  ]}
                  onPress={() =>
                    this.onSelectProductOption(
                      optionType,
                      optionValue,
                      optionValue.option_id,
                    )
                  }>
                  <Label
                    xsmall
                    mt={3}
                    mb={3}
                    me={2}
                    ms={3}
                    color={isSizeSelected ? Color.WHITE : Color.TEXT_DARK}>
                    {optionValue.option_value
                      ? optionValue.option_value.toLowerCase()
                      : ''}
                  </Label>

                  <Label
                    xsmall
                    mb={3}
                    me={3}
                    ms={3}
                    color={isSizeSelected ? Color.WHITE : Color.TEXT_DARK}>
                    {`SR ${parseFloat(this.state.productDetail.price) + 
                              parseFloat(optionValue?.price || 0)}`}
                  </Label>

                  {isOutOfStock ? <Label
                    xsmall
                    mb={3}
                    me={3}
                    ms={3}
                    color={Color.ERROR}>
                    {this.props.localeStrings.outOfStock}
                  </Label> : null}

                  
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null;
    }
  };

  renderQuantitySection = () => {
    let isOutOfStock = false,
      maxQty = 0;
    if (
      this.state.productDetail.qty !== null &&
      this.state.productDetail.qty !== undefined
    ) {
      if (parseInt(this.state.productDetail.qty) === 0) {
        isOutOfStock = true;
      } else {
        maxQty =
          parseInt(this.state.productDetail.qty) > 10
            ? 10
            : parseInt(this.state.productDetail.qty);
      }
    }

    if (this.state.selectedColor) {
      maxQty =
        parseInt(this.state.selectedColor.quantity) > 10
          ? 10
          : parseInt(this.state.selectedColor.quantity);
    }
    if (this.state.selectedSubOption) {
      maxQty =
        parseInt(this.state.selectedSubOption.quantity) > 10
          ? 10
          : parseInt(this.state.selectedSubOption.quantity);
    }

    return !isOutOfStock ? (
      <>
        <Hr lineStyle={styles.lineSeparator} />
        <View style={styles.detailsContainer}>
          <View style={styles.quantityContainer}>
            <Label color={Color.TEXT_DARK} me={10} nunito_bold bolder={IS_IOS}>
              {this.props.localeStrings.quantity}
            </Label>
            <ModalDropdown
              options={new Array(maxQty)
                .fill(1)
                .map((item, idx) => `${idx + 1}`)}
              style={styles.quantityBtn}
              dropdownStyle={styles.quantityDropdown}
              dropdownTextStyle={{marginStart: 5}}
              onSelect={this.onChangeQuantity}>
              <View style={styles.quantityBtnMain}>
                <Label xsmall ms={10} color={Color.TEXT_DARK}>
                  {this.state.currentQuantity}
                </Label>
                <Icon
                  name={'dropdown_arrow'}
                  style={{marginEnd: 10}}
                  size={ThemeUtils.fontXSmall}
                  color={Color.TEXT_DARK}
                />
              </View>
            </ModalDropdown>
          </View>
        </View>
      </>
    ) : null;
  };

  renderFeatureSection = () => {
    // let feature_groups =
    //   Array.isArray(this.state.productDetail.attribute_groups) &&
    //   this.state.productDetail.attribute_groups.length > 0
    //     ? this.state.productDetail.attribute_groups
    //     : [];

    return  (
      <>
        <Hr lineStyle={styles.lineSeparator} />
        <View style={styles.detailsContainer}>
          <View style={{flex: 1, marginVertical: 10}}>
            <View style={{flexDirection: 'row'}}>
              {this.MenuItems.map((item, idx) => (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottomColor:
                      this.state.currentMenuItem.id === item.id
                        ? Color.PRIMARY
                        : Color.LIGHT_GRAY,
                    borderBottomWidth:
                      this.state.currentMenuItem.id === item.id ? 1 : 0.5,
                  }}
                  activeOpacity={0.9}
                  underlayColor={Color.TRANSPARENT}
                  key={item.id.toString()}
                  onPress={() => this.onChangeFeatureSection(item)}>
                  <Label
                    color={
                      this.state.currentMenuItem.id === item.id
                        ? Color.TEXT_DARK
                        : Color.TEXT_LIGHT
                    }
                    small
                    mt={5}
                    mb={8}
                    nunito_bold
                    bolder={IS_IOS}>
                    {item.label}
                  </Label>
                </TouchableOpacity>
              ))}
            </View>

            {/*-------Features-------*/}
            {this.renderExpandableFeatureView()}
            {/*-------Descriptions-------*/}
            {this.state.currentMenuItem.id === this.MenuItems[1].id && (
              <View style={{flex: 1}}>
                <View style={styles.descContainer}>
                  {/* <Label color={Color.TEXT_LIGHT} small>
                    {this.state.productDetail.description}
                  </Label> */}
                  <HTML source={{ html: this.state.productDetail.description }} contentWidth={ThemeUtils.relativeWidth(90)} />

                </View>
              </View>
            )}
          </View>
        </View>
      </>
    ) ;
  };

  renderExpandableFeatureView = () => {
    let feature_groups =
      Array.isArray(this.state.product_attribute) &&
      this.state.product_attribute.length > 0
        ? this.state.product_attribute
        : [];

    if (this.state.currentMenuItem.id === this.MenuItems[0].id) {
      //Collapsed feature view
      if (this.state.featuresExpanded) {

        return (
          <View style={{flex: 1}}>
            {/*-------Features Groups-------*/}
            {feature_groups &&
              feature_groups.map(group => {
              return  <View
                  style={{marginVertical: 10}}
                  //key={group.attribute_group_id}
                  >
                      <View
                        style={styles.featureDetail}
                        //key={attribute.attribute_id}
                        >
                        <View style={styles.featureName}>
                          <Label small color={Color.TEXT_LIGHT}>{`${
                            group.title
                          }:`}</Label>
                        </View>
                        <View style={styles.featureValue}>
                          <Label small color={Color.TEXT_DARK}>
                            {group.name}
                          </Label>
                        </View>
                      </View>
                </View>
      })}
          </View>
        );
      } else {
        //Expanded feature view
        const newArr = Array.isArray(feature_groups) && feature_groups.length > 4 ? feature_groups.slice(0,3) : feature_groups

        return (
          <View style={{flex: 1}}>
            {/*-------Features Groups-------*/}
            {feature_groups && (
              <View
                style={{marginVertical: 10}}
                >

                {/*-------Features Groups Detail-------*/}
                {
                  
                  newArr.map((item, idx) => {

                     return <View
                        style={styles.featureDetail}
                        >
                        <View style={styles.featureName}>
                          <Label small color={Color.TEXT_LIGHT}>{`${
                            item.title
                          }:`}</Label>
                        </View>
                        <View style={styles.featureValue}>
                          <Label small color={Color.TEXT_DARK}>
                            {item.name}
                          </Label>
                        </View>
                      </View>
      })}
              </View>
            )}
            {/*-------See more features------*/}
            {feature_groups && feature_groups.length > 4 ? (
              <View style={{alignItems: 'flex-start'}}>
                <Ripple
                  style={styles.squareButton}
                  rippleContainerBorderRadius={0}
                  onPress={this.onClickExpandFeature}>
                  <Label color={Color.BLACK} xsmall>
                    {this.props.localeStrings.seeMore}
                  </Label>
                </Ripple>
              </View>
            ) : null}
          </View>
        );
      }
    }
  };

  renderReviewsSection = () => {
    return (
      <>
        <Hr lineStyle={styles.lineSeparator} />
        <View style={styles.detailsContainer}>
          <View style={styles.reviewMain}>
            <View style={styles.reviewTitle}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({reviewShow: !this.state.reviewShow});
                }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <Label
                    color={Color.TEXT_DARK}
                    nunito_bold
                    me={10}
                    bolder={IS_IOS}>
                    {this.state.productReviews.length !== null &&
                    !isNaN(parseInt(this.state.productReviews.length)) &&
                    parseInt(this.state.productReviews.length) > 0
                      ? `${this.props.localeStrings.reviews} (${parseInt(
                          this.state.productReviews.length,
                        )})`
                      : `${this.props.localeStrings.reviews}`}
                  </Label>
                  {this.state.productReviews.length !== null &&
                  !isNaN(parseInt(this.state.productReviews.length)) &&
                  parseInt(this.state.productReviews.length) > 0 ? (
                    <Icon
                      name={'dropdown_arrow'}
                      style={{marginEnd: 10}}
                      size={ThemeUtils.fontXSmall}
                      color={Color.TEXT_DARK}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
              {this.props.user ? (
                <Ripple
                  style={[
                    styles.squareButton,
                    {
                      borderColor: Color.PRIMARY,
                      backgroundColor: Color.WHITE,
                    },
                  ]}
                  rippleContainerBorderRadius={0}
                  onPress={this.onClickWriteReview}>
                  <Label color={Color.PRIMARY} xsmall>
                    {this.props.localeStrings.writeReview}
                  </Label>
                </Ripple>
              ) : null}
            </View>
            {this.state.reviewShow ? (
              Array.isArray(this.state.productReviews) &&
              this.state.productReviews.length > 0 ? (
                <View style={{marginVertical: 5}}>
                  {this.state.productReviews.map((reviewItem, index) => {
                    return (
                      <View key={index.toString()}>
                        <View style={styles.reviewDetail}>
                          <View style={{flex: 1}}>
                            {this.renderRatings(
                              reviewItem.rating,
                              ThemeUtils.fontSmall,
                            )}
                            <Label small mt={10} mb={5} color={Color.TEXT_DARK}>
                              {reviewItem.review}
                            </Label>
                          </View>
                          {reviewItem?.images !== null &&
                            reviewItem?.images !== '' && (
                              <View style={{flex: 1, marginVertical: 5}}>
                                <FlatList
                                  data={this.getReviewImages(
                                    reviewItem?.images,
                                  )}
                                  renderItem={({index, item}) =>
                                    this.renderImageItems(item, index)
                                  }
                                  horizontal={true}
                                  showsHorizontalScrollIndicator={false}
                                  extraData={this.state}
                                />
                              </View>
                            )}
                          <View style={styles.reviewInfo}>
                            <Label small color={Color.TEXT_LIGHT}>
                              {reviewItem.name}
                            </Label>
                            <Label small color={Color.TEXT_LIGHT}>
                              {moment(reviewItem.created_at).fromNow()}
                            </Label>
                          </View>
                        </View>
                        {index !== this.state.productReviews.length - 1 && (
                          <Hr lineStyle={styles.lineSeparator} />
                        )}
                        {index === this.state.productReviews.length - 1 &&
                          parseInt(this.state.productDetail.reviews_count) >
                            5 && (
                            <Ripple
                              style={styles.squareButton}
                              rippleContainerBorderRadius={0}
                              onPress={this.onClickExpandReviews}>
                              <Label color={Color.BLACK} xsmall>
                                {this.props.localeStrings.viewAllReview}
                              </Label>
                            </Ripple>
                          )}
                      </View>
                    );
                  })}
                </View>
              ) : null
            ) : null}
          </View>
        </View>
      </>
    );
  };

  renderProductListItem = (item, index) => {
    return (
      <ProductCard
        productData={item}
        imagepath={this.state.product_path}
        onPress={this.onClickProduct}
        onUpdateProduct={this.updateProductData}
        navigation={this.props.navigation}
        newDesign
      />
    );
  };

  renderSimilarSection = () => {
    return Array.isArray(this.state.relatedProducts) &&
      this.state.relatedProducts.length > 0 ? (
      <View style={styles.sectionContainer}>
        <View style={styles.categoryBlock}>
          <Label
            mt={5}
            mb={5}
            nunito_bold
            bolder={IS_IOS}
            color={Color.TEXT_DARK}>
            {this.props.localeStrings.similarProdcuts}
          </Label>
          {/*<Label mt={5}
                               mb={5}
                               nunito_bold
                               bolder={IS_IOS}
                               color={Color.TEXT_LIGHT}>
                            {this.props.localeStrings.viewAll}
                        </Label>*/}
        </View>
        <View style={styles.sectionLineContainer}>
          <Hr lineStyle={styles.sectionLine} />
        </View>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 10}}
          extraData={this.state}
          data={this.state.relatedProducts}
          keyExtractor={item => `${item.product_id}`}
          renderItem={({index, item}) =>
            this.renderProductListItem(item, index)
          }
        />
      </View>
    ) : null;
  };

  renderRecentlySection = () => {
    return (
      Array.isArray(this.state.recentlyViewProducts) &&
      this.state.recentlyViewProducts.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={styles.categoryBlock}>
            <Label
              mt={5}
              mb={5}
              nunito_bold
              bolder={IS_IOS}
              color={Color.TEXT_DARK}>
              {this.props.localeStrings.recentlyViewed}
            </Label>
            <TouchableOpacity onPress={() => this.onClickViewAll()}>
              <Label opensans_bold bolder color={Color.PRIMARY} singleLine>
                {this.props.localeStrings.viewAll || 'See All Items'}
              </Label>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionLineContainer}>
            <Hr lineStyle={styles.sectionLine} />
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 10}}
            extraData={this.state}
            data={this.state.recentlyViewProducts}
            keyExtractor={item => `${item.product_id}`}
            renderItem={({index, item}) =>
              this.renderProductListItem(item, index)
            }
          />
        </View>
      )
    );
  };

  renderBottomButtons = () => {
    let isDisabled = true,
      isOutOfStock = false;
    if (this.state.productDetail) {
      if (
        this.state.productDetail.qty !== null &&
        this.state.productDetail.qty !== undefined
      ) {
        if (parseInt(this.state.productDetail.qty) === 0) {
          isOutOfStock = true;
        } else {
          isOutOfStock = false;
          isDisabled = false;
        }
      }
    }
    return !this.state.keyboard ? (
      <View>
        <Animated.View
          style={[
            styles.shareButton,
            {
              height: this.btnHeight,
              width: this.btnHeight,
              borderRadius: this.btnRadius,
              end: this.btnEndMargin,
              bottom: this.btnBottomMargin,
            },
          ]}>
          <Ripple
            style={styles.shareRipple}
            onPress={this.onClickShareBtn}
            rippleContainerBorderRadius={20}>
            <AnimatedIcon
              name="share"
              style={{
                fontSize: this.btnRadius,
                opacity: this.btnIconOpacity,
              }}
              color={Color.WHITE}
            />
          </Ripple>
        </Animated.View>
        {/* <View style={styles.bottomBtnContainer} pointerEvents={'box-none'}>
          <Ripple
            style={[
              styles.btnAddToCart,
              {
                //  backgroundColor: isOutOfStock ? Color.TEXT_LIGHT : Color.WHITE
                backgroundColor: isOutOfStock
                  ? Color.LIGHT_GRAY
                  : Color.PRIMARY,
              },
            ]}
            disabled={isDisabled}
            onPress={this.onClickAddToCart}>
            {!isOutOfStock ? (
              <Icon
                name={'order_fill'}
                //color={Color.PRIMARY}
                color={isOutOfStock ? Color.TEXT_DARK : Color.WHITE}
                size={ThemeUtils.fontLarge}
              />
            ) : null}
            <Label
              color={isOutOfStock ? Color.TEXT_DARK : Color.WHITE}
              ms={10}
              nunito_bold
              bolder={IS_IOS}>
              {isOutOfStock
                ? this.props.localeStrings.outOfStock
                : this.props.localeStrings.addToCart}
            </Label>
          </Ripple>
          {this.state.fromDeeplink === null
                    && this.state.fromSplash === false
                    && this.state.fromNotif === null &&
                    <Ripple style={[styles.btnBuyNow, {
                        backgroundColor: isOutOfStock ? Color.LIGHT_GRAY : Color.PRIMARY
                    }]}
                            disabled={isDisabled}
                            onPress={this.onClickBuyNow}>
                        <Label color={isOutOfStock ? Color.TEXT_LIGHT : Color.WHITE}
                               nunito_bold
                               bolder={IS_IOS}
                               ms={10}>
                            {this.props.localeStrings.buyNow}
                        </Label>
                    </Ripple>
                    }
        </View> */}
      </View>
    ) : null;
  };
  newAddTocartButton = ()=>{
    let isDisabled = true,
    isOutOfStock = false;
  if (this.state.productDetail) {
    if (
      this.state.productDetail.qty !== null &&
      this.state.productDetail.qty !== undefined
    ) {
      if (parseInt(this.state.productDetail.qty) === 0) {
        isOutOfStock = true;
      } else {
        isOutOfStock = false;
        isDisabled = false;
      }
    }
  }
    return (
      <View style={[styles.detailsContainer,{marginVertical:ThemeUtils.relativeHeight(2)}]}><TouchableOpacity
        style={[styles.newBtnAddToCart1, {opacity: isDisabled ? 0.6 : 1.0}]}
        activeOpacity={0.5}
        underlayColor={Color.TRANSPARENT}
        disabled={isDisabled}
        onPress={this.onClickAddToCart}>
        <Icon
          color={isOutOfStock ? Color.TEXT_LIGHT_GRAY : Color.WHITE}
          size={18}
          name={'order_normal'}
        />
        <Label
          color={isOutOfStock ? Color.TEXT_LIGHT_GRAY : Color.WHITE}
          normal
          ms={8}
          opensans_bold
          bolder={IS_IOS}>
          {isOutOfStock
            ? this.props.localeStrings.outOfStock
            : this.props.localeStrings.addToCart}
        </Label>
      </TouchableOpacity></View>
    );
  }

  renderWishlistBtn = () => {
    return (
      <Bounceable
        onPress={this.onClickWishlist}
        level={1.1}
        style={styles.wishlistBtn}>
        <Icon
          name={this.getWishlistStatus(this.state.productDetail)}
          size={20}
          color={Color.PRIMARY}
        />
      </Bounceable>
    );
  };

  renderDescription = () => {
 
    return(
        <>
        <Label
             color={Color.TEXT_LIGHT} small
              onTextLayout={this.onTextLayout}
              numberOfLines={this.state.textShown ? undefined : 3}
              style={{ lineHeight: 21 }}>
                  {this.state.productDetail.description}
        </Label>
              {
                  this.state.lengthMore ? <Label
                  color={Color.PRIMARY} small
                  onPress={this.toggleNumberOfLines}
                  >{this.state.textShown ? this.props.localeStrings.readless : this.props.localeStrings.readmore}</Label>
                  :null
              }
     </>
    )

  };


   toggleNumberOfLines = () => { //To toggle the show text or hide it
    this.setState({
        textShown : !this.state.textShown
     })
}

 onTextLayout = (e) =>{
     this.setState({
        lengthMore : e.nativeEvent.lines.length >=3
     })
};

  //Lifecycle methods
  constructor(props) {
    super(props);
    let productData = this.props.navigation.getParam('productData', null);

    let fromDeeplink = this.props.navigation.getParam('productSlugLink', null);

    let fromNotif = this.props.navigation.getParam('fromNotif', null);

    let fromSplash = this.props.navigation.getParam('fromSplash', false);

    this.state = {
      productData,
      fromDeeplink,
      fromNotif,
      fromSplash,
      productDetail: null,
      product_id: null,
      productReviews: null,
      recentlyViewProducts: null,
      relatedProducts: null,
      attributeShow: false,
      reviewShow: false,
      optionalAddtionalPrice: 0,
      textShown:false,
      lengthMore:false,

      recently: {},
      options: [],
      colors: [],
      productFeatures: [],
      product_attribute: [],
      selectedColor: null,
      selectedOption: null,
      selectedSubOption: null,
      attributes: [],
      product_path: '',
      review_path: '',
      selectedOptions: [],
      isLoaderVisible: false,
      currentQuantity: 1,
      currentMenuItem: this.MenuItems[0],
      featuresExpanded: false,
      totalReviewCount: 0,
      isBtnVisible: true,
      isAnimationStarted: false,
      animateImgX: 0,
      animateImgY: 0,
      layout: {height: 0, width: 0},
      keyboard: false,
      bottomVisible: new Animated.Value(1),
      buyNow: false,
    };

    this.btnHeight = new Animated.Value(40);
    this.btnRadius = new Animated.Value(20);
    this.btnEndMargin = new Animated.Value(15);
    this.btnBottomMargin = new Animated.Value(
      ThemeUtils.relativeHeight(8) + 10,
    );
    this.btnIconOpacity = new Animated.Value(1);
    this.prevOffset = 0;
    this.currentProductFavourite = false;
    //wishlist,addtocart animation
    this.setAnimInit();
  }

  static navigationOptions = ({navigation, navigationOptions}) => {
    let backHandler = navigation.getParam('backHandler', null);
    return {
      title: 'navProductDetail',
      header: props => (
        <CustomNavigationHeader
          {...props}
          isMainTitle={false}
          btnLeftHandler={backHandler}
          showWishlist
          showCart
          showBack
        />
      ),
    };
  };

  componentWillMount() {
    if (
      this.state.fromDeeplink ||
      this.props.navigation.state.routeName === Routes.ProductDetailNotif
    ) {
      this.props.navigation.setParams({
        backHandler: this.backHandler,
      });
    }

    if (IS_IOS) {
      Keyboard.addListener('keyboardWillShow', this._handleKeyboardShow);
      Keyboard.addListener('keyboardWillHide', this._handleKeyboardHide);
    } else {
      Keyboard.addListener('keyboardDidShow', this._handleKeyboardShow);
      Keyboard.addListener('keyboardDidHide', this._handleKeyboardHide);
    }
  }

  componentDidMount() {
    this.getProductDetail();
    if (this.props.navigation.state.routeName === Routes.ProductDetailNotif) {
      BackHandler.addEventListener('ProductDetailPopUpBack', this.backHandler);
    } else if (this.state.fromDeeplink) {
      BackHandler.addEventListener('ProductDetailPopUpBack', this.backHandler);
    } else if (this.state.fromDeeplink === null) {
      if (this.state.productData && this.state.productData.price) {
        this.props.addRecentProduct(this.state.productData);
      }
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      this.props.wishlist !== prevProps.wishlist &&
      this.state.productDetail &&
      this.currentProductFavourite
    ) {
      let findIndex = this.props.wishlist.findIndex(
          product => product.product_id === this.state.product_id,
        ),
        wishlist_add = null;
      if (findIndex === -1) {
        //if product removed
        let newDetail = {...this.state.productDetail};
        newDetail.wishlist = false;
        this.setState({productDetail: newDetail});
        wishlist_add = false;
        setTimeout(() => {
          showSuccessSnackBar(
            wishlist_add
              ? this.props.localeStrings.productAddWishlist
              : this.props.localeStrings.productRemoveWishlist,
          );
        }, 900);
      } else {
        //if product added
        let newDetail = {...this.state.productDetail};
        newDetail.wishlist = true;
        this.setState({productDetail: newDetail});
        wishlist_add = true;
        setTimeout(() => {
          showSuccessSnackBar(
            wishlist_add
              ? this.props.localeStrings.productAddWishlist
              : this.props.localeStrings.productRemoveWishlist,
          );
        }, 900);
      }
      this.currentProductFavourite = false;
    }
  }

  componentWillUnmount() {
    if (IS_IOS) {
      Keyboard.removeListener('keyboardWillShow', this._handleKeyboardShow);
      Keyboard.removeListener('keyboardWillHide', this._handleKeyboardHide);
    } else {
      Keyboard.removeListener('keyboardDidShow', this._handleKeyboardShow);
      Keyboard.removeListener('keyboardDidHide', this._handleKeyboardHide);
    }
  }

  render() {
    let addionalOptionAmount = 0;

    if (this.state.selectedColor) {
      addionalOptionAmount = parseInt(this.state.selectedColor.price || 0);
    }
    if (this.state.selectedSubOption) {
      addionalOptionAmount = parseInt(this.state.selectedSubOption.price || 0);
    }

    return (
      <View style={{flex: 1}}>
        <Animated.ScrollView
          scrollEventThrottle={16}
          onScroll={this.onScrollEvent}>
          <View style={styles.container}>
            <Spinner visible={this.state.isLoaderVisible} />
            {this.getProductImages().length > 0 ? (
              <View style={styles.sliderContainer}>
                <IndicatorViewPager
                  keyboardDismissMode="none"
                  style={styles.sliderContainer}
                  indicator={this._renderDotIndicator()}>
                  {this.getProductImages().map((item, idx) => (
                    <View key={idx.toString()}>
                      <Image
                        source={{uri: decodeImageUrl(item)}}
                        style={styles.productImage}
                        resizeMode={'contain'}
                      />
                    </View>
                  ))}
                </IndicatorViewPager>
                {this.renderWishlistBtn()}
              </View>
            ) : null}
            {this.state.productDetail && (
              <View style={{flex: 1}}>
                <View style={styles.detailsContainer}>
                  {this.state.productDetail?.brandname && (
                    <Label
                      color={Color.TEXT_DARK}
                      onPress={this.brantTapped}
                      small
                      style={{width: ThemeUtils.relativeWidth(60)}}
                      bolder={IS_IOS}
                      nunito_bold>
                      {this.state.productDetail?.brandname}
                    </Label>
                  )}
                  <View style={styles.nameStockContainer}>
                    <Label
                      color={Color.TEXT_DARK}
                      xlarge
                      style={{width: ThemeUtils.relativeWidth(60)}}
                      bolder={IS_IOS}
                      nunito_bold>
                      {this.state.productDetail.name}
                    </Label>
                    <Label
                      color={
                        this.getStockColor(this.state.productDetail.qty)
                          .textColor
                      }
                      nunito_bold
                      bolder={IS_IOS}
                      small>
                      {
                        this.getStockColor(this.state.productDetail.qty)
                          .textLabel
                      }
                    </Label>
                  </View>
                  
                    <Label
                      color={Color.TEXT_DARK}
                      small
                      style={{width: ThemeUtils.relativeWidth(60)}}
                      bolder={IS_IOS}
                      nunito_bold>
                      { I18nManager.isRTL?`${this.state.productDetail?.sku || ''} : ${this.props.localeStrings?.sku}` : `${this.props.localeStrings?.sku} : ${this.state.productDetail?.sku || ''}`}
                    </Label>

                  <View style={styles.priceRatingContainer}>
                    <View style={styles.priceContainer}>
                      <Label
                        color={
                          this.state.productDetail.offer_price
                            ? Color.RED
                            : Color.TEXT_DARK
                        }
                        large
                        nunito_bold
                        bolder={IS_IOS}
                        me={5}>
                        {this.state.productDetail.offer_price
                          ? 
                            `SR ${parseFloat(this.state.productDetail.price) +
                              parseFloat(addionalOptionAmount)}`
                          : 
                            `SR ${parseFloat(this.state.productDetail.price) +
                              parseFloat(addionalOptionAmount)}`}
                      </Label>
                      {this.state.productDetail.offer_price && (
                        <Label
                          color={Color.TEXT_LIGHT_GRAY}
                          me={5}
                          ms={5}
                          small
                          nunito_bold
                          bolder={IS_IOS}
                          style={{textDecorationLine: 'line-through'}}>
                          {`SR ${this.state.productDetail.offer_price}`}
                        </Label>
                      )}
                      {this.state.productDetail.offer_price &&
                        this.state.productDetail.discount_available && (
                          <View style={styles.discountView}>
                            <Label
                              color={Color.WHITE}
                              nunito_bold
                              bolder={IS_IOS}
                              xsmall>
                              {`${
                                this.state.productDetail.discount_available
                              }% ${this.props.localeStrings.off}`}
                            </Label>
                          </View>
                        )}
                    </View>
                    <View style={styles.ratingsMain}>
                      {this.renderRatings(this.state.productDetail.rating)}
                    </View>
                  </View>
                  {/* <Hr lineStyle={styles.lineSeparator}/> */}
                  {this.renderLessStockLabel()}
                  {/* <View style={styles.descContainer}>
                    {this.renderDescription()}
                  </View> */}
                  
                </View>
                {this.renderOptionsSection()}
                {this.renderQuantitySection()}
                {this.newAddTocartButton()}

                <Hr lineStyle={styles.lineSeparator} />

                {this.renderProductAttribute()}

                  {/* {this.renderFeatures()}                 */}
                {this.renderFeatureSection()}

                {this.renderReviewsSection()}
                {/*----- SIMILAR PRODUCTS-----*/}
                {Array.isArray(this.state.relatedProducts) &&
                  this.state.relatedProducts.length > 0 && (
                    <Hr lineStyle={styles.lineSeparator} />
                  )}
                <View style={{flex: 1}}>{this.renderSimilarSection()}</View>
                {/*----- RECENTLY VIEWED PRODUCTS-----*/}
                {Array.isArray(this.state.recentlyViewProducts) &&
                  this.state.recentlyViewProducts.length > 0 && (
                    <Hr lineStyle={styles.lineSeparator} />
                  )}
                <View style={{flex: 1}}>{this.renderRecentlySection()}</View>
              </View>
            )}
          </View>
        </Animated.ScrollView>
        {this.getProductImages().length > 0 && this.state.isAnimationStarted && (
          <Animated.Image
            source={{
              uri: decodeImageUrl(this.getProductImages()[0].popup),
            }}
            style={{
              height: 80,
              width: 80,
              borderRadius: 40,
              position: 'absolute',
              zIndex: 99,
              transform: [
                {
                  translateX: this.animatedImgLeft,
                },
                {
                  translateY: this.animatedImgTop,
                },
                {scale: this.animatedImgSize},
              ],
            }}
          />
        )}
        {this.renderBottomButtons()}
      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecentProduct: product => dispatch(Action.addRecentProduct(product)),
    setWishlistCount: count => dispatch(Action.setWishlistCount(count)),
    addToCart: product => dispatch(Action.addToCart(product)),
    addToWishlist: product => dispatch(Action.addToWishlist(product)),
    setCartCount: count => dispatch(Action.setCartCount(count)),
  };
};

const mapStateToProps = state => {
  if (state === undefined) return {};
  return {
    user: state.user,
    appConfig: state.appConfig,
    recentProducts: state.recentProducts,
    wishlist: state.wishlist,
    cartCount: state.cartCount,
    localeStrings: state.localeStrings,
    langCode: state.langCode,
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProductDetail);

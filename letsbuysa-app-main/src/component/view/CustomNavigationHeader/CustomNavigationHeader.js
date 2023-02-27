import React from 'react';
import {
    View,
    Animated,
    StatusBar,
    I18nManager,
    Image,
    TouchableOpacity

} from 'react-native';

/// Utility
import styles from "./styles";
import {Color, ThemeUtils, Icon, IS_IOS, Strings, Constants} from "src/utils";
import Routes from "src/router/routes";
import Action from "src/redux/action";

// Custom Component
import Label from 'src/component/ui/Label';
import Ripple from 'src/component/ui/Ripple';
import UtilityManager from 'src/utils/UtilityManager';

/// Thired Party Library
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {NavigationEvents} from "react-navigation";

//asset
import APP_NAME from 'src/assets/images/appName.png';

class CustomNavigationHeader extends React.Component {

    //Utility
    openAnimation = () => {
        Animated.parallel([
            Animated.timing(this.animatedWidth, {
                toValue: ThemeUtils.relativeWidth(90),
                duration: 200
            }),
            Animated.timing(this.animatedBorderRadius, {
                toValue: 0,
                duration: 300
            }),
            Animated.timing(this.animatedOpacity, {
                toValue: 1,
                duration: 500
            })]).start();
        this.props.navigation.navigate(Routes.Search);
    };

    closeAnimation = () => {
        Animated.parallel([
            Animated.timing(this.animatedWidth, {
                toValue: 0,
                duration: 300
            }),
            Animated.timing(this.animatedBorderRadius, {
                toValue: 100,
                duration: 300
            }),
            Animated.timing(this.animatedOpacity, {
                toValue: 0,
                duration: 100
            })
        ]).start(() => {
            this.setState({showSearch: false});
        });
        this.props.navigation.pop()
    };

    getWishlistCount = () => {
        if (this.props.user) {
            return this.props.wishlistCount
        } else {
            return this.props.wishlist.length
        }
    };

    getCartCount = () => {
        if (this.props.user) {
            return this.props.cartCount
        } else {
            let count = 0;
            if (this.props.cart.length > 0) {
                this.props.cart.map(cartItem => {
                    count += parseInt(cartItem.quantity) ? parseInt(cartItem.quantity) : 0
                })
            }
            return count
        }
    };

    getLocalizedTitle = () => {
        let titleKey = this.props.title ? this.props.title : (
            this.props.scene &&
            this.props.scene.descriptor &&
            this.props.scene.descriptor.options ? this.props.scene.descriptor.options.title : "");
        if (titleKey) {
            if (this.props.localeStrings && this.props.localeStrings[titleKey]) {
                return this.props.localeStrings[titleKey]
            } else if (Strings[titleKey]) {
                return Strings[titleKey]
            } else {
                return titleKey
            }
        }
        return ""
    };

    // User Interation

    btnSearchPressed = () => {
        /*if (this.props.rightClick) {
            this.props.rightClick()
        }*/

        /*this.setState({showSearch: true}, () => {
            this.openAnimation()
        });*/

        this.props.setShowSearch(true);

    };

    btnLeftPressed = () => {
        console.log(this.props.index)
        if (typeof this.props.btnLeftHandler === "function") {
            this.props.btnLeftHandler();
            return;
        }

        if (this.props.index !== 0) {
            this.props.navigation.pop()
        } else {
            this.props.setShowPopUp(true);
        }
    };

    btnEndSupportPressed = () => {
        this.props.setShowPopUp(true);
    };

    btnWishlistClick = () => {
        if (this.props.navigation) {
            // if (this.props.user) {
            this.props.navigation.navigate(Routes.WishlistOutside)
            // } else {
            //     this.props.navigation.navigate(Routes.Login, {
            //         fromRoute: Routes.ProductDetail
            //     })
            // }
        }
    };

    btnCartClick = () => {
        if (this.props.navigation) {
            this.props.navigation.navigate(Routes.CartOutside)
        }
    };

    //UI methods
    renderLeftButton = () => {
        let icon = 'customer_service';
        if (this.props.showBack || this.props.index !== 0) {
            icon = 'back'
        }

        if (!this.state.isTransitioning && this.props.showLeftButton) {
            return (
                <Ripple
                    rippleContainerBorderRadius={20}
                    rippleColor={Color.GRAY}
                    style={styles.leftIcon}
                    onPress={this.btnLeftPressed}>
                    <Icon name={icon}
                          size={20}
                          style={I18nManager.isRTL ? {transform: [{scaleX: -1}]} : null}
                          color={Color.WHITE}
                    />
                </Ripple>
            )
        } else {
            return (
                <View style={styles.leftIcon}/>
            )
        }
    };

    renderEndSupportBtn = () => {
        if (this.props.showEndSupportBtn) {
            return (
                <TouchableOpacity
                    rippleContainerBorderRadius={20}
                    rippleColor={Color.GRAY}
                    style={[styles.rightIcon,
                        {marginEnd: 15},

                    ]}
                    onPress={this.btnEndSupportPressed}>
                    <Icon name={'customer_service'}
                          size={20}
                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                          color={Color.WHITE}
                    />
                </TouchableOpacity>
            )
        }
        return null
    };

    renderSearchButton = () => {
        if (this.props.showRightButton) {
            return (
                <Ripple
                    rippleContainerBorderRadius={20}
                    rippleColor={Color.GRAY}
                    style={[styles.rightIcon,
                        {marginEnd: this.props.showWishlist ? 5 : 15},
                    ]}
                    onPress={this.btnSearchPressed}>
                    <Icon name={'search'}
                          size={15}
                          color={Color.WHITE}/>
                </Ripple>
            )
        } else {
            return (
                <View style={styles.rightIcon}/>
            )
        }
    };

    renderWishlistBtn = () => {
        if (this.props.showWishlist) {
            return (
                <Ripple
                    rippleContainerBorderRadius={20}
                    style={styles.wishlistBtn}
                    onPress={this.btnWishlistClick}>
                    <Icon name={'wishlist_normal'}
                          size={20}
                          color={Color.WHITE}/>

                    {this.getWishlistCount() > 0 &&
                    <View style={styles.badgeView} pointerEvents={'none'}>
                        <Label
                            pointerEvents={'none'}
                            style={{
                                includeFontPadding: false,
                            }}
                            color={Color.WHITE}
                            xsmall
                            nunito_medium
                            align={'center'}>
                            {this.getWishlistCount()}
                        </Label>
                    </View>
                    }
                </Ripple>
            )
        }
        return null
    };

    renderCartBtn = () => {
        if (this.props.showCart) {
            return (
                <View>
                    <Ripple
                        rippleContainerBorderRadius={20}
                        style={styles.cartBtn}
                        onPress={this.btnCartClick}>
                        <Icon name={'order_normal'}
                              size={20}
                              color={Color.WHITE}/>
                    </Ripple>
                    {this.getCartCount() > 0 &&
                    <View style={[styles.badgeView, {right: 12}]} pointerEvents={'none'}>
                        <Label
                            pointerEvents={'none'}
                            style={{
                                includeFontPadding: false,
                            }}
                            color={Color.WHITE}
                            xsmall
                            align={'center'}>
                            {this.getCartCount()}
                        </Label>
                    </View>
                    }
                </View>
            )
        }
        return null
    };

    renderTitleView = () => {
        if (this.props.isMainTitle) {
            return (
                <View style={styles.headerMainContainer}>
                    {/* {this.props.langCode === Constants.API_LANGUAGES.AR
                    && this.props.localeStrings.appName === this.getLocalizedTitle() ?
                        <View style={styles.arabicAppName}>
                            <Image source={APP_NAME}
                                   style={{
                                       height: ThemeUtils.fontXXLarge + 12,
                                       width:ThemeUtils.relativeWidth(100)-120,
                                       tintColor: Color.WHITE
                                   }}
                                   tintColor={Color.WHITE}
                                   resizeMode={'contain'}/>
                        </View>
                        :
                        <Label
                            philosopher
                            xxlarge
                            color={Color.WHITE}>
                            {this.getLocalizedTitle()}
                        </Label>
                    } */}
                </View>)
        } else if (this.props.titleCenter) {
            return (
                <View style={styles.headerMainContainer}>
                    <Label color={Color.WHITE}
                           style={{fontSize: 21}}>
                        {this.getLocalizedTitle()}
                    </Label>
                </View>)
        } else {
            return (
                <View style={styles.headerLeftContainer}>
                    <Label color={Color.WHITE}
                           ms={5}
                           xlarge>
                        {this.getLocalizedTitle()}
                    </Label>
                </View>)
        }

    };


    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            statusBarHeight: 20,
            showSearch: false,
            isTransitioning: false
        };
        this.animatedWidth = new Animated.Value(0);
        this.animatedOpacity = new Animated.Value(0);
        this.animatedBorderRadius = new Animated.Value(10)
    }

    componentDidMount() {
    }

    componentWillUpdate(nextProps, nextState) {
        /*let {scene: oldScene} = prevProps,
            {scene: newScene} = this.props;

        let oldRouteIndex = oldScene.route.index;
        let newRouteIndex = newScene.route.index;

        if (oldRouteIndex !== newRouteIndex && newRouteIndex < oldRouteIndex) {
            this.closeAnimation();
        }*/
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <View style={[
                styles.container,
                {minHeight: IS_IOS ? UtilityManager.getInstance().getStatusBarHeight() + ThemeUtils.APPBAR_HEIGHT : ThemeUtils.APPBAR_HEIGHT,}
            ]}>
                <NavigationEvents
                    onWillFocus={payload => {
                        this.setState({isTransitioning: true})
                    }}
                    onDidFocus={payload => {
                        this.setState({isTransitioning: false})
                    }}
                    onWillBlur={payload => {
                        this.setState({isTransitioning: true})
                    }}
                    onDidBlur={payload => {
                        this.setState({isTransitioning: false})
                    }}
                />
                <StatusBar barStyle={'light-content'} backgroundColor={Color.BG_COLOR_DARK}/>
                {IS_IOS ?
                    <View style={[
                        styles.statusBarView,
                        {height: UtilityManager.getInstance().getStatusBarHeight() + 10}
                    ]}/>
                    : null}
                <View style={styles.contentContainer}>
                    {this.renderLeftButton()}
                    {this.renderTitleView()}
                    {this.renderSearchButton()}
                    {this.renderWishlistBtn()}
                    {this.renderCartBtn()}
                    {this.renderEndSupportBtn()}
                </View>
                {/*this.state.showSearch &&
                <Animated.View style={[
                    {
                        height: IS_IOS ? (UtilityManager.getInstance().getStatusBarHeight() + ThemeUtils.APPBAR_HEIGHT + 10) - 10 : ThemeUtils.APPBAR_HEIGHT - 10,
                        width: this.animatedWidth,
                        borderRadius: this.animatedBorderRadius,
                    },
                    styles.searchContainer
                ]}>
                    <Animated.View style={[{
                        opacity: this.animatedOpacity,
                        marginTop: IS_IOS ? UtilityManager.getInstance().getStatusBarHeight() : 0
                    },
                        styles.searchInnerContainer]}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.navigation.pop();
                            }}
                            style={{padding: 10}}>
                            <Icon name={'back'}
                                  color={Color.BLACK}/>
                        </TouchableOpacity>
                        <Label color={Color.BLACK}>
                            {'Search'}
                        </Label>
                    </Animated.View>
                </Animated.View>
                */}
            </View>
        )
    }
}

CustomNavigationHeader.defaultProps = {
    showLeftButton: true,
    showRightButton: true,
    showWishlist: false,
    showCart: false,
    showEndSupportBtn: false,
    btnLeftHandler: null,
    isMainTitle: true,
    titleCenter: false,
    showBack: false
};

CustomNavigationHeader.propTypes = {
    showLeftButton: PropTypes.bool,
    showRightButton: PropTypes.bool,
    showWishlist: PropTypes.bool,
    showCart: PropTypes.bool,
    showEndSupportBtn: PropTypes.bool,
    isMainTitle: PropTypes.bool,
    btnLeftHandler: PropTypes.func,
    titleCenter: PropTypes.bool,
    showBack: PropTypes.bool
};

const mapDispatchToProps = (dispatch) => {
    return {
        setShowPopUp: (showSupportPopUp) => dispatch(Action.setShowPopUp(showSupportPopUp)),
        setShowSearch: (isSearchVisible) => dispatch(Action.setShowSearch(isSearchVisible))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        wishlistCount: state.wishlistCount,
        cart: state.cart,
        wishlist: state.wishlist,
        cartCount: state.cartCount,
        localeStrings: state.localeStrings,
        langCode: state.langCode
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(CustomNavigationHeader);

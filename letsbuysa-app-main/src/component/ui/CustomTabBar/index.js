import React, {Component} from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    SafeAreaView,
    Keyboard,
} from 'react-native';

//Third party
import {connect} from "react-redux";

//Custom components
import Label from "../Label";

//Utils
import {styles} from "./styles";
import Routes from "src/router/routes";
import {Color, Icon, IS_IOS, Strings} from "src/utils";

//Assets

class CustomTabBar extends Component {

    //Utility
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

    //User interaction
    onPressTab = (clickItem) => {
        let nav = this.props.navigation;
        switch (clickItem) {
            case Routes.Home:
            case Routes.AccountMain:
            case Routes.Categories:
            case Routes.Cart:
                nav.navigate(clickItem);
                break;
            case Routes.Wishlist:
                nav.navigate(clickItem);
                /*if (this.props.user) {
                    nav.navigate(clickItem);
                } else {
                    nav.navigate(Routes.Login, {
                        fromRoute: Routes.MainTabs
                    });
                }*/
                break;
            default:
                // nav.navigate(clickItem);
                break;
        }

    };

    //UI methods
    navigateAnimation = (prevItemIndex: number) => {
        const {navigation} = this.props;
        const {state} = navigation;

        /*Animated.parallel([
            Animated.timing(this.itemsAnimation[prevItemIndex], {
                toValue: 1,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(this.itemsAnimation[state.index], {
                toValue: 0,
                duration,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.spring(this.currentIndexAnimatedValue, {
                toValue: navigation.state.index,
                useNativeDriver: true,
            }),
        ]).start();*/
    };

    _handleKeyboardShow = () =>
        this.setState({keyboard: true}, () =>
            Animated.timing(this.state.visible, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }).start()
        );

    _handleKeyboardHide = () =>
        Animated.timing(this.state.visible, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            this.setState({keyboard: false});
        });

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

    renderIcon = (route, icon, activeRoute) => {
        switch (route) {
            case Routes.Wishlist:
                return (
                    <View style={[{
                        width: activeRoute ? 30 : 45,
                        marginStart: activeRoute ? 16 : 10,
                    }, styles.iconContainer]}>
                        <Icon name={icon}
                              size={20}
                              color={activeRoute ? Color.WHITE : Color.PRIMARY}/>
                        {!activeRoute && this.getWishlistCount() > 0 &&
                        <View style={styles.badgeView}>
                            <Label
                                style={{
                                    includeFontPadding: false,
                                }}
                                xsmall
                                color={Color.WHITE}
                                nunito_medium
                                align={'center'}>
                                {this.getWishlistCount()}
                            </Label>
                        </View>
                        }
                    </View>
                );
            case Routes.Cart:
                return (
                    <View style={[{
                        width: activeRoute ? 30 : 45,
                        marginStart: activeRoute ? 16 : 10,
                    }, styles.iconContainer]}>
                        <Icon name={icon}
                              size={20}
                              color={activeRoute ? Color.WHITE : Color.PRIMARY}/>
                        {!activeRoute && this.getCartCount() > 0 &&
                        <View style={styles.badgeView}>
                            <Label
                                style={{
                                    includeFontPadding: false,
                                }}
                                color={Color.WHITE}
                                xsmall
                                nunito_medium
                                align={'center'}>
                                {this.getCartCount()}
                            </Label>
                        </View>
                        }
                    </View>
                );
            default:
                return (
                    <View style={[{
                        width: activeRoute ? 30 : 45,
                        marginStart: activeRoute ? 16 : 10,
                    }, styles.iconContainer]}>
                        <Icon name={icon}
                              size={20}
                              color={activeRoute ? Color.WHITE : Color.PRIMARY}/>
                    </View>)
        }
    };

    renderTabView = (routeName, activeRoute, index) => {
        let icon, tabLabel, route;
        switch (routeName) {
            case Routes.Home:
                route = Routes.Home;
                tabLabel = this.props.localeStrings.navHome;
                icon = activeRoute ? "home_fill" : "home_normal";
                break;
            case Routes.Categories:
                route = Routes.Categories;
                tabLabel = this.props.localeStrings.navCategories;
                icon = activeRoute ? "category_fill" : "category_normal";
                break;
            case Routes.Cart:
                route = Routes.Cart;
                tabLabel = this.props.localeStrings.navCart;
                icon = activeRoute ? "order_fill" : "order_normal";
                break;
            case Routes.Wishlist:
                route = Routes.Wishlist;
                tabLabel = this.props.localeStrings.navWishlist;
                icon = activeRoute ? "wishlist_fill" : "wishlist_normal";
                break;
            case Routes.AccountMain:
                route = Routes.AccountMain;
                tabLabel = this.props.localeStrings.navMyAccount;
                icon = activeRoute ? "account_fill" : "account_normal";
                break;
        }
        return (
            <TouchableOpacity
                style={[styles.tabButtonContainer, {
                    flex: activeRoute ? 0.40 : 0.15,
                }]}
                key={index}
                activeOpacity={1}
                onPress={() => {
                    this.onPressTab(route)
                }}>
                <View style={[styles.tabButton, {
                    backgroundColor: activeRoute ? Color.PRIMARY : Color.TRANSPARENT,
                    marginHorizontal: activeRoute ? 10 : 0
                }]}>
                    {this.renderIcon(route, icon, activeRoute)}
                    {activeRoute &&
                    <Label
                        mt={10}
                        mb={10}
                        me={16}
                        bolder
                        color={Color.WHITE}>
                        {tabLabel}</Label>
                    }
                </View>
            </TouchableOpacity>
        )
    };

    //LifeCycle methods
    constructor(props) {
        super(props);
        this.state = {
            layout: {height: 0, width: 0},
            keyboard: false,
            visible: new Animated.Value(1),
            previousIndex: null,
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.navigation.state.index !== this.props.navigation.state.index ||
            this.state.previousIndex !== nextState.previousIndex ||
            this.state.keyboard !== nextState.keyboard ||
            this.props.user !== nextProps.user ||
            this.props.wishlist !== nextProps.wishlist ||
            this.props.wishlistCount !== nextProps.wishlistCount ||
            this.props.cart !== nextProps.cart ||
            this.props.cartCount !== nextProps.cartCount
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /*if (this.props !== prevProps)
            console.log('new propss', this.props)*/
    }

    componentDidMount() {
        if (IS_IOS) {
            Keyboard.addListener('keyboardWillShow', this._handleKeyboardShow);
            Keyboard.addListener('keyboardWillHide', this._handleKeyboardHide);
        } else {
            Keyboard.addListener('keyboardDidShow', this._handleKeyboardShow);
            Keyboard.addListener('keyboardDidHide', this._handleKeyboardHide);
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
        const {routes, index: activeRouteIndex} = this.props.navigation.state;
        return (
            <Animated.View
                style={[styles.container, {
                    // When the keyboard is shown, slide down the tab bar
                    transform: [{
                        translateY: this.state.visible.interpolate({
                            inputRange: [0, 1],
                            outputRange: [this.state.layout.height, 0],
                        }),
                    }]
                },
                    // Absolutely position the tab bar so that the content is below it
                    // This is needed to avoid gap at bottom when the tab bar is hidden
                    this.state.keyboard ? {position: 'absolute', bottom: 0} : null]}
                pointerEvents={
                    this.state.keyboard ? 'none' : 'auto'
                }
                onLayout={this._handleLayout}>
                {routes.map((route, routeIndex) => {
                    const isRouteActive = routeIndex === activeRouteIndex;
                    return this.renderTabView(route.routeName, isRouteActive, routeIndex)
                })}
            </Animated.View>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        user: state.user,
        token: state.token,
        wishlist: state.wishlist,
        wishlistCount: state.wishlistCount,
        cart: state.cart,
        cartCount: state.cartCount,
        localeStrings: state.localeStrings
    }
};
export default connect(mapStateToProps)(CustomTabBar);

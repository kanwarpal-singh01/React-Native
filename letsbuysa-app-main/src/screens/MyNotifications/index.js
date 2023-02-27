import React, {Component} from 'react';
import {
    View,
    I18nManager,
    TouchableOpacity,
    FlatList,
    Image, RefreshControl,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {NavigationEvents, SafeAreaView} from "react-navigation";
import moment from "moment";
import Spinner from "react-native-loading-spinner-overlay";

//Custom component
import {
    Label,
    Hr,
    CustomNavigationHeader,
} from "src/component";

//Utility
import Action from "src/redux/action";
import {
    API_GET_NOTIFICATIONS,
    APIRequest,
    ApiURL
} from "src/api";
import styles from './styles';
import {
    CommonStyle,
    Color,
    ThemeUtils,
    Constants,
    Icon,
    decodeImageUrl,
    Strings,
    DateUtils
} from "src/utils";
import Routes from "src/router/routes";


class MyNotifications extends Component {

    //Server request
    getNotifications = () => {
        this.setState({
            isLoaderVisible: true,
            errMessage: this.props.localeStrings.pleaseWait
        });

        let params = {
            "customer_id": this.props.user.customer_id,
            "page": this.state.tempPage,
        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_NOTIFICATIONS)
            .reqURL(ApiURL.getNotifications)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false,
        });
        switch (reqId) {
            case API_GET_NOTIFICATIONS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.notifications) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                notifications: this.state.tempPage === 1 ?
                                    response.data.notifications :
                                    [...this.state.notifications, ...response.data.notifications],
                                page: dummyPage
                            });
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
        switch (reqId) {
            case API_GET_NOTIFICATIONS:
                if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }
                this.setState({
                    notifications: [],
                    errMessage: this.props.localeStrings.noNotifications
                });
                break;
        }
    };

    //Utility
    getDateTime = (timestamp) => {
        return moment(timestamp).format(DateUtils.dd_MM_yyyy)
    };


    //User Interaction
    handleLoadMore = () => {
        if (!this.state.isLoaderVisible && this.state.page !== 0) {
            this.setState({
                    tempPage: this.state.page + 1,
                    isLoaderVisible: true
                },
                () => {
                    this.getNotifications();
                });
        }
    };

    handleRefreshEvent = () => {
        this.setState({
            page: 1,
            tempPage: 1,
        }, () => {
            this.getNotifications()
        })
    };

    onClickNotification = (notif) => {
        console.log('notify',notif)
        switch (notif.message_type) {
            case Constants.NOTIFICATION_TYPES.ORDER:
                this.props.navigation.navigate(Routes.OrderDetail, {
                    orderData: {
                        order_id: notif.message_type_id
                    },
                    fromNotif: notif.user_notification_id,
                    currentOrderType: 'general'
                });
                break;
            case Constants.NOTIFICATION_TYPES.RETURN_ORDER:
                this.props.navigation.navigate(Routes.ReturnOrderList, {
                    currentOrderType: {
                        key: '7',
                        type: Constants.OrderTypeReturn
                    },
                    fromRoute: Routes.MainRoute
                });
                break;
            case Constants.NOTIFICATION_TYPES.PRODUCT:
                this.props.navigation.navigate(Routes.ProductDetail, {
                    productData: {
                        product_id: notif.message_type_id
                    },
                    fromNotif: notif.user_notification_id
                });
                break;
            case Constants.NOTIFICATION_TYPES.CART:
                this.props.navigation.navigate(Routes.CartOutside, {
                    fromNotif: notif.user_notification_id
                });
                break;
        }
    };


    //UI methods
    renderNotificationItem = (notifItem, index) => {
        return (
            <TouchableOpacity style={styles.notifItemContainer}
                              activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              onPress={() => this.onClickNotification(notifItem)}>
                <View style={styles.notifLabelContainer}>
                    <View style={[styles.unreadBadge, {
                        backgroundColor: parseInt(notifItem.is_read) ? Color.TRANSPARENT : Color.PRIMARY,
                    }]}/>
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}>
                        <Label small
                               color={Color.TEXT_DARK}>
                            {notifItem.message}
                        </Label>
                        {notifItem.date_added ?
                            <Label small
                                   mt={5}
                                   color={Color.TEXT_LIGHT}>
                                {this.getDateTime(notifItem.date_added)}
                            </Label> : null
                        }
                    </View>
                    <Icon name={"arrow"}
                          color={Color.DARK_LIGHT_BLACK}
                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                          size={20}
                          me={10}
                          ms={10}/>
                </View>
            </TouchableOpacity>
        )
    };

    renderFooter = () => {
        if (this.state.isLoaderVisible && this.state.tempPage !== 1) {
            return (
                <View
                    style={{
                        marginVertical: 20,
                    }}>
                    <Label align="center"
                           color={Color.TEXT_DARK}
                           small>
                        {this.props.localeStrings.loadingNotifications}
                    </Label>
                </View>
            );
        }
        return null
    };

    renderEmptyView = () => {
        return (!this.state.isLoaderVisible ?
            <View style={{alignItems: 'center'}}>
                <Label align="center" normal color={Color.TEXT_DARK}
                       mt={15}>
                    {this.state.errMessage}
                </Label>
            </View>
            : null)
    };

    emptyListStyle = () => {
        if (!this.state.notifications.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation;

        return {
            title: "navMyNotifications",
            header: (props) => <CustomNavigationHeader {...props}
                                                       showRightButton={false}
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
            productData,
            notifications: [],
            isLoaderVisible: false,
            page: 1,
            tempPage: 1,
            errMessage: this.props.localeStrings.noNotifications
        };
    }


    componentDidMount() {
        this.getNotifications()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                {/*<Spinner visible={this.state.isLoaderVisible}/>*/}
                <View style={styles.container}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        extraData={this.state}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isLoaderVisible}
                                onRefresh={() => {
                                    this.setState({
                                        page: 1,
                                        tempPage: 1,
                                    }, () => {
                                        this.getNotifications()
                                    })
                                }}
                            />}
                        data={this.state.notifications}
                        keyExtractor={item => `${item.user_notification_id}`}
                        renderItem={({index, item}) => this.renderNotificationItem(item, index)}
                        ItemSeparatorComponent={() => <Hr lineStyle={styles.lineSeparator}/>}
                        onEndReachedThreshold={0.5}
                        onEndReached={this.handleLoadMore}
                        ListFooterComponent={this.renderFooter}
                        ListEmptyComponent={this.renderEmptyView}
                        contentContainerStyle={this.emptyListStyle()}
                    />
                </View>
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
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyNotifications)

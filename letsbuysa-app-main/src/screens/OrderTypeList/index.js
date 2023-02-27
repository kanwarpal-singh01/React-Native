import React, {Component} from 'react';
import {
    FlatList,
    DeviceEventEmitter,
    RefreshControl,
    TouchableOpacity,
    View, I18nManager, BackHandler,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {NavigationActions, StackActions} from "react-navigation";

//Custom component
import {
    CustomNavigationHeader,
    Label
} from 'src/component';

//Utility
import Action from "src/redux/action";
import {API_GET_ORDERS, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {
    Strings,
    Color,
    Constants,
    ThemeUtils,
    Icon
} from "src/utils";
import Routes from 'src/router/routes';


class OrderTypeList extends React.PureComponent {

    //Server request
    getOrdersRequest = () => {
        this.setState({isLoaderVisible: true});
        let params = {
            "page": this.state.tempPage,
            "customer_id": this.props.user.customer_id,
        };

        if (this.state.currentOrderType &&
            this.state.currentOrderType.key &&
            this.state.currentOrderType.key !== 'all'
        ) {
            params["order_status_id"] = this.state.currentOrderType.key;
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_ORDERS)
            .reqURL(ApiURL.getOrders)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ORDERS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.orders) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                orders: this.state.tempPage === 1 ? response.data.orders : [...this.state.orders, ...response.data.orders],
                                page: dummyPage
                            });
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ORDERS:
                if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }
                this.setState({
                    errMessage: this.props.localeStrings.noOrders
                });
                break;
        }
    };

    //User Interaction
    handleLoadMore = () => {
        if (!this.state.isLoaderVisible && this.state.page !== 0) {
            this.setState({
                    tempPage: this.state.page + 1,
                    isLoaderVisible: true
                },
                () => {
                    this.getOrdersRequest();
                });
        }
    };

    onClickOrderItem = (item) => {
        DeviceEventEmitter.addListener(Constants.APP_EVENTS.ORDER_DETAIL_UPDATE,
            this.handleRefreshEvent);
        let route = this.props.navigation.state.routeName === Routes.ReturnOrderList ?
            Routes.OrderDetailNotif : Routes.OrderDetail;
        this.props.navigation.navigate(route, {
            orderData: item,
            currentOrderType: this.state.currentOrderType
        })
    };

    handleRefreshEvent = (event) => {
        if (event.listType && event.listType === this.state.currentOrderType) {
            this.setState({
                page: 1,
                tempPage: 1,
            }, () => {
                this.getOrdersRequest()
            })
        }
    };

    backHandler = () => {
        BackHandler.removeEventListener("ReturnListBack", this.backHandler);
        if (this.state.fromRoute) {
            this.props.navigation.pop()
        } else {
            this.props.navigation.dispatch(StackActions.reset({
                index: 0,
                key: undefined,
                actions: [
                    NavigationActions.navigate({routeName: Routes.MainRoute}),
                ]
            }));
        }
        return true
    };

    //UI methods
    renderEmptyView = () => {
        return !this.state.isLoaderVisible ? (
            <View style={{
                alignItems: 'center',
            }}>
                <Label align="center"
                       normal
                       color={Color.TEXT_DARK}
                       mt={15}
                       mb={15}>
                    {this.props.localeStrings.noOrders}
                </Label>
            </View>) : null
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
                        {this.props.localeStrings.loadingOrders}
                    </Label>
                </View>
            );
        }
        return null
    };

    emptyListStyle = () => {
        if (!this.state.orders.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    renderOrderItem = (item, index) => {
        return this.state.currentOrderType && this.state.currentOrderType.type === Constants.OrderTypeReturn ?
            (<TouchableOpacity style={styles.orderItemContainer}
                               activeOpacity={0.7}
                               underlayColor={Color.TRANSPARENT}
                               onPress={() => this.onClickOrderItem(item)}>
                    <View style={styles.orderStartContainer}>
                        <Label small
                               color={Color.TEXT_DARK}
                               nunito_medium
                               mt={5}
                               mb={5}>
                            {`${this.props.localeStrings.returnID}: `}
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   nunito_regular
                                   mt={5}
                                   mb={5}>
                                {`#${item.return_id}`}
                            </Label>
                        </Label>
                        <Label small
                               color={Color.PRIMARY}
                               nunito_medium
                               mb={5}>
                            {item.status}
                        </Label>
                    </View>
                    <View style={styles.orderEndContainer}>
                        <View style={styles.orderEnd}>
                            <Icon size={ThemeUtils.fontSmall}
                                  color={Color.TEXT_DARK}
                                  style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                                  name={'arrow'}/>
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.orderItemContainer}
                                  activeOpacity={0.7}
                                  underlayColor={Color.TRANSPARENT}
                                  onPress={() => this.onClickOrderItem(item)}>
                    <View style={styles.orderStartContainer}>
                        <Label small
                               color={Color.TEXT_DARK}
                               nunito_medium
                               mt={5}
                               mb={5}>
                            {`${this.props.localeStrings.orderID}: `}
                            <Label small
                                   color={Color.TEXT_LIGHT}
                                   nunito_regular
                                   mt={5}
                                   mb={5}>
                                {`#${item.order_id}`}
                            </Label>
                        </Label>
                        <Label small
                               color={Color.PRIMARY}
                               nunito_medium
                               mb={5}>
                            {item.status}
                        </Label>
                    </View>
                    <View style={styles.orderEndContainer}>
                        <View style={styles.orderEnd}>
                            <Label small
                                   color={Color.TEXT_DARK}
                                   me={10}
                                   nunito_medium>
                                {I18nManager.isRTL ?
                                    `${item.total} - ${this.props.localeStrings.items} ${item.product}` :
                                    `${item.product} ${this.props.localeStrings.items} - ${item.total}`}
                            </Label>
                            <Icon size={ThemeUtils.fontSmall}
                                  color={Color.TEXT_DARK}
                                  style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                                  name={'arrow'}/>
                        </View>
                    </View>
                </TouchableOpacity>
            )
    };

    //Lifecycle Methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let backHandler = navigation.getParam('backHandler', null),
            routeName = navigation.state.routeName;
        return {
            title: "navReturnOrder",
            header: (props) => {
                if (routeName === Routes.ReturnOrderList) {
                    return (
                        <CustomNavigationHeader {...props}
                                                isMainTitle={false}
                                                btnLeftHandler={backHandler}
                                                showRightButton={false}
                                                showBack/>
                    )
                }
                return null
            }
        }
    };

    constructor(props) {
        super(props);

        let {currentOrderType = null} = this.props,
            fromRoute = null;
        if (currentOrderType === null) {
            currentOrderType = this.props.navigation.getParam('currentOrderType', null);
            fromRoute = this.props.navigation.getParam('fromRoute', null);
        }
        this.state = {
            isLoaderVisible: false,
            orders: [],
            page: 1,
            tempPage: 1,
            currentOrderType,
            fromRoute
        };
    }

    componentWillMount() {
        if (this.props.navigation.state.routeName === Routes.ReturnOrderList) {
            this.props.navigation.setParams({
                backHandler: this.backHandler
            });
        }
    }

    componentDidMount() {
        this.getOrdersRequest();
        if (this.props.navigation.state.routeName === Routes.ReturnOrderList) {
            BackHandler.addEventListener("ReturnListBack", this.backHandler)
        }
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={{flex: 1}}>
                    <FlatList
                        data={this.state.orders}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.isLoaderVisible}
                                onRefresh={() => {
                                    this.setState({
                                        page: 1,
                                        tempPage: 1,
                                    }, () => {
                                        this.getOrdersRequest()
                                    })
                                }}
                            />}
                        renderItem={({item, index}) => this.renderOrderItem(item, index)}
                        onEndReachedThreshold={0.5}
                        onEndReached={this.handleLoadMore}
                        ListFooterComponent={this.renderFooter}
                        ListEmptyComponent={this.renderEmptyView}
                        contentContainerStyle={this.emptyListStyle()}
                    />
                </View>
            </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderTypeList)

import React, {Component} from 'react';
import {
    View,
    Dimensions,
    ActivityIndicator, BackHandler
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {TabBar, TabView} from "react-native-tab-view";
import Spinner from "react-native-loading-spinner-overlay";
import {NavigationActions, StackActions} from "react-navigation";


//Custom component
import {
    CustomNavigationHeader,
} from 'src/component';

//Utility
import Action from "src/redux/action";
import {
    API_GET_ORDER_STATUS,
    APIRequest,
    ApiURL
} from "src/api";
import styles from './styles';
import {
    Strings,
    Constants,
    Color,
    IS_ANDROID
} from "src/utils";

//Screens
import OrderTypeList from 'src/screens/OrderTypeList'
import Routes from "src/router/routes";


class OrderList extends React.PureComponent {

    //Server request
    getOrderStatuses = () => {
        this.setState({isLoaderVisible: true});
        new APIRequest.Builder()
            .get()
            .setReqId(API_GET_ORDER_STATUS)
            .reqURL(ApiURL.getOrderStatus)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ORDER_STATUS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            Array.isArray(response.data.order_status) &&
                            response.data.order_status.length > 0) {
                            let routes = [{
                                    key: 'all',
                                    title: this.props.localeStrings.allOrders
                                }],
                                return_order_index = null;
                            response.data.order_status.map((status, index) => {
                                routes.push({
                                    key: status.order_status_id,
                                    title: status.name,
                                    type: status.slug,
                                });
                                if (status.slug === Constants.OrderTypeReturn) {
                                    return_order_index = index
                                }
                            });
                            this.setState({routes}, () => {
                                if (this.state.fromNotif && return_order_index !== null) {
                                    this.setState({index: return_order_index})
                                }
                            })
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ORDER_STATUS:
                if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }
                if (this.state.orders.length === 0) {
                    this.setState({
                        errMessage: this.props.localeStrings.noOrders
                    })
                }
                break;
        }
    };

    //User Interaction
    backHandler = () => {
        BackHandler.removeEventListener("OrderListPopUpBack", this.backHandler);
        this.props.navigation.dispatch(StackActions.reset({
            index: 0,
            key: undefined,
            actions: [
                NavigationActions.navigate({routeName: Routes.MainRoute}),
            ]
        }));
        return true;
    };

    //UI methods

    renderScene = ({route}) => {
        if (Math.abs(this.state.index - this.state.routes.indexOf(route)) > 2) {
            return <View/>;
        }

        return <OrderTypeList navigation={this.props.navigation}
                              index={this.state.index}
                              currentOrderType={route}/>
    };

    renderLoader = () => {
        return (
            <View style={styles.internalLoader}>
                <ActivityIndicator size={'large'} color={Color.PRIMARY}/>
            </View>
        )
    };


    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let backHandler = navigation.getParam('backHandler', null);

        return {
            title: "navMyOrders",
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}
                                                       showEndSupportBtn={true}
                                                       btnLeftHandler={backHandler}
                                                       showBack/>
        }
    };

    constructor(props) {
        super(props);
        let fromNotif = this.props.navigation.getParam('fromNotif', false);
        this.state = {
            index: 0,
            routes: [],
            fromNotif,
            isLoaderVisible: false
        };
    }

    componentWillMount() {
        if (this.state.fromNotif) {
            this.props.navigation.setParams({
                backHandler: this.backHandler
            });
        }
    }

    componentDidMount() {
        this.getOrderStatuses();
        if (this.state.fromNotif) {
            BackHandler.addEventListener("OrderListPopUpBack", this.backHandler)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <Spinner visible={this.state.isLoaderVisible}/>
                {Array.isArray(this.state.routes) && this.state.routes.length > 0 ?
                    <TabView
                        navigationState={this.state}
                        onIndexChange={index => this.setState({index})}
                        initialLayout={{width: Dimensions.get('window').width}}
                        lazy={true}
                        removeClippedSubviews={IS_ANDROID}
                        renderLazyPlaceholder={this.renderLoader}
                        renderScene={this.renderScene}
                        renderTabBar={props =>
                            <TabBar
                                {...props}
                                scrollEnabled
                                indicatorStyle={{backgroundColor: Color.PRIMARY}}
                                style={{backgroundColor: Color.BG_COLOR_DARK}}
                                tabStyle={{width: 'auto'}}
                            />
                        }
                    /> : null}
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderList)

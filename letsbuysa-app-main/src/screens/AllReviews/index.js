import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    I18nManager,
    Button, FlatList, Image,
} from 'react-native';

//Third party
import RNRestart from 'react-native-restart';
import Splash from 'react-native-splash-screen';
import {connect} from "react-redux";
import {SafeAreaView} from "react-navigation";

//Custom component
import {
    Label,
    Hr,
    CustomNavigationHeader,
} from "src/component";

//Utility
import Action from "src/redux/action";
import {API_GET_ALL_REVIEWS, APIRequest, ApiURL} from "src/api";
import styles from './styles';
import {
    CommonStyle,
    Color,
    ThemeUtils,
    Constants,
    Icon,
    decodeImageUrl,
    Strings
} from "src/utils";
import Routes from "src/router/routes";


class AllReviews extends Component {

    //Server request
    getAllReviews = () => {
        this.setState({
            isLoaderVisible: true
        });
        let params = {
            "product_id": this.state.productData.product_id,
            "page": this.state.tempPage,

        };

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_ALL_REVIEWS)
            .reqURL(ApiURL.getAllReviews)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_GET_ALL_REVIEWS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.reviews) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                reviews: this.state.tempPage === 1 ? response.data.reviews : [...this.state.reviews, ...response.data.reviews],
                                page: dummyPage
                            });
                            /*if (Object.keys(response.data).includes("banners") && response.data["banners"].length > 0) {
                                this.setState({banners: response.data["banners"]})
                            }*/
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
            case API_GET_ALL_REVIEWS:
                /*if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }*/
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
                    this.getAllReviews();
                });
        }
    };


    //UI methods
    renderImageItems = (item, index) => {
        return (
            <View style={styles.reviewImageContainer}>
                <Image source={{uri: decodeImageUrl(item)}}
                       style={styles.reviewImage}
                       cache='force-cache'/>
            </View>
        );
    };

    renderRatings = (productRating, iconSize = ThemeUtils.fontNormal) => {
        let items = [1, 2, 3, 4, 5];
        return (
            <View style={styles.ratingsContainer}>
                {items.map((item, index) => {
                    return (
                        <View key={`${index}`}
                              style={index === 0 ?
                                  {marginStart: 0, marginEnd: 3} :
                                  {marginHorizontal: 3}}>
                            <Icon
                                name={(index + 1) > Math.floor(parseFloat(productRating)) ? 'my_favourites' : 'star_fill'}
                                size={iconSize}
                                color={Color.RATING_COLOR}/>
                        </View>)
                })}
            </View>
        )
    };

    renderReviewItem = (reviewItem, index) => {
        return (
            <View style={styles.reviewItemContainer}>
                <View style={styles.reviewDetail}>
                    <View style={{flex: 1}}>
                        {this.renderRatings(reviewItem.rating)}
                        <Label small
                               mt={10}
                               mb={5}
                               color={Color.TEXT_DARK}>
                            {reviewItem.text}
                        </Label>
                    </View>
                    {Array.isArray(reviewItem.images) && reviewItem.images.length > 0 &&
                    <View style={{flex: 1, marginVertical: 5}}>
                        <FlatList
                            data={reviewItem.images}
                            renderItem={
                                ({index, item}) => this.renderImageItems(item, index)
                            }
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            extraData={this.state}/>
                    </View>
                    }
                </View>
                <View style={styles.reviewInfo}>
                    <Label small
                           color={Color.TEXT_LIGHT}>
                        {reviewItem.author}
                    </Label>
                    <Label small
                           color={Color.TEXT_LIGHT}>
                        {reviewItem.date_added}
                    </Label>
                </View>
            </View>
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
                        {this.props.localeStrings.loadingReviews}
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
                    {this.props.localeStrings.pullRefresh}
                </Label>
            </View>
            : null)
    };

    emptyListStyle = () => {
        if (!this.state.reviews.length > 0)
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
            title: "navAllReviews",
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
            reviews: [],
            isLoaderVisible: false,
            page: 1,
            tempPage: 1,
        };
    }


    componentDidMount() {
        this.getAllReviews()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <SafeAreaView style={CommonStyle.safeArea} forceInset={{top: 'never'}}>
                <View style={styles.container}>
                    <FlatList
                        showsVerticalScrollIndicator={false}
                        extraData={this.state}
                        data={this.state.reviews}
                        keyExtractor={item => `${item.date_added}`}
                        renderItem={({index, item}) => this.renderReviewItem(item, index)}
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

export default connect(mapStateToProps, mapDispatchToProps)(AllReviews)
import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    I18nManager,
    Button,
} from 'react-native';

//Third party
import RNRestart from 'react-native-restart';
import Splash from 'react-native-splash-screen';
import {connect} from "react-redux";

//Utility
import Action from "src/redux/action";
import {API_GET_CATEGORIES, APIRequest, ApiURL} from "src/api";
import ThemeUtils from "../../utils/ThemeUtils";
import {Color} from "../../utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        marginStart: 10,
    },
    button: {
        color: '#334443',
        marginBottom: 5,

    },
    logoutBtn: {
        alignSelf: 'center'
    }
});

class Search extends Component {

    //Server request
    getCategoryRequest = () => {
        new APIRequest.Builder()
            .get()
            .setReqId(API_GET_CATEGORIES)
            .reqURL(ApiURL.getCategories)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    onResponse = (response, reqId) => {
        console.log('response', response)
    };

    onError = (error, reqId) => {
        console.log('error', error)
    };

    //User Interaction


    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {};
    }


    componentDidMount() {
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <View style={{
                alignSelf: 'center',
                width: ThemeUtils.relativeWidth(90),
                height: ThemeUtils.relativeHeight(80),
                backgroundColor: Color.WHITE
            }}>
                <Text>Search</Text>
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
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Search)
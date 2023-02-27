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

class Test extends Component {

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
    onLogout = () => {
        this.props.logoutUser()
    };

    onClickGetCategories = () => {
        this.getCategoryRequest()

    };


    //Lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            currentRTL: I18nManager.isRTL
        };
    }


    componentDidMount() {
        Splash.hide();
        console.log("isRTL", I18nManager.isRTL);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log('currentState', this.state.currentRTL);
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to React Native!</Text>
                <Text style={styles.button}>To get started, edit App.js</Text>
                <Button style={styles.button} title={'RTL false'}
                        onPress={() => {
                            this.setState({currentRTL: false}, () => {
                                I18nManager.forceRTL(false);
                                RNRestart.Restart();
                            });
                        }}/>
                <Button style={styles.button} title={'RTL true'}
                        onPress={() => {
                            this.setState({currentRTL: true}, () => {
                                I18nManager.forceRTL(true);
                                RNRestart.Restart();
                            });
                        }}/>
                <Button style={[styles.logoutBtn]} title={'Categories get'}
                        onPress={this.onClickGetCategories}/>
                <Button style={[styles.logoutBtn]} title={'Logout'}
                        onPress={this.onLogout}/>
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        logoutUser: () => dispatch(Action.logout()),
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Test)
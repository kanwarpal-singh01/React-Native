import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform
} from 'react-native';

import { translate } from '../../helper/translationHelper';

export default class ConnectAccount extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            facebook_account_id: '',
            apple_account_id: ''
        }
    }

    componentDidMount() {
        let { response } = this.props.route.params
        console.log('hey', response)
        this.setState({ apple_account_id: response.data.apple_account_id, facebook_account_id: response.data.facebook_account_id });
        if( Platform.OS == "android" && response.data.apple_account_id == ""){
            this.props.navigation.navigate('Welcome');
            return false;
        }
       
    }

    // //FaceBook code
    // onFackBookButtonPress = () => {
    //     console.log("PRESSED")
    //     LoginManager.logOut();
    //     LoginManager.logInWithPermissions(["public_profile", "email"]).then(
    //         (result) => {
    //             if (result.isCancelled) {
    //                 console.log("Login cancelled");
    //             } else {
    //                 console.log(result,
    //                     "Login success with permissions: " +
    //                     result.grantedPermissions.toString()
    //                 );
    //                 this.FBGraphRequest('id, email, name,picture.type(large)', this.FBLoginCallback);
    //             }
    //         }
    //     );
    // }

    // FBGraphRequest = (fields, callback) => {
    //     AccessToken.getCurrentAccessToken().then((accessData) => {
    //         console.log(accessData)
    //         const infoRequest = new GraphRequest('/me', {
    //             accessToken: accessData.accessToken,
    //             parameters: {
    //                 fields: {
    //                     string: fields
    //                 }
    //             }
    //         }, callback.bind(this));
    //         // Execute the graph request created above
    //         new GraphRequestManager().addRequest(infoRequest).start();
    //     })
    // }

    // FBLoginCallback = (error, result) => {
    //     if (error) {
    //         console.log(error)
    //     } else {
    //         console.log(result)
    //         let body = { type: "facebook", userId: result.id, userName: result.name }
    //         console.log('hello there idsss', body)
    //         this.onSocialLogin(result.id, result.name)
    //     }
    // }

    onSocialLogin(id, name) {
        this.setState({ loading: true })
        let body = { facebook_account_id: id, apple_account_id: '', name: name, device_type: Platform.OS == 'ios' ? 'ios' : 'app', token: 'abc' }
        console.log(body)
        axios
            .post(apiUrl + 'social_login', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    this.props.navigation.navigate('Welcome')
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    render() {
        let { phone } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>

                    <StatusBar barStyle={'light-content'} />

                    <ScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 20, fontFamily: 'Montserrat-SemiBold', marginTop: 40, textAlign: 'center' }}>{translate("You can also connect")}</Text>
                            <Text style={{ fontSize: 20, fontFamily: 'Montserrat-SemiBold', textAlign: 'center' }}>{translate("some other accounts")}</Text>
                            {Platform.OS == "ios" && !this.state.apple_account_id && <TouchableOpacity style={{ flexDirection: 'row', height: 44, borderColor: 'gray', borderWidth: 1, borderRadius: 16, marginHorizontal: 36, alignItems: 'center', justifyContent: 'center', marginTop: 28 }}>
                                <Image source={require('../../assets/connect/appleGray.png')} style={{ height: 22, width: 19, marginLeft: 12 }}></Image>
                                <Text style={{ flex: 1, textAlign: 'center' }}>{translate("SIGN IN WITH APPLE")}</Text>
                            </TouchableOpacity>}

                            {/* {!this.state.facebook_account_id && <TouchableOpacity style={{ flexDirection: 'row', height: 44, borderColor: 'gray', borderWidth: 1, borderRadius: 16, marginHorizontal: 40, alignItems: 'center', justifyContent: 'center', marginTop: 16 }} onPress={() => this.onFackBookButtonPress()}>
                                <Image source={require('../../assets/connect/facebookGray.png')} style={{ height: 18, width: 18, marginLeft: 12 }}></Image>
                                <Text style={{ flex: 1, textAlign: 'center' }}>{translate("SIGN IN WITH FACEBOOK")}</Text>
                            </TouchableOpacity>} */}
                            <TouchableOpacity style={{ marginTop: 40, marginBottom: 40 }} onPress={() => this.props.navigation.navigate('Welcome')}>
                                <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Regular', alignSelf: "center", color: 'gray' }}>{translate("Skip")}</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </>
        )
    }
}

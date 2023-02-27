import React, { Component } from 'react';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import { AuthContext } from '../../navigations/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { appleAuth, AppleButton } from '@invertase/react-native-apple-authentication';
import messaging from '@react-native-firebase/messaging';

import {
    ImageBackground,
    SafeAreaView,
    Image,
    View,
    TouchableOpacity,
    Text,
    Dimensions,
    Platform,
    StyleSheet,
    Linking
} from 'react-native';

import { translate } from '../../helper/translationHelper';

class FirstScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
        super();
    this.authCredentialListener = null;
    this.user = null;
    this.state = {
      credentialStateForUser: -1,
    }
    }
    async componentDidMount() {
      console.log("asdsadas")
      let fcmToken = await messaging().getToken();
      console.log("Your Firebase Token is:", fcmToken);

        Geolocation.getCurrentPosition(async info => {
            console.log("Location Info--->", info);
        })
        this.authCredentialListener();
    }

   //Apple login

//    componentWillUnmount() {
//     /**
//      * cleans up event listener
//      */
//     this.authCredentialListener();
//   }


  signIn = async () => {
    console.warn('Beginning Apple Authentication');

    // start a login request
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [
          appleAuth.Scope.EMAIL,
          appleAuth.Scope.FULL_NAME,
        ],
      });

      console.log('appleAuthRequestResponse', appleAuthRequestResponse);

      const {
        user,
        email,
        nonce,
        identityToken,
        realUserStatus /* etc */,
      } = appleAuthRequestResponse;

      //this.user = newUser;

      this.fetchAndUpdateCredentialState()
        .then(res => this.setState({ credentialStateForUser: res }))
        .catch(error =>
          this.setState({ credentialStateForUser: `Error: ${error.code}` }),
        );

      if (identityToken) {
        // this.onSocialLogin(identityToken, 'hhhh')
        // e.g. sign in with Firebase Auth using `nonce` & `identityToken`
        console.log(nonce, identityToken,"4545555");
      } else {
        // no token - failed sign-in?
      }

      if (realUserStatus === appleAuth.UserStatus.LIKELY_REAL) {
        console.log("I'm a real person!");
      }
      // var identityTokenVal =appleAuthRequestResponse.user;
      // if(email == null){
      //   identityTokenVal=await AsyncStorage.getItem('appleID');
      // }else{
      //   await AsyncStorage.setItem('appleID', identityTokenVal)
      // }
      // if(identityTokenVal != null){
      //   identityTokenVal = identityTokenVal.replace('"', '');
      //   identityTokenVal = identityTokenVal.replace('"', '');
      // }
     
      this.onSocialLogin(appleAuthRequestResponse.user, email)
      console.warn(`Apple Authentication Completed, ${this.user}, ${email}`);
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.warn('User canceled Apple Sign in.');
      } else {
        console.error(error);
      }
    }
  };

  fetchAndUpdateCredentialState = async () => {
    if (this.user === null) {
      this.setState({ credentialStateForUser: 'N/A' });
    } else {
      const credentialState = await appleAuth.getCredentialStateForUser(this.user);
      if (credentialState === appleAuth.State.AUTHORIZED) {
        this.setState({ credentialStateForUser: 'AUTHORIZED'});
      } else {
        this.setState({ credentialStateForUser: credentialState});
      }
    }
  }


    //FaceBook code
    // onFackBookButtonPress = () => {
    //     console.log("PRESSED")
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

    onSocialLogin(id, email) {
        this.setState({ loading: true })
        let body = { facebook_account_id: '', apple_account_id: id, email: email, device_type: Platform.OS == 'ios' ? 'ios' : 'app', token: 'abc' }
        console.log(body)
        axios
            .post(apiUrl + 'social_login', body)
            .then(async (response) => {
                console.log("Social Login Response --->", response.data)
                
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    if (response?.data?.data?.id) {
                        await AsyncStorage.setItem('userID', JSON.stringify(response?.data?.data?.id))
                    }

                    if (response.data?.data?.status == 1) {
                        this.props.appContext()
                    } else if (response.data?.data?.status == 0) {
                        this.props.navigation.navigate('MobileNumber', { userId: response.data?.data?.id, facebook_account_id: email, apple_account_id: id, })
                    } else if (response?.data?.data?.status == 4) {
                        this.props.navigation.navigate('Email');
                    } else {
                        this.props.navigation.navigate('MobileNumber', { userId: response.data?.data?.id, facebook_account_id: email, apple_account_id: id,})
                    }
                } else {
                    Toast.show(response.data.message);
                }
            })
            .catch((error) => {
                this.setState({ loading: false })
                console.log("Error ::: -->", error)

                // if (erroraa.toJSON().message === 'Network Error') {
                //     Toast.show('Please check your internet connection')
                // }
            });
    }

    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <ImageBackground source={require('../../assets/firstScreen/background.png')} style={{ flex: 1, width: null, height: null }}>
                    <SafeAreaView>
                        <View style={{ height: Dimensions.get('window').height - 104 }}>
                            <View style={{ position: 'absolute', bottom: Platform.OS == 'ios' ? 60 : 20, alignItems: 'center' }}>
                                <Image source={require('../../assets/firstScreen/logo.png')} resizeMode={'contain'} style={{ height: 160, width: "80%", marginHorizontal: 16 }} />
                                {Platform.OS == 'ios' &&
                                    <TouchableOpacity style={{ marginHorizontal: 16, marginTop: 56, marginVertical: 8 }} onPress={() => this.signIn()}>
                                        <Image source={require('../../assets/firstScreen/signApple.png')} resizeMode={'contain'} style={style.imageStyle}></Image>
                                    </TouchableOpacity>}
                                <TouchableOpacity style={style.touchableActionStyle} style={{ marginTop: Platform.OS == 'android' ? 56 : 0, marginVertical: Platform.OS == 'android' ? 16 : 0 }} onPress={() => this.props.navigation.navigate('MobileNumber', { userId: '' })}>
                                    <Image source={require('../../assets/firstScreen/signNumber.png')} resizeMode={'contain'} style={style.imageStyle}></Image>
                                </TouchableOpacity>
                                {/* <TouchableOpacity style={style.touchableActionStyle} onPress={() => this.onFackBookButtonPress()}>
                                    <Image source={require('../../assets/firstScreen/signFacebook.png')} resizeMode={'contain'} style={style.imageStyle}></Image>
                                </TouchableOpacity> */}
                                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: 'center', marginHorizontal: 36, marginTop: 56 }}>
                                    <Text style={{ fontSize: 14, color: 'white' }}>{translate("You agree to our")} </Text>
                                    <TouchableOpacity onPress={ ()=> Linking.openURL('https://www.thespotapplication.com/terms-of-service') }>
                                        <Text style={{ color: 'white', alignSelf: "center", fontSize: 14, fontWeight: 'bold' }}>{translate("Terms_Conditions")}</Text>
                                    </TouchableOpacity>
                                    <Text style={{ fontSize: 14, color: 'white' }}>{translate("when clicking Sign In")} </Text>
                                </View>
                            </View>
                        </View>
                    </SafeAreaView>
                </ImageBackground>
            </>
        )
    }
}

export function SiginComponentsss({ navigation }) {
    const { signIn } = React.useContext(AuthContext)
    return <FirstScreen appContext={signIn} navigation={navigation} />
}

const style = StyleSheet.create({
    touchableActionStyle: {
        marginHorizontal: 16,
        marginTop: 8
    },
    imageStyle: {
        height: 50,
        width: Dimensions.get('window').width - 40
    }
})
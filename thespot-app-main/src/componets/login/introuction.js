import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { AuthContext } from '../../navigations/context';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Dimensions,
    ScrollView
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { validations } from '../../helper/validation';
import { translate } from '../../helper/translationHelper';

class Intro extends Component {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            loading: false,
            userID: ''

        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    onSubmit() {

        let vaildationBody = { description: this.state.description }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);

        if (this.state.description == '') {
            Toast.show(translate('Please introduction yourself'))
        } else if (errors == "") {
            this.setState({ loading: true })
            let body = { bio: this.state.description, user_id: this.state.userID }
            console.log(body)
            axios
                .post(apiUrl + 'profile-completion', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.appContext()
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
            this.setState({ loading: false })
            Toast.show(translate(errors), 6)
        }
    }

    goToHome() {
        this.props.appContext()
    }

    render() {
        let { description } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <KeyboardAwareScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 70, letterSpacing: 2 }}>{translate("Introduce Yourself")}</Text>
                            <TouchableWithoutFeedback style={{ marginTop: 16, borderRadius: 4, backgroundColor: '#e0e0e0', height: 180, width: Dimensions.get('window').width - 80 }} onPress={() => this.ref.focus()}>
                                <TextInput style={{ fontSize: 16, marginHorizontal: 6, paddingTop: 6 }} ref={ref => (this.ref = ref)} multiline={true} onChangeText={text => this.onChange("description", text)} value={description}></TextInput>
                            </TouchableWithoutFeedback>
                            <SubmitButton title={translate("Continue")} onPress={() => this.onSubmit()} />
                            {/* <TouchableOpacity style={{ marginTop: 100 }} onPress={() => this.onSubmit()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>CONTINUE</Text>
                                </ImageBackground>
                            </TouchableOpacity> */}
                            <TouchableOpacity style={{ marginTop: 24, marginBottom: 40 }} onPress={() => this.goToHome()}>
                                <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Regular', alignSelf: "center", color: 'gray' }}>{translate("Skip")}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </SafeAreaView>
            </>
        )
    }
}

const style = StyleSheet.create({
    textInputStyle: {
        flex: 1,
        fontSize: 16,
        padding: 6,
        width: "100%"
    }
})

export function SiginComponent({ navigation }) {
    const { signIn } = React.useContext(AuthContext)
    return <Intro appContext={signIn} navigation={navigation} />
}
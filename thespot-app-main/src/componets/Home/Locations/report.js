import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
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
    Dimensions
} from 'react-native';
import SubmitButton from '../../../helper/SubmitButton';
import { translate } from '../../../helper/translationHelper';

export default class Report extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reportReason: '',
            loading: false,
            userID: '',
            reportUserId: ''

        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
        let { id } = this.props.route.params
        this.setState({ reportUserId: id }, () => {
            console.log(id)
        })
    }

    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    onSubmit() {
        
        if (this.state.reportReason.trim() == '') {
           alert('Please enter report reason');
           return false;
        } else {
            this.setState({ loading: true })
            let body = { report_user_id: this.props.route.params.report_user_id, user_id: this.state.userID, reason: this.state.reportReason }
            console.log(body)
            axios
                .post(apiUrl + 'report-on-user', body)
                .then((response) => {
                    console.log(response.data)
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        this.props.navigation.goBack()
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        }
    }

    render() {
        let { reportReason } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView />
                <KeyboardAwareScrollView>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Image source={require('../../../assets/backs.png')} resizeMode={'contain'} style={{ height: 30, width: 30, marginLeft: 16 }}></Image>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 22, marginLeft: 16 }}>{translate("Report")}</Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <TouchableWithoutFeedback style={{ marginTop: 120, borderRadius: 4, backgroundColor: '#e0e0e0', height: 180, width: Dimensions.get('window').width - 80 }} onPress={() => this.ref.focus()}>
                            <TextInput style={{ fontSize: 16, marginHorizontal: 6, paddingTop: 6 }} ref={ref => (this.ref = ref)} placeholder={'Enter Reason ...'} placeholderTextColor={'gray'} multiline={true} onChangeText={text => this.onChange("reportReason", text)} value={reportReason}></TextInput>
                        </TouchableWithoutFeedback>
                        <SubmitButton title="SUBMIT" onPress={() => this.onSubmit()} />
                        {/* <TouchableOpacity style={{ marginTop: 160 }} onPress={() => this.onSubmit()}>
                            <ImageBackground source={require('../../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center'}}>
                                <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80 }}>SUBMIT</Text>
                            </ImageBackground>
                        </TouchableOpacity> */}

                    </View>
                </KeyboardAwareScrollView>
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
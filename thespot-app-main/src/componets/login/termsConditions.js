import React, { Component } from 'react';
import axios from "axios";
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';


import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
} from 'react-native';

import { translate } from '../../helper/translationHelper'

const regex = /(<([^>]+)>)/ig;

export default class TermsAndConditions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            response: '',
            loading: false
        }
    }

    componentDidMount() {
        this.termsAndConditions()
    }

    termsAndConditions() {
        this.setState({ loading: true })
        axios
            .get('https://thespot.devtechnosys.info/terms-and-conditions')
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                let data = response.data.replace(regex, '');
                this.setState({ response: data })
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    render() {
        return (
            <>
                {this.state.loading && <Spinner />}
                <ImageBackground style={{ flex: 1, width: null, height: null }}>
                    <SafeAreaView style={{ backgroundColor: 'white' }} />
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Image source={require('../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 15, fontWeight: '800', color: '#f76128' }}>{translate("Terms_Conditions")}</Text>
                        <TouchableOpacity>
                            <Text style={{ fontSize: 15, fontWeight: '700', color: '#f76128' }}></Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView>
                        <View style={{ flex: 1, marginVertical: 18, marginHorizontal: 16 }}>
                            <Text style={{ fontSize: 15, fontWeight: '600', textAlign: "auto" }}>{this.state.response}</Text>
                        </View>
                    </ScrollView>
                </ImageBackground>
            </>
        )
    }
}
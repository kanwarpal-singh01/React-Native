import React, { Component } from 'react';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Image,
    TouchableOpacity,
    Text,
    Dimensions
} from 'react-native';

import { translate } from '../../../helper/translationHelper';


export default class ProfilePhotoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            photo: ''
        }
    }

    componentDidMount() {
        let { uri } = this.props.route.params
        console.log(uri.split('/').pop())
        this.setState({ photo: uri })
    }

    render() {
        return (
            <ImageBackground style={{ flex: 1, width: null, height: null }}>
                <SafeAreaView style={{ backgroundColor: '#f2f2f6' }} />
                <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                        <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#f76128' }}>{translate("User Profile Pic")}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#f76128' }}></Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Image source={this.state.photo.split('/').pop() == 'undefined' ? require('../../../assets/home/placholder.png') : { uri: this.state.photo }} style={{ height: 280, width: 280, borderRadius: 140, marginTop: Dimensions.get('window').height / 2 - 280 }} />
                </View>
            </ImageBackground>
        )
    }
}

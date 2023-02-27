import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground
} from 'react-native';

import { translate } from '../../helper/translationHelper';

export default class Welcome extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    render() {
        let { email } = this.state
        return (
            <ImageBackground source={require('../../assets/firstScreen/background.png')} style={{ flex: 1, width: null, height: null }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <Image source={require('../../assets/firstScreen/logo.png')} style={{ marginTop: 24, height: 80, width: 128 }} />
                        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 20, color: 'white', marginTop: 44 }}>{translate("WELCOME")}</Text>
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 13, lineHeight: 20, color: 'white', marginTop: 12, textAlign: 'center', letterSpacing: 1 }}>{translate("Check out our guidelines to a")}</Text>
                        <Text style={{ fontFamily: 'Montserrat', fontSize: 13, lineHeight: 20, color: 'white', textAlign: 'center', letterSpacing: 1 }}>{translate("great experience on The Spot")}</Text>
                        <View style={{ flexDirection: 'row', marginTop: 90, justifyContent: 'space-between' }}>
                            <View style={style.viewStyle}>
                                <Image source={require('../../assets/welcome/hand.png')} style={style.imageStyle} />
                                <Text style={style.titleTextStyle}>{translate("Be Respectful")}</Text>
                                <Text style={style.textStyle}>{translate("A little kindness goes a")}</Text>
                                <Text style={[style.textStyle, { marginTop: 2 }]}>{translate("long way")}</Text>
                            </View>
                            <View style={style.viewStyle}>
                                <Image source={require('../../assets/welcome/user.png')} style={style.imageStyle} />
                                <Text style={style.titleTextStyle}>{translate("Be Genuine")}</Text>
                                <Text style={style.textStyle}>{translate("Stay true to yourself and")}</Text>
                                <Text style={[style.textStyle, { marginTop: 2 }]}>{translate("use accurate information")}</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 48, justifyContent: 'space-between' }}>
                            <View style={style.viewStyle}>
                                <Image source={require('../../assets/welcome/hands.png')} style={style.imageStyle} />
                                <Text style={style.titleTextStyle}>{translate("Be Responsible")}</Text>
                                <Text style={style.textStyle}>{translate("Inappropriate behavior")}</Text>
                                <Text style={[style.textStyle, { marginTop: 2 }]}>{translate("hit the report button")}</Text>
                            </View>
                            <View style={style.viewStyle}>
                                <Image source={require('../../assets/welcome/mark.png')} style={style.imageStyle} />
                                <Text style={style.titleTextStyle}>{translate("Be Cautious")}</Text>
                                <Text style={style.textStyle}>{translate("Private information should")}</Text>
                                <Text style={[style.textStyle, { marginTop: 2 }]}>{translate("sometimes remain private")}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={{ position: 'absolute', bottom: 25 }} onPress={() => this.props.navigation.navigate('AllowLocations')}>
                            <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 40 }}>{translate("CONTINUE")}</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </ImageBackground>

        )
    }
}

const style = StyleSheet.create({
    viewStyle: {
        alignItems: 'center',
        width: 120,
        marginHorizontal: 36
    },
    imageStyle: {
        height: 42,
        width: 42
    },
    titleTextStyle: {
        fontFamily: 'Montserrat-Bold',
        fontSize: 11,
        color: 'white',
        marginTop: 10
    },
    textStyle: {
        fontFamily: 'Helvetica-Light',
        fontSize: 9,
        color: 'white',
        textAlign: 'center',
        marginTop: 8
    }
})
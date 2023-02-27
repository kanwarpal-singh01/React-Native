import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity } from 'react-native';
const SubmitButton = ({ title, onPress, TouchableStyle, textStyle }) => {
    return (
        <TouchableOpacity style={[styles.touchStyle, TouchableStyle]} onPress={onPress}>
            <ImageBackground source={require('../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 42, justifyContent: 'center' }}>
                <Text style={[styles.btnTextStyle, textStyle]}>{title}</Text>
            </ImageBackground>
        </TouchableOpacity>
    )
}
export default SubmitButton;
const styles = StyleSheet.create({
    touchStyle: {
        marginTop: 50,
        margin: 10,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 3,
        elevation: 6,
    },
    btnTextStyle: {
        color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 80,
        textTransform: 'uppercase'
    }
})
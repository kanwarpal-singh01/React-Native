import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const Spinner = () => {
    return (
        <View style={style.activityIndicatorView}>
            <ActivityIndicator style={style.activityIndicator} size="large" color="#f95721" />
        </View>
    )
}

const style = StyleSheet.create({
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80
    },
    activityIndicatorView: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        opacity: 0.5,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    }
})

export default Spinner;
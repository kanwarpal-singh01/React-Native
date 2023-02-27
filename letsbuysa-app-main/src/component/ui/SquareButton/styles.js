import React from 'react';
import {Color} from "src/utils/Color"
import {StyleSheet, PixelRatio} from 'react-native';

export const styles = StyleSheet.create({

    squareButton_Container: {
        alignItems: 'center',
        paddingStart: 0,
        paddingEnd: 0,
        borderRadius: 1,
        borderWidth: 1,
        borderBottomWidth: 0,
        shadowColor: Color.BLACK,
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 2,
    },
    squareButton_Text: {
        padding: 5,
        color: Color.WHITE,
    }
});

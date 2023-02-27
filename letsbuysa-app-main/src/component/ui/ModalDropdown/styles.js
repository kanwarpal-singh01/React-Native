import {StyleSheet} from "react-native";

export default StyleSheet.create({
    button: {
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 12
    },
    modal: {
        flexGrow: 1
    },
    dropdown: {
        position: 'absolute',
        // maxHeight: (33 + StyleSheet.hairlineWidth) * 5,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'lightgray',
        borderRadius: 2,
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    loading: {
        alignSelf: 'center'
    },
    list: {
        //flexGrow: 1,
    },
    rowText: {
        paddingHorizontal: 6,
        paddingVertical: 10,
        fontSize: 11,
        color: 'gray',
        backgroundColor: 'white',
        textAlignVertical: 'center'
    },
    highlightedRowText: {
        color: 'black'
    },
    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: 'lightgray'
    }
});
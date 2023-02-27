import {StyleSheet} from "react-native";
import {Color, ThemeUtils, UtilityManager} from "src/utils";


const styles = StyleSheet.create({
    container: {
        minHeight: ThemeUtils.relativeHeight(70) - UtilityManager.getInstance().getStatusBarHeight()
    },
    guideLabel: {
        alignSelf: 'center',
        textAlign: 'center'
    },
    sendCodeAgainLabel: {
        alignSelf: 'center'
    },
    changeNumberLabel: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'solid',
        alignSelf: 'center'
    },
    orLable: {
        textDecorationColor: Color.PRIMARY,

        alignSelf: 'center'
    },

    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        start: 0,
        end: 0,
        backgroundColor: Color.LIGHT_WHITE,
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 20 
    },
});
export default styles;
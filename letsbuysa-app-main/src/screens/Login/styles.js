import {StyleSheet} from "react-native";
import {Color, ThemeUtils, UtilityManager} from "src/utils";

export default StyleSheet.create({
    container: {
        minHeight: ThemeUtils.relativeHeight(70) - UtilityManager.getInstance().getStatusBarHeight()
    },
    welcome: {
        fontSize: 20,
    },
    button: {
        color: '#334443',
        marginBottom: 5,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginVertical: 10
    },
    socialButtonContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 5,
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'space-between'
    },
});
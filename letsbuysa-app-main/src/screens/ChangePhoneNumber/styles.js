import {StyleSheet} from "react-native";
import {Color, IS_ANDROID, ThemeUtils, UtilityManager} from "src/utils";

export default StyleSheet.create({
    container: {
        minHeight: ThemeUtils.relativeHeight(70) - UtilityManager.getInstance().getStatusBarHeight()
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
    mobileContainer: {
        flex: 1,
        width: ThemeUtils.relativeWidth(80),
        flexDirection: 'row',
    },
    countryCodeContainer: {
        marginEnd: 10
    },
    countryCode: {
        width: ThemeUtils.relativeWidth(25)
    },
    mobileNumber: {
        flex: 1
    }
});
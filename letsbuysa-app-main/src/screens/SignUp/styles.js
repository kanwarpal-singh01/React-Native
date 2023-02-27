import {StyleSheet} from "react-native";
import {Color, ThemeUtils, UtilityManager} from "src/utils";

const styles = StyleSheet.create({
    container: {
        minHeight: ThemeUtils.relativeHeight(70) - UtilityManager.getInstance().getStatusBarHeight()
    },
    mobileContainer: {
        flex: 1,
        // width: ThemeUtils.relativeWidth(75),
        flexDirection: 'row',
    },
    countryCodeContainer: {
        marginEnd: 10
    },
    countryCode: {
        width: ThemeUtils.relativeWidth(30)
    },
    mobileNumber: {
        flex: 1
    }
});

export default styles;
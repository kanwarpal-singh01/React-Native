import {StyleSheet} from "react-native";
import {ThemeUtils, UtilityManager} from "src/utils";

const styles = StyleSheet.create({
    container: {
        // minHeight: ThemeUtils.relativeHeight(70) - UtilityManager.getInstance().getStatusBarHeight()
        marginHorizontal: ThemeUtils.relativeWidth(7.5)
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24
    },
    menuContainer: {
        flex: 1,
        marginBottom: 5
    },
    menuBottom: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 30
    },
    followLabel: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    followBtns: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    followBtnLogo: {
        width: ThemeUtils.relativeWidth(5),
        height: ThemeUtils.relativeWidth(5)
    },
    authBtnContainer: {
        width: ThemeUtils.relativeWidth(90),
        marginTop: 25,
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: 'center'
    },
    arabicAppName: {
        height: ThemeUtils.fontXXLarge + 12,
        aspectRatio: 364 / 168,
        alignItems: 'center'
    }
});

export default styles;

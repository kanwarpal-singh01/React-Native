import {StyleSheet} from "react-native";
import {ThemeUtils, UtilityManager} from "src/utils";
import {Color} from "../../utils";

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
    },
    switchView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: ThemeUtils.relativeHeight(2),
        marginBottom: ThemeUtils.relativeHeight(2),
    },
    dropdownIcon: {
        position: 'absolute',
        end: 0,
        top: 35,
        bottom: 0
    },
    searchOnMapBtn: {
        width: '100%',
        backgroundColor: Color.WHITE,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchOnMapBtnContainer: {
        width: ThemeUtils.relativeWidth(80),
        flexDirection: 'row',
        alignItems: 'center',
    },
    mapBtnLabel: {
        flex: 1,
        paddingStart: 10
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end'
    }
});

export default styles;
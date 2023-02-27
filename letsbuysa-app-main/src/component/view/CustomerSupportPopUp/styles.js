import {StyleSheet} from "react-native";
import {
    CommonStyle,
    Color,
    ThemeUtils
} from "src/utils";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.DARK_LIGHT_BLACK
    },
    bottomViewContainer: {
        backgroundColor: Color.LIGHT_WHITE,
        width: ThemeUtils.relativeWidth(100),
        borderTopStartRadius: ThemeUtils.relativeWidth(4),
        borderTopEndRadius: ThemeUtils.relativeWidth(4),
        position: 'absolute',
        bottom: 0,
        paddingVertical: 10,
        alignSelf: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 15,
        marginHorizontal: ThemeUtils.relativeWidth(10)
    },
    itemContainer: {
        borderRadius: 3,
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 2,
        backgroundColor: Color.WHITE,
        height: ThemeUtils.relativeHeight(45) / 5 - (20),
        justifyContent: 'center',
        marginVertical: 5
    },
    itemMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    startContainer: {
        flex: 0.43,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    endContainer: {
        flex: 0.57,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    closeBtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40
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
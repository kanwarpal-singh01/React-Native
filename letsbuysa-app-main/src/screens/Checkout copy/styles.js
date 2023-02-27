import {StyleSheet} from "react-native";
import {
    Color,
    IS_IOS,
    ThemeUtils
} from "src/utils";

export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: Color.LIGHT_WHITE,
    },
    addressBox: {
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: Color.WHITE
    },
    addressLabel: {
        margin: 8,
    },
    tagBoxView: {
        height: 25,
        minWidth: ThemeUtils.relativeWidth(15),
        backgroundColor: Color.PRIMARY,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        padding: 5,
        marginVertical: 8,
    },
    radioSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    paymentOptionContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // marginHorizontal: 5,
    },
    sectionBlock: {
        flex: 1,
        marginBottom: 10,
        paddingHorizontal: ThemeUtils.relativeWidth(5),
        paddingVertical: 10,
        backgroundColor: Color.WHITE
    },
    couponCodeContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    },
    couponInput: {
        flex: 1,
        fontSize: ThemeUtils.fontSmall,
        height: ThemeUtils.fontSmall + 29,
        color: Color.TEXT_DARK,
        marginHorizontal: 10,
        borderWidth: 1,
        borderRadius: 5,
        paddingStart: 10
    },
    lineSeparator: {
        height: 0.5,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    costTypeContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5
    },
    shippingRadio: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginHorizontal: 5
    }
});

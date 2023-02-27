import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.LIGHT_WHITE
    },
    notifItemContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        paddingHorizontal: ThemeUtils.relativeWidth(5),
        marginVertical: 5,
        justifyContent: 'center',
    },
    notifLabelContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_WHITE,
        marginVertical: 5
    },
    unreadBadge: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 10,
        borderColor: Color.TRANSPARENT,
    }
});
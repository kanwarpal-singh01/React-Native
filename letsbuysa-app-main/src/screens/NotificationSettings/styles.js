import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: 5
    },
    container: {
        flex: 1,
        backgroundColor: Color.WHITE,
        marginHorizontal: ThemeUtils.relativeWidth(5),
    },
});
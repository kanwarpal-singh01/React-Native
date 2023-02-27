import {StyleSheet} from "react-native";
import {
    Color,
    Constants,
    ThemeUtils
} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Color.LIGHT_WHITE
    },
    internalLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.DARK_LIGHT_BLACK,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
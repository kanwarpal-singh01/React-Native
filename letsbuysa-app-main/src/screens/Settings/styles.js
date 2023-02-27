import {StyleSheet} from "react-native";
import {Color, ThemeUtils, UtilityManager} from "src/utils";


const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24
    },
    container: {
        marginHorizontal: ThemeUtils.relativeWidth(7.5),
        marginVertical: ThemeUtils.relativeWidth(3),
    },
});
export default styles;
import {StyleSheet} from "react-native";
import {ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    container: {
        marginHorizontal: ThemeUtils.relativeWidth(7.5)
    },
    menuContainer: {
        flex: 1,
        marginBottom: 5
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24
    },
})

export default styles;
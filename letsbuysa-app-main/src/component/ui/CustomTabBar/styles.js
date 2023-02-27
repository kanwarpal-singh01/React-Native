import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: Color.BG_COLOR_DARK,
        width: '100%',
        minHeight: ThemeUtils.relativeHeight(10),
        shadowOffset: {
            height: 0,
        },
        shadowRadius: 5,
        shadowColor: Color.BLACK,
        shadowOpacity: 0.3,
        elevation: 5,
    },
    tabButtonContainer: {
        justifyContent: 'center',
        marginVertical: 10
    },
    tabButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: (ThemeUtils.relativeWidth(40) / 2) - 34, //40% width subtracting margins and padding
    },
    badgeView: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 2,
        right: 0,
        width: 22,
        height: 22,
        backgroundColor: Color.RED,
        borderRadius: 11,
        borderColor: Color.BG_COLOR_DARK,
        borderWidth: 2
    },
    iconContainer: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

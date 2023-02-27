import {StyleSheet} from "react-native";
import {Color} from "./Color";
import ThemeUtils from "./ThemeUtils";

const Style = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.WHITE
    },
    container: {
        flex: 1,
        backgroundColor: Color.BG_COLOR
    },
    content_center: {
        alignItems: "center",
        justifyContent: "center"
    },
    backButton: {
        marginEnd: 20,
        justifyContent: 'center',
        position: 'absolute',
        height: ThemeUtils.relativeWidth(50) * 0.3
    },
    topAnimContainer: {
        height: ThemeUtils.relativeHeight(30),
        alignItems: 'center',
        backgroundColor: Color.BG_COLOR_DARK
    },
    underlineLabel: {
        textDecorationLine: 'underline',
        textDecorationColor: Color.BLACK,
        textDecorationStyle: 'solid',
    },
    bottomContainer: {
        width: '100%',
        backgroundColor: Color.LIGHT_WHITE,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 20,
    },
    skipBtn: {
        position: 'absolute',
        end: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backBtn: {
        position: 'absolute',
        start: 10,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerLogo: {
        width: ThemeUtils.relativeWidth(20),
        height: ThemeUtils.relativeWidth(20)
    },
    headerLogoContainer: {
        marginTop: 15, marginBottom: 5
    },
    contentVerticalBottom: {
        flex: 1,
        justifyContent: 'flex-end'
    }
});

export default Style;
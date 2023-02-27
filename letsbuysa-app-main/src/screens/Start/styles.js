import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bgImage: {
        backgroundColor: Color.GRAY,
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    headerImage: {
        flex: 1,
        alignSelf: 'center',
        marginBottom: 10,
        width: 200,
        height: 200,
    },
    bottomContainer: {
        flex: 0.2,
        width: ThemeUtils.relativeWidth(70),
        marginBottom: 30
    },
    button: {
        color: '#334443',
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        alignSelf: 'center',
        marginTop: 20,
    },
    skipText: {
    }
});
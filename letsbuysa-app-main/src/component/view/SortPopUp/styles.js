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
        backgroundColor: Color.WHITE,
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
        marginTop: 15,
        marginBottom: 5,
        marginHorizontal: ThemeUtils.relativeWidth(10)
    },
    itemContainer: {
        // borderRadius: 3,
        // shadowColor: Color.BLACK,
        // shadowOffset: {
        //     width: 0,
        //     height: 1,
        // },
        // shadowOpacity: 0.22,
        // shadowRadius: 2.22,
        // elevation: 2,
        backgroundColor: Color.WHITE,
        height: ThemeUtils.relativeHeight(45) / 6 - (25),
        justifyContent: 'center',
        marginVertical: 10
    },
    itemMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    lineSeparator: {
        height: 0.5,
        backgroundColor: Color.LIGHT_GRAY,
    }
});
export default styles;
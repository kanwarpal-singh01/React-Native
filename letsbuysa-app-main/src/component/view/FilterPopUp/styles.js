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
    safeArea: {
        flex: 1,
    },
    bottomViewContainer: {
        backgroundColor: Color.WHITE,
        height: '100%',
        // borderTopStartRadius: ThemeUtils.relativeWidth(4),
        // borderTopEndRadius: ThemeUtils.relativeWidth(4),
        position: 'absolute',
        top: 0,
        end: 0,
        paddingVertical: 20,
        flex: 1
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 5,
        marginHorizontal: ThemeUtils.relativeWidth(5),
    },
    itemContainer: {
        backgroundColor: Color.WHITE,
        justifyContent: 'center',
        marginVertical: 10
    },
    itemMain: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginStart: 10
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
        height: 40,
    },
    lineSeparator: {
        height: 0.5,
        backgroundColor: Color.LIGHT_GRAY,
    },
    filterContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: ThemeUtils.relativeWidth(10)
    },
    bottomButton: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderEndColor: Color.LIGHT_GRAY,
    },
    applyContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems:'center',
        alignContent:'center',
        marginHorizontal: ThemeUtils.relativeWidth(5),
    }
});
export default styles;
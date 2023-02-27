import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from 'src/utils';

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.DARK_LIGHT_BLACK
    },
    statusBarView: {
        backgroundColor: Color.TRANSPARENT
    },
    contentContainer: {
        minHeight: ThemeUtils.APPBAR_HEIGHT,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    headerImageContainer: {
        flex: 1.0,
        alignSelf: 'center',
        alignItems: 'center'
    },
    rightIcon: {
        width: 40,
        height: 40,
        marginEnd: 15,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    leftIcon: {
        marginStart: 15,
        alignSelf: 'center',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    homeProgress: {
        width: 40,
        height: 40,
        marginEnd: 10,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    homeProgressLeftSpace: {
        marginStart: 10,
        alignSelf: 'center',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    searchContainer: {
        alignSelf: 'flex-end',
        backgroundColor: Color.WHITE,
        // position: 'absolute',
        marginTop: 10,
        marginEnd: ThemeUtils.relativeWidth(5),
        overflow: 'hidden',
    },
    searchInnerContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_WHITE,
        marginVertical: 5
    },
    productImg: {
        flex: 1
    },
    productPrice: {
        marginVertical: 10,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    }
});

export default styles;
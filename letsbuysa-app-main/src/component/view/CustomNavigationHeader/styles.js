import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from 'src/utils';

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        backgroundColor: Color.BG_COLOR_DARK
    },
    statusBarView: {
        backgroundColor: 'transparent'
    },
    contentContainer: {
        minHeight: ThemeUtils.APPBAR_HEIGHT,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    headerMainContainer: {
        flex: 1.0,
        alignSelf: 'center',
        alignItems: 'center',
    },
    headerLeftContainer: {
        flex: 1.0,
        alignSelf: 'center',
        alignItems: 'flex-start'
    },
    leftIcon: {
        marginStart: 15,
        alignSelf: 'center',
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center'
    },
    rightIcon: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    wishlistBtn: {
        width: 40,
        height: 40,
        marginEnd: 5,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    cartBtn: {
        width: 40,
        height: 40,
        marginEnd: 15,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    searchContainer: {
        alignSelf: 'center',
        backgroundColor: Color.WHITE,
        position: 'absolute',
        top: 10,
        end: ThemeUtils.relativeWidth(5),
        overflow: 'hidden'
    },
    searchInnerContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    badgeView: {
        justifyContent: 'center',
        alignItems: 'center',
        textAlignVertical: 'center',
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
    arabicAppName: {
        flex:1,
        height: ThemeUtils.fontXXLarge + 12,
        aspectRatio: 364 / 168,
        alignItems: 'center',
    }
});

export default styles;

import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.WHITE
    },
    container: {
        flex: 1,
        backgroundColor: Color.WHITE,
    },
    categoryBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        marginHorizontal: ThemeUtils.relativeWidth(5),
    },
    sectionContainer: {},
    sectionLineContainer: {
        marginVertical: 5,
        marginHorizontal: ThemeUtils.relativeWidth(5),
        marginBottom: 10,
        width: 55
    },
    sectionLine: {
        height: 2.5,
        backgroundColor: Color.PRIMARY
    },
    sectionRuleContainer: {
        marginHorizontal: ThemeUtils.relativeWidth(5),
        marginTop: 15,
        marginBottom: 10
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_GRAY
    },
    itemContainer: {
        marginVertical: 10,
        marginHorizontal: 10,
        width: ThemeUtils.relativeWidth(43),
        elevation: 3,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
        borderRadius: 5,
        backgroundColor: Color.WHITE,
    },
    itemImage: {
        width: ThemeUtils.relativeWidth(43), aspectRatio: 1
    },
    itemDetailContainer: {
        marginVertical: 5,
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'flex-start'
    },
    itemPriceContainer: {
        paddingHorizontal: 10,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    itemActionContainer: {
        borderTopWidth: 0.5,
        borderColor: Color.DARK_LIGHT_BLACK,
        marginVertical: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    btnFavourite: {
        marginTop: 5,
        alignItems: 'center',
    },
    btnAddToCart: {
        marginTop: 5,
        flexDirection: 'row'
    },
    discountContainer: {
        position: 'absolute',
        top: 10,
        start: 10,
        minWidth: ThemeUtils.relativeWidth(15),
        borderRadius: 15,
        backgroundColor: Color.ERROR,
        paddingVertical: 5,
        paddingHorizontal: 5,
        alignItems: 'center'
    },
    welcome: {
        fontSize: 20,
        marginStart: 10,
    },
    button: {
        color: '#334443',
        marginBottom: 5,

    },
    logoutBtn: {
        alignSelf: 'center'
    },
    bannerSliderImage: {
        width: ThemeUtils.relativeWidth(100),
        aspectRatio: 414 / 200
    },
    bannerSlider: {
        width: ThemeUtils.relativeWidth(100),
        aspectRatio: 414 / 230 //extra 30 height for pager dot indicator
    },
    bannerCategory: {
        width: ThemeUtils.relativeWidth(100),
        marginVertical: 5
    },
    bannerCategoryImage: {
        width: ThemeUtils.relativeWidth(100),
        aspectRatio: 414 / 200
    },
    userLineContainer: {
        marginTop: 10,
        marginBottom: 10
    }

});

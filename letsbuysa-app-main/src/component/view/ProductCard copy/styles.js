import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    itemContainer: {
        marginVertical: 10,
        marginHorizontal: 10,
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
        borderColor: Color.MAP_CIRCLE_FILL,
        borderWidth: ThemeUtils.IS_PRE_LOLLIPOP ? 1.5 : 0
    },
    itemImageContainer: {
        borderTopEndRadius: 5,
        borderTopStartRadius: 5,
        overflow: "hidden"
    },
    itemImage: {
        aspectRatio: 1
    },
    itemDetailContainer: {
        flex: 1,
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
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    btnFavourite: {
        marginTop: 5,
        alignItems: 'center',
    },
    btnAddToCart: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center'
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
});

export default styles;

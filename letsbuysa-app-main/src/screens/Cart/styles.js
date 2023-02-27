import {StyleSheet} from "react-native";
import {
    Color,
    ThemeUtils
} from "src/utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.LIGHT_WHITE,
    },
    itemMainContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        marginBottom: 5
    },
    itemTopMain: {
        flex: 0.8,
        flexDirection: 'row',
        paddingVertical: 10
    },
    itemBottomMain: {
        flex: 0.2,
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderColor: Color.LIGHT_GRAY,
    },
    itemLeftDetail: {
        flex: 0.4,
        alignItems: 'center',
    },
    itemRightDetail: {
        flex: 0.6,
        alignItems: 'flex-start',
    },
    itemButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderEndWidth: 0.5,
        borderEndColor: Color.LIGHT_GRAY,
        backgroundColor: Color.WHITE,
    },
    cartImgContainer: {
        width: ThemeUtils.relativeWidth(29),
        borderRadius: 5,
        overflow: 'hidden',
        marginTop: 5
    },
    cartImg: {
        width: '100%',
        aspectRatio: 1,
    },
    cartProductName: {
        alignItems: 'flex-start',
        marginVertical: 5,
    },
    cartPrice: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    cartDiscountView: {
        alignItems: 'center',
        minWidth: ThemeUtils.relativeWidth(15),
        borderRadius: 15,
        backgroundColor: Color.ERROR,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginHorizontal: 5,
    },
    quantityBtn: {
        minWidth: ThemeUtils.relativeWidth(13),
        marginStart: 10,
        borderColor: Color.LIGHT_GRAY,
        borderWidth: 0.5,
        borderRadius: 3,
        paddingVertical: 5
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 5,
    },
    quantityBtnMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityDropdown: {
        elevation: 3,
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        minWidth: ThemeUtils.relativeWidth(13),
    },
    bottomSection: {
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Color.WHITE,
        flexDirection: 'row',
        minHeight: ThemeUtils.relativeHeight(10),
        elevation: 24,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
    },
    bottomStart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        marginStart: 15,
    },
    bottomEnd: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginEnd: 15,
    },
    stockLabel: {
        marginVertical: 5,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    freeShippingContainer: {
        minHeight: ThemeUtils.relativeHeight(5),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.WHITE,
        borderBottomWidth: 0.5,
        borderBottomColor: Color.LIGHT_GRAY
    },
    optionTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorOption: {
        width: 32,
        height: 32,
        borderWidth: 2,
        borderRadius: 16,
        borderColor: ThemeUtils.IS_PRE_LOLLIPOP ? Color.MAP_CIRCLE_FILL : Color.WHITE,
        marginVertical: 5,
      //  marginEnd: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sizeOption: {
        minWidth: 50,
        height: 25,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: Color.PRIMARY,
        marginHorizontal: 5,
        marginVertical: 5,
        backgroundColor: Color.WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    shadowBg: {
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    emptyImage: {
        width: ThemeUtils.relativeWidth(30),
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});

export default styles;

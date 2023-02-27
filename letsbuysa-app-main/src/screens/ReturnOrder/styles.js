import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";
import {Constants, IS_ANDROID} from "../../utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blockContainer: {
        flex: 1,
        marginVertical: 10,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    mainBlock: {
        backgroundColor: Color.WHITE,
        marginBottom: 10
    },
    mainContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        paddingHorizontal: ThemeUtils.relativeWidth(5)
    },
    orderIdStatus: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
    },
    lineSeparator: {
        height: 0.5,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 10
    },
    labelContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    paymentLabel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5
    },
    shipmentLabel: {
        flex: 1,
        justifyContent: 'center',
        marginTop: 10,
        marginBottom: 10
    },
    addressMain: {
        flex: 1,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 5
    },
    addressBox: {
        paddingBottom: 10,
        backgroundColor: Color.WHITE
    },
    addressLabel: {
        flex: 1,
    },
    tagBoxView: {
        height: 25,
        minWidth: ThemeUtils.relativeWidth(15),
        backgroundColor: Color.PRIMARY,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        marginVertical: 8,
        padding: 5,
    },
    costTypeContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5
    },
    itemTopMain: {
        flex: 1,
        flexDirection: 'row',
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
        backgroundColor: Color.WHITE,
        marginTop: 10,
        borderTopWidth: 0.5,
        borderColor: Color.LIGHT_GRAY
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
    optionTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorOption: {
        width: 25,
        height: 25,
        borderWidth: 2,
        borderRadius: 15,
        borderColor: ThemeUtils.IS_PRE_LOLLIPOP ? Color.MAP_CIRCLE_FILL : Color.WHITE,
        marginVertical: 5,
        alignItems: 'center',
        justifyContent: 'center'
    },
    sizeOption: {
        minWidth: 50,
        height: 25,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: Color.TEXT_DARK,
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
    squareButton: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 1,
        borderWidth: 1,
        backgroundColor: Color.LIGHT_WHITE,
        borderColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    inputContainer: {
        backgroundColor: Color.WHITE,
        borderWidth: 0.5,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 5,
        paddingHorizontal: 10,
        marginHorizontal: 10
    },
    reviewInput: {
        marginVertical: IS_ANDROID ? 0 : 5,
        minHeight: 90,
        maxHeight: 90,
        flexWrap: 'wrap',
        fontFamily: Constants.FontStyle.regular,
        fontSize: ThemeUtils.fontSmall,
        textAlignVertical: 'top'
    },
    submitBtn: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    selectAllBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
        marginVertical: 10,
    },
    itemTouchContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    detailsContainer: {
        backgroundColor: Color.WHITE,
        marginBottom: 10,
        paddingHorizontal: ThemeUtils.relativeWidth(5)
    }
});

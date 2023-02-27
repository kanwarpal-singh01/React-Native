import {StyleSheet, Platform} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.WHITE,
    },
    sliderContainer: {
        width: ThemeUtils.relativeWidth(100),
        aspectRatio: ThemeUtils.relativeWidth(100) / ThemeUtils.relativeWidth(110)
    },
    productImage: {
        width: '100%',
        aspectRatio: 1
    },
    newBtnAddToCart1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        height:40,
        width:ThemeUtils.relativeWidth(90),
        borderRadius:5,
        backgroundColor:Color.PRIMARY,
        paddingHorizontal:5,
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    detailsContainer: {
        flex: 1,
        marginHorizontal: ThemeUtils.relativeWidth(5)
    },

    attriButeContainer: {
        flex: 1,
        marginVertical: ThemeUtils.relativeHeight(2)
    },
    nameStockContainer: {
        width:ThemeUtils.relativeWidth(90),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
    newBtnAddToCart: {
        flexDirection: 'row',
        alignItems: 'center',
       // borderWidth:1,
       // height:30,
       // borderRadius:5,
       // borderColor:Color.PRIMARY,
        paddingHorizontal:5,
        marginRight:5
    },
    featureProductContainer:{
        flex: 1,
        marginHorizontal: ThemeUtils.relativeWidth(5), 
        marginVertical: ThemeUtils.responsiveHeight(3)
    },
    descContainer: {
        flex:1,
        justifyContent: 'center',
        marginVertical: 10,
    },
    priceRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    priceContainer: {
        flex: 0.6,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    discountView: {
        alignItems: 'center',
        minWidth: ThemeUtils.relativeWidth(15),
        borderRadius: 15,
        backgroundColor: Color.ERROR,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginHorizontal: 5,
    },
    ratingsMain: {
        flex: 0.4,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    quantityBtn: {
        minWidth: ThemeUtils.relativeWidth(15),
        marginStart: 10,
        borderColor: Color.LIGHT_GRAY,
        borderWidth: 0.5,
        paddingVertical: 10
    },
    quantityBtnMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginVertical: 10,
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
        minWidth: ThemeUtils.relativeWidth(15),
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
    reviewMain: {
        flex: 1,
        marginVertical: 5
    },
    reviewTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5
    },
    reviewDetail: {
        marginVertical: 5,
        justifyContent: 'center',
    },
    reviewInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    featureGroup: {
        marginVertical: 10,
        alignItems: 'flex-start'
    },
    featureDetail: {
        marginBottom: 5,
        flexDirection: 'row'
    },
    featureName: {
        flex: 0.4,
        alignItems: 'flex-start'
    },
    featureValue: {
        flex: 0.6,
        alignItems: 'flex-start'
    },
    sectionContainer: {
        flex: 1,
        marginVertical: 5,
    },
    sectionLineContainer: {
        width: 55,
        marginBottom: 10,
        marginHorizontal: ThemeUtils.relativeWidth(5)
    },
    sectionLine: {
        height: 2.5,
        backgroundColor: Color.PRIMARY
    },
    categoryBlock: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: ThemeUtils.relativeWidth(5)
    },
    bottomBtnContainer: {
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: Color.WHITE,
        flexDirection: 'row',
        height: ThemeUtils.relativeHeight(8),
        elevation: 24,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
    },
    btnAddToCart: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnBuyNow: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    wishlistBtn: {
        position: 'absolute',
        end: 15,
        bottom: ThemeUtils.relativeWidth(10) + 10,
        alignItems: 'center',
        justifyContent: 'center',
        textAlignVertical: 'center',
        height: 40,
        width: 40,
        borderRadius: 20,
        backgroundColor: Color.WHITE,
        elevation: 3,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
        borderColor: Color.MAP_CIRCLE_FILL,
        borderWidth: ThemeUtils.IS_PRE_LOLLIPOP ? 1.5 : 0
    },
    shareButton: {
        zIndex: 1,
        position: 'absolute',
        alignSelf: 'flex-end',
        backgroundColor: Color.TEXT_DARK,
        elevation: 3,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
    },
    shareRipple: {
        height: 40,
        width: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewImageContainer: {
        borderColor: Color.TEXT_SECONDARY,
        borderWidth: 1,
        borderRadius: 5,
        margin: 3,
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    reviewImage: {
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80)
    },
    optionTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    
    colorOption: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 15,
        borderColor: ThemeUtils.IS_PRE_LOLLIPOP ? Color.MAP_CIRCLE_FILL : Color.WHITE,
        marginHorizontal: 5,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        borderColor: Color.BLACK
    },

    sizeOption: {
        minWidth: 50,
        //height: 25,
        borderRadius: 5,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: Color.WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },

    selectedSizeOption: {
        minWidth: 50,
        height: 25,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: Color.TEXT_DARK,
        elevation: 3,
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: Color.TEXT_DARK,
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
    noStockOption: {
        opacity: 0.4,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: Color.GRAY
    }
});

export default styles;

import { ColorPropType } from "react-native";
import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    itemContainer: {
        marginVertical: 10,
        marginHorizontal: 5,
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
       // flex:1,
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
        width:'100%',
        paddingLeft: 10,
        marginBottom: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems:'center'
    },
    itemActionContainer: {
        borderTopWidth: 0.5,
        borderColor: Color.DARK_LIGHT_BLACK,
        marginVertical: 5,
        paddingHorizontal: 5,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
       // marginVertical: 10,
    },
    btnFavourite: {
        marginTop: 5,
        alignItems: 'center',
    },
    btnAddToCart: {
        marginTop: 5,
        flexDirection: 'row',
        alignItems: 'center',
        width:'75%',

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



    // New Design [ 08-03-2021 ]
    newDiscountContainer: {
        position:'absolute',
        backgroundColor:Color.PRIMARY,
        right:0,
        top:15,
        paddingHorizontal:7,
        height:24,
        borderTopLeftRadius:12,
        borderBottomLeftRadius:12,
        justifyContent:"center",
    },  
    newOutOfStockContainer: {
        position:'absolute',
        backgroundColor:Color.RED,
        left:0,
        top:2,
        paddingHorizontal:7,
        height:24,
        // borderTopLeftRadius:12,
        // borderBottomLeftRadius:12,
        justifyContent:"center",
    },  

    newItemActionContainer: {
        marginVertical: 5,
        paddingHorizontal: 7,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    newBtnAddToCart: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth:1,
        height:30,
        width:'75%',
        borderRadius:5,
        borderColor:Color.PRIMARY,
        paddingHorizontal:5,
    },

    heartContainer: {
        borderWidth:1,
        borderColor:Color.BLACK,
        height:30,
        width:30,
        justifyContent:"center",
        alignItems:'center',
        borderRadius:5
    },
    
});

export default styles;

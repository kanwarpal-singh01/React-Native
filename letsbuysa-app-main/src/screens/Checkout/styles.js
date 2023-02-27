import {StyleSheet} from "react-native";
import {
    Color,
    IS_IOS,
    ThemeUtils,
} from "src/utils";

export default StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: Color.LIGHT_WHITE,
    },

    sectionBlock: {
        padding:15,
        backgroundColor:Color.WHITE,
        marginBottom:10,
    },

    sectionBlockNoMargin: {
        padding:15,
        backgroundColor:Color.WHITE,
    },

    couponCodeContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:8,
    },
    couponInput: {
        flex: 1,
        fontSize: ThemeUtils.fontSmall,
        height:42,
        color: Color.TEXT_DARK,
        borderWidth: 1,
        paddingStart: 10,
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    costTypeContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5
    },

    productItem: { 
        borderWidth:1,
        borderColor:Color.LIGHT_GRAY,
        borderRadius:10,
        marginVertical:5,
    },

    productItemUpperSection: { 
        flexDirection:'row',
        flex:1,
        paddingVertical:10,
        paddingHorizontal:7,
        borderBottomWidth:1,
        borderBottomColor:Color.LIGHT_GRAY 
    },

    productItemLowerSection: { 
        flexDirection:'row',
        padding:10, 
    },

    productItemRemoveBtn: {
        flexDirection:'row',
        alignItems:'center',
    },

    productItemWishlistBtn: {
        flexDirection:'row',
        alignItems:'center',        
        marginLeft:30,
    },

    productItemUpperMiddleSection: { 
        flex:1,
        paddingHorizontal:5,
    },

    productItemNameContainer: { 
        flexDirection:'row',
        alignItems:"center", 
    },

    productItemQuantityContainer: { 
        flex:1,
        justifyContent:"flex-end",
    },

    productItemOffContainer: {
        flex:1,
        alignItems:'flex-end', 
    },

    productItemPriceContainer: { 
        flexDirection:'row',
        alignItems:'center', 
    },

    orderPlacedContainer: { 
        flex:1,
        padding:15,  
    },

    orderPlacedTitleContainer: { 
        alignItems:"center", 
    },

    orderPlacedMainSection: { 
        backgroundColor:"#F3F3F3",
        paddingHorizontal:25,
        paddingVertical:15,
        borderRadius:10,
        marginVertical:20, 
    },

    orderPlacedRow: {
        flexDirection:'row',
        marginVertical:8,
    },

    orderPlacedRowLeftRight: {
        flex:1,
    },
    
    orderPlacedColon:{
        width:40,
        alignItems:'center', 
    },

    appleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        height:60,
        width:ThemeUtils.relativeWidth(100),
       // borderRadius:5,
        backgroundColor:Color.BLACK,
        paddingHorizontal:5,
    }


    // shippingRadio: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     justifyContent: 'flex-start',
    //     marginHorizontal: 5
    // }
});

import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gridContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
    },
    itemContainer: {
        marginVertical: 10,
        width: ThemeUtils.relativeWidth(95) / 2 - 10,
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
    itemImageContainer: {
        borderTopEndRadius: 5,
        borderTopStartRadius: 5,
        overflow: "hidden"
    },
    itemImage: {
        width: ThemeUtils.relativeWidth(95) / 2 - 10,
        aspectRatio: 1
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
    brandImageContainer:{
        height:70,
        width:70,
        borderRadius:35, 
        overflow:'hidden',
        backgroundColor:'white',


    },

    topButtonContainer: {
        zIndex: 5,
        backgroundColor: Color.WHITE,
        flexDirection: 'row',
        height: ThemeUtils.relativeHeight(7),
        elevation: 3,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
    },
    button: {
        backgroundColor: Color.WHITE,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    verticalSeparator: {
        height: '100%',
        width: 0.5,
        backgroundColor: Color.LIGHT_GRAY
    },
    relatedCategoryList: {
        maxHeight: 50,
    },
    relatedCategoryChip: {
        minHeight: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.LIGHT_WHITE,
        borderRadius: 5,
        marginVertical: 5,
        marginHorizontal: 5,
        elevation: 3,
        shadowOpacity: 0.24,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowColor: Color.BLACK,
    },
    subCatItemContainer: {
        marginVertical: 5,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    subCatImageContainer: {
        borderRadius: 5,
        overflow: 'hidden'
    },
    subCatImage: {
        width: ThemeUtils.relativeWidth(75) / 3 - 10,
        aspectRatio: 1
    },
    brandItem: { 
        height:140,
        width:ThemeUtils.relativeWidth(46),
        justifyContent:'center',
        alignItems:"center", 
    },

    brandItemTouchable: {  
        backgroundColor:'white',
        shadowOpacity:1,
        shadowColor:'#00000029',
        shadowOffset:{ width:0, height:3.5 },
        shadowRadius:4,
        alignItems:'center',
        height:90,
        width:90,
        borderRadius:45,
        elevation:3,
    },
    
    brandItemLinearGradient: { 
        height:90,
        width:90,
        borderRadius:45,
        justifyContent:'center',
        alignItems:'center',
    },

    brandItemImage: { 
        height:70,
        width:70,
       // borderRadius:40,
        resizeMode:'contain', 
    },
});

export default styles;

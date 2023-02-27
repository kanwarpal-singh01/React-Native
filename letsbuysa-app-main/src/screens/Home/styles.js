import {StyleSheet,Dimensions} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const {height,width} = Dimensions.get('window');

export default StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Color.WHITE
    },

    container: {
        flex: 1,
        backgroundColor: Color.WHITE,
    },

    bannerItem:{
        flex:1,
        paddingBottom:35, 
    },
    promoView:{
        // flex:1,
        height:height*0.3,
        width:height*0.3,
        backgroundColor:'rgb(200,200,200)',
        borderRadius:10,
        overflow:'hidden',

    },
    promoImage:{
        // flex:1,
        //width:"100%",
        
        height:height*0.3,
        resizeMode:'contain',
        // backgroundColor:'red'
    },
    modelView: {
        flex: 1,
        alignItems:'center',
        justifyContent:'center',
        marginBottom:height*0.3,
        width:'80%',
        overflow:'hidden',
        // height:'40%',
        // marginHorizontal:'20%',
        borderBottomLeftRadius:10,
        borderBottomRightRadius:10,
        alignSelf:'center',
        backgroundColor:'transparent'
      },

      modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#rgba(0, 0, 0, 0.5)',
        zIndex: 1000
      },
        
    bannerImage:{
        flex:1,
        width:"100%",
        resizeMode:'contain'
    },

    secondRowContainer:{
        width:"100%",
        flexDirection:"row",
        padding:15,
        justifyContent:'space-between',
    },

    secondRowTouchable : {
        width:ThemeUtils.relativeWidth(50)-22.5,
        borderRadius:5,
        overflow:'hidden',
    },

    secondRowImage: { 
        flex:1,
        width:"100%",  
    },

    sectionHeader: {
        flexDirection:'row',
        justifyContent:'space-between',
        marginHorizontal:15,
        borderBottomColor:Color.LIGHT_GRAY,
        borderBottomWidth:0.5,
        paddingVertical:10,
    },
    
    brandItem: { 
        height:120,
        width:108,
        justifyContent:'center',
        alignItems:"center", 
    },

    brandItemTouchable: {  
        backgroundColor:'white',
        shadowOpacity:1,
        shadowColor:'#00000029',
        shadowOffset:{ width:0, height:3.5 },
        shadowRadius:4,
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
        resizeMode:'contain',

    },
    brandImageContainer:{
        height:70,
        width:70,
        borderRadius:35, 
        overflow:'hidden',
        backgroundColor:'white',


    },

    fifthRow: { 
        backgroundColor:Color.LIGHT_GRAY,
        flexDirection:'row',
        flexWrap:'wrap',
    },

    tenthRow: { 
        marginHorizontal:15,
        flexDirection:"row",
        flexWrap:'wrap',
        borderRadius:10,
        overflow:'hidden', 
    },
    
    tenthRowItem:{
        width: ThemeUtils.relativeWidth(50)-15,
        height: (ThemeUtils.relativeWidth(50)-15)/2,
        borderWidth:0.4,
        borderColor:'white',
    },

    lastRow: { 
        marginHorizontal:15,
        flexDirection:"row",
        justifyContent:'space-between',
        flexWrap:'wrap',
        // borderRadius:10,
        // overflow:'hidden', 
    },

    lastRowItem:{
        width: ThemeUtils.relativeWidth(33.33)-10,
        height: (ThemeUtils.relativeWidth(33.33)-10),
        borderWidth:0.4,
        borderColor:'white',
        borderRadius:10,
        overflow:'hidden', 
    },
    lastLRowItem:{
        marginHorizontal:15,
        width: ThemeUtils.relativeWidth(100)-30,
        height: (ThemeUtils.relativeWidth(100)-30)/3.36,
        borderWidth:0.4,
        borderColor:'white',
        borderRadius:10,
        overflow:'hidden', 


    }
});

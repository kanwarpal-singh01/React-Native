import {StyleSheet} from 'react-native';
import {Color, ThemeUtils,Constants, UtilityManager} from 'src/utils';

const styles = StyleSheet.create({
  container: {
    flex:1,
    alignItems:'center'

  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent:'center',
    marginTop: ThemeUtils.relativeHeight(10),
    marginHorizontal: 20,
  },
 
  modelContainer: {
   // flex: 1,
   marginBottom:0,
   alignItems:'center',
    paddingVertical: 10,
  },
  modelView: {
    flex: 1,
  },
  input: {
    maxWidth:ThemeUtils.relativeWidth(40),
    // height: ThemeUtils.relativeHeight(10),
    backgroundColor:Color.LIGHT_WHITE,
    fontFamily: Constants.FontStyle.bold,
    fontSize: ThemeUtils.fontXXXXXXLarge,
    paddingHorizontal:5
  },
  selectButtonView: {
      alignSelf:'center',
    alignItems: 'center',
  },
  methodBox:{
      flex:1,
      flexDirection:'row',
      marginHorizontal:10,
      justifyContent:'space-between'
  }
});
export default styles;

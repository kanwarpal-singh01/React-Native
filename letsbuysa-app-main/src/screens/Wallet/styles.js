import {StyleSheet} from 'react-native';
import {Color, ThemeUtils, UtilityManager} from 'src/utils';

const styles = StyleSheet.create({
  container: {
    // minHeight:
    //   ThemeUtils.relativeHeight(70) -
    //   UtilityManager.getInstance().getStatusBarHeight(),
    flex:1

  },
  walletContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    marginHorizontal: 20,
  },
  aTransactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    marginHorizontal: 20,
  },
  walletSubContainer: {},
  walletButtonContainer: {
    alignItems: 'center',
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

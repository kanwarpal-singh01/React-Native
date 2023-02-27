import {StyleSheet} from "react-native";
import {ThemeUtils, UtilityManager} from "src/utils";
import {Color} from 'src/utils'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.LIGHT_WHITE
    },
    addressBox: {
        padding: ThemeUtils.relativeWidth(6.5),
        paddingBottom: 10,
        backgroundColor: Color.WHITE
    },
    addressButtonView: {
        alignItems: 'center',
    },
    tagBoxView: {
        height: 25,
        minWidth: ThemeUtils.relativeWidth(15),
        backgroundColor: Color.PRIMARY,
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        padding: 5,
        marginVertical: 8,
    },
    itemBottomMain: {
        flex: 0.3,
        flexDirection: 'row',
        borderTopWidth: 0.5,
        borderColor: Color.LIGHT_GRAY,
        // marginTop: 15
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
    verifyItemButton: {
        flex: 2,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderEndWidth: 0.5,
        borderEndColor: Color.LIGHT_GRAY,
        backgroundColor: Color.WHITE,
    },
    addressLabel: {
        flex: 1,
    },
    deleteLabel: {
        flex:0.15,
    },
    fullNameText: {
        marginBottom: 20

    },
    buttonContainer:{
        flexDirection:'row',
        marginVertical:10
    },
    mobileContainer:{
        flexDirection:'row',
        justifyContent:'space-between'
    }
})

export default styles;

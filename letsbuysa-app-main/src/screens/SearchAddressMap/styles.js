import {StyleSheet} from "react-native";
import {ThemeUtils, Color} from "src/utils";

export default StyleSheet.create({
    safeAreaView: {
        flex: 1,
        backgroundColor: Color.BG_COLOR,
    },
    mapView: {
        flex: 1,
        justifyContent: 'flex-end'
    },
    locationView: {
        width: ThemeUtils.relativeWidth(100),
        height: 56,
        position: 'absolute',
        top: 0,
        backgroundColor: Color.WHITE,
        alignSelf: 'center',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowOpacity: 0.24,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        borderRadius: 3
    },
    seperator: {
        marginHorizontal: 10,
        height: '100%',
        width: 1,
        backgroundColor: Color.SEPERATOR
    },
    addressLable: {
        flex: 1
    },
    bottomContainer: {
        //position: 'absolute',
        marginVertical:10,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        width: '100%',
        alignItems: 'center'
    },
    buttonTouchIndicator: {
        flex: 1,
        marginLeft: 20,
        elevation: 3,
        shadowOpacity: 0.24,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        borderRadius: 5,
        aspectRatio: 1.2,
        backgroundColor: Color.WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContentView: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent'
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: ThemeUtils.relativeWidth(5)
    },
    markerContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -40,
        marginLeft: -20
    },
    marker: {
        width: 40,
        height: 40
    },
    backBtn: {
        width: 35,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addressContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        borderColor: Color.TEXT_LIGHT,
        borderWidth: 0.5,
        margin: 10
    },
    addressParts: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
    },
    searchBtn: {
        width: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    addressTextBtn: {
        flex: 1,
        marginHorizontal: 5
    },
    modelView:{
       flex:1
        // height: '50%',
        // marginTop: '50%',
    },

    modelSubContainer:{
        // paddingHorizontal:10
    },
    mobileContainer: {
        flex: 1,
        // width: ThemeUtils.relativeWidth(75),
        flexDirection: 'row',
    },
    countryCode: {
        width: ThemeUtils.relativeWidth(30)
    },
    mobileNumber: {
        flex: 1
    },
    modelContainer:{
        flex:1,
        paddingVertical:10
    },
    bottomContainer: {
        width: '100%',
        backgroundColor: Color.LIGHT_WHITE,
        // flexDirection: 'row',
        marginVertical:10,
        alignItems: "center",
        justifyContent: 'center',
        paddingVertical: 10,
    },
    switchView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: ThemeUtils.relativeHeight(2),
        marginBottom: ThemeUtils.relativeHeight(2),
    },
});
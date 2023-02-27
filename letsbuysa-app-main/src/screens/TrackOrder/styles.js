import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.WHITE,
    },
    trackingStepsContainer: {
        paddingVertical: 15,
        backgroundColor: Color.WHITE,
        paddingHorizontal: ThemeUtils.relativeWidth(10),
        justifyContent: 'center'
    },
    blockContainer: {
        flex: 1,
        marginVertical: 10,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    orderIdStatus: {
        flexDirection: 'row',
        marginVertical: 5,
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
    listContainer: {
        flex: 1
    }
});

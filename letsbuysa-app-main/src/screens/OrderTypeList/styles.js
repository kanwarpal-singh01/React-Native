import {StyleSheet} from "react-native";
import {Color} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.LIGHT_WHITE
    },
    orderItemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Color.WHITE,
        paddingHorizontal: 10,
        marginVertical: 5,
    },
    orderStartContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginHorizontal: 10,
        marginVertical: 5
    },
    orderEndContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginVertical: 5
    },
    orderEnd: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10
    }
});
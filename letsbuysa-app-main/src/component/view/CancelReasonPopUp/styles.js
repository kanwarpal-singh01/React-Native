import {StyleSheet} from "react-native";
import {
    CommonStyle,
    Color,
    ThemeUtils
} from "src/utils";
import {Constants, IS_ANDROID} from "../../../utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.DARK_LIGHT_BLACK
    },
    bottomViewContainer: {
        backgroundColor: Color.LIGHT_WHITE,
        width: ThemeUtils.relativeWidth(100),
        borderTopStartRadius: ThemeUtils.relativeWidth(4),
        borderTopEndRadius: ThemeUtils.relativeWidth(4),
        position: 'absolute',
        paddingVertical: 10,
        alignSelf: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        marginHorizontal: ThemeUtils.relativeWidth(10)
    },

    contentContainer: {
        marginHorizontal: ThemeUtils.relativeWidth(7)
    },

    itemContainer: {
        borderRadius: 3,
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 2,
        backgroundColor: Color.WHITE,
        height: ThemeUtils.relativeHeight(45) / 5 - (20),
        justifyContent: 'center',
        marginVertical: 5
    },
    itemMain: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    startContainer: {
        flex: 0.43,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    endContainer: {
        flex: 0.57,
        justifyContent: 'center',
        alignItems: 'flex-start'
    },
    closeBtnContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
        height: 40
    },
    inputContainer: {
        backgroundColor: Color.WHITE,
        borderWidth: 0.5,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 5,
        paddingHorizontal: 10,
        marginHorizontal: 10
    },
    reviewInput: {
        marginVertical: IS_ANDROID ? 0 : 5,
        minHeight: 90,
        maxHeight: 90,
        flexWrap: 'wrap',
        fontFamily: Constants.FontStyle.regular,
        fontSize: ThemeUtils.fontSmall,
        textAlignVertical: 'top'
    },
});
export default styles;
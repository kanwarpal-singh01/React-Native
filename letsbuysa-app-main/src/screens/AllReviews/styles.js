import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.LIGHT_WHITE
    },
    reviewItemContainer: {
        flex: 1,
        backgroundColor: Color.WHITE,
        paddingHorizontal: ThemeUtils.relativeWidth(5)
    },
    reviewDetail: {
        marginVertical: 5,
        justifyContent: 'center',
    },
    reviewInfo: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_WHITE,
        marginVertical: 5
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    reviewImageContainer: {
        borderColor: Color.TEXT_SECONDARY,
        borderWidth: 1,
        borderRadius: 5,
        margin: 3,
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80),
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    reviewImage: {
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80)
    }
});
import {StyleSheet} from "react-native";
import {
    Color,
    ThemeUtils,
    Constants,
    IS_ANDROID
} from "src/utils";

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.WHITE
    },
    imgContainer: {
        width: ThemeUtils.relativeWidth(100),
    },
    image: {
        width: '100%',
        aspectRatio: 414 / 233
    },
    detailsContainer: {
        flex: 1,
        marginHorizontal: ThemeUtils.relativeWidth(5),
    },
    nameContainer: {
        alignItems: 'flex-start',
        marginVertical: 10,
    },
    priceRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    priceContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    discountView: {
        alignItems: 'center',
        minWidth: ThemeUtils.relativeWidth(15),
        borderRadius: 15,
        backgroundColor: Color.ERROR,
        paddingVertical: 5,
        paddingHorizontal: 5,
        marginHorizontal: 5,
    },
    ratingsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    ratingsMain: {
        flex: 1,
    },
    lineSeparator: {
        height: 1,
        backgroundColor: Color.LIGHT_GRAY,
        marginVertical: 5
    },
    inputContainer: {
        backgroundColor: Color.WHITE,
        borderColor: Color.TEXT_LIGHT,
        borderWidth: 0.5,
        borderRadius: 5,
        marginTop: 10,
        marginBottom:5,
        paddingHorizontal: 10
    },
    nameInput: {
        marginVertical: IS_ANDROID ? 0 : 5,
        minHeight: 30,
        maxHeight: 105,
        flexWrap: 'wrap',
        fontFamily: Constants.FontStyle.regular,
        fontSize: ThemeUtils.fontSmall,
    },
    reviewInput: {
        marginVertical: IS_ANDROID ? 0 : 5,
        minHeight: 105,
        maxHeight: 105,
        flexWrap: 'wrap',
        fontFamily: Constants.FontStyle.regular,
        fontSize: ThemeUtils.fontSmall,
        textAlignVertical: 'top'
    },
    reviewImageContainer: {
        borderColor: Color.TEXT_SECONDARY,
        borderWidth: 1,
        borderRadius: 5,
        margin: 3,
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80),
        alignItems: 'center',
        justifyContent: 'center'
    },
    reviewImage: {
        height: ThemeUtils.responsiveHeight(80),
        width: ThemeUtils.responsiveHeight(80)
    },
    closeIcon: {
        position: 'absolute',
        right: 3,
        top: 3,
        backgroundColor: Color.WHITE
    },
    submitBtn: {
        // bottom: 0,
        // left: 0,
        // right: 0,
        marginTop: 15,
        // backgroundColor: Color.PRIMARY,
        // height: ThemeUtils.relativeHeight(8),
        justifyContent: 'center',
        alignItems: 'center'
    }
});
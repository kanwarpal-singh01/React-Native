import {StyleSheet} from "react-native";
import {
    CommonStyle,
    Color,
    ThemeUtils
} from "src/utils";

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Color.DARK_LIGHT_BLACK
    },
    bottomViewContainer: {
        backgroundColor: Color.WHITE,
        width: ThemeUtils.relativeWidth(100),
        borderTopStartRadius: ThemeUtils.relativeWidth(4),
        borderTopEndRadius: ThemeUtils.relativeWidth(4),
        position: 'absolute',
        bottom: 0,
        paddingVertical: 10,
        alignSelf: 'center',
        overflow: 'hidden',
        zIndex: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 5,
        marginHorizontal: 15
    },
    itemContainer: {
        backgroundColor: Color.WHITE,
        height: ThemeUtils.relativeHeight(45) / 6 - (25),
        justifyContent: 'center',
        marginVertical: 10
    },
    itemMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
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
    lineSeparator: {
        height: 0.5,
        backgroundColor: Color.LIGHT_GRAY,
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.DARK_LIGHT_WHITE
    },
    imageScrollContainer: {
        paddingHorizontal: 15,
        marginVertical: 5
    },
    productImage: {
        width: ThemeUtils.relativeWidth(40),
        marginEnd: 10,
    },
    detailsContainer: {
        flex: 1,
        marginHorizontal: ThemeUtils.relativeWidth(5),
    },
    optionTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    colorOption: {
        width: 30,
        height: 30,
        borderWidth: 2,
        borderRadius: 17,
        borderColor: ThemeUtils.IS_PRE_LOLLIPOP ? Color.MAP_CIRCLE_FILL : Color.WHITE,
        marginHorizontal: 5,
        marginVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedOption: {
        borderColor: Color.PRIMARY
    },

    sizeOption: {
        minWidth: 50,
        height: 25,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: Color.TEXT_DARK,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: Color.WHITE,
        alignItems: 'center',
        justifyContent: 'center'
    },

    selectedSizeOption: {
        minWidth: 50,
        height: 25,
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: Color.TEXT_DARK,
        elevation: 3,
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        marginHorizontal: 5,
        marginVertical: 10,
        backgroundColor: Color.TEXT_DARK,
        alignItems: 'center',
        justifyContent: 'center'
    },
    shadowBg: {
        shadowColor: Color.BLACK,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    noStockOption: {
        opacity: 0.5
    }
});
export default styles;

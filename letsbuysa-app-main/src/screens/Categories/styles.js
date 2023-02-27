import {StyleSheet} from "react-native";
import {Color, ThemeUtils} from "src/utils";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
    bannerContainer: {
        marginVertical: 5,
        borderRadius: 5,
        overflow: 'hidden'
    },
    bannerImage: {
        width: '100%',
        aspectRatio: 500 / 170
    },
    gridContainer: {
        marginVertical: 10,
        elevation: 1,
        borderRadius: 5,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 3,
        shadowOffset: {
            width: 0,
            height: 1,
        },
        backgroundColor: Color.WHITE
    },
    subCatItemContainer: {
        marginVertical: 5,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    subCatImageContainer: {
        borderRadius: 5,
        overflow: 'hidden'
    },
    subCatImage: {
        width: ThemeUtils.relativeWidth(60) / 3 - 10,
        aspectRatio: 1
    }
});

export default styles;
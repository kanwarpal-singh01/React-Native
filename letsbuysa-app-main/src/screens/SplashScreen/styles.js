import {StyleSheet} from 'react-native';
import {ThemeUtils} from "src/utils";
import {Color} from "../../utils";


export const styles = StyleSheet.create({
    logo: {
        width: 80,
        height: 80,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: ThemeUtils.relativeWidth(100)
    },
    tagContainer: {
        width: ThemeUtils.relativeWidth(100),
        paddingVertical: 30,
        backgroundColor: Color.PRIMARY
    },
    wmtContainer: {
        width: ThemeUtils.relativeWidth(100),
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 18
    },
    wmtLogo: {
        width: 233,
        height: 31
    }

});
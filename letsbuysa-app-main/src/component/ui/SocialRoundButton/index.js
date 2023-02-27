import React from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity
} from 'react-native';
import {Color} from "src/utils";

// Thired Party
import PropTypes from 'prop-types';

class SocialRoundButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showShadow: true
        }
    }

    render() {

        let btnWholeStyles = [];
        btnWholeStyles.push({
            marginTop: this.props.mt,
            marginBottom: this.props.mb,
            marginLeft: this.props.ml,
            marginRight: this.props.mr,
        });

        return (
            <TouchableOpacity activeOpacity={1}
                              underlayColor={Color.DARK_LIGHT_WHITE}
                              onPressIn={() => this.setState({showShadow: false})}
                              onPressOut={() => this.setState({showShadow: true})}
                              onPress={this.props.onPress}
                              style={[styles.buttonContainer, btnWholeStyles,
                                  this.state.showShadow ? styles.shadowStyle : {}]}>
                <View style={styles.button}>
                    <Image source={
                        this.props.type === 'facebook' ?
                            require('src/assets/images/logo_assets/fb_logo.png')
                            :
                            require('src/assets/images/logo_assets/google_logo.png')
                    }
                           style={styles.image}
                           resizeMode={'contain'}/>
                </View>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: Color.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5,
        borderRadius: 40,
    },
    button: {
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    image: {
        aspectRatio: 1
    },
    shadowStyle: {
        elevation: 3,
        shadowOpacity: 0.24, //0.0015 * elevation + 0.18,
        shadowRadius: 8,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    }
});

SocialRoundButton.defaultProps = {
    ...TouchableOpacity.defaultProps,
    mt: 0,
    mb: 0,
    ml: 0,
    mr: 0,
};

SocialRoundButton.propTypes = {
    ...TouchableOpacity.propTypes,
    mt: PropTypes.number,
    mb: PropTypes.number,
    ml: PropTypes.number,
    mr: PropTypes.number,
};

export default SocialRoundButton;
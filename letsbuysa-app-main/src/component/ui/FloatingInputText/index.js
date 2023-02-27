import React from 'react';
import {View} from 'react-native';

// Thired Party
import IconTextField from '../icon-material-textfield/field'
import PropTypes from 'prop-types';

//Custom component


// Utility
import {
    Color,
    ThemeUtils,
    Constants
} from "src/utils";
import {styles} from "./styles"

class FloatingInputText extends React.Component {

    render() {
        let textColor = this.props.isConstant ? Color.TEXT_DARK :
            this.props.editable === false ? Color.TEXT_LIGHT : Color.BLACK;
        return (
            <View style={this.props.style}>
                <IconTextField
                    fontSize={ThemeUtils.fontNormal}
                    titleFontSize={ThemeUtils.fontSmall}
                    labelFontSize={ThemeUtils.fontSmall}
                    labelTextStyle={{fontFamily: Constants.FontStyle.regular}}
                    titleTextStyle={{fontFamily: Constants.FontStyle.regular}}
                    iconSize={ThemeUtils.fontNormal}
                    tintColor={Color.PRIMARY}
                    style={{fontFamily: Constants.FontStyle.regular}}
                    containerStyle={this.props.style}
                    textColor={textColor}
                    secureTextEntry={this.props.password}
                    {...this.props}>
                    {this.props.children}
                </IconTextField>
            </View>
        );
    }
}

FloatingInputText.defaultProps = {
    icon: "mail",
    autoCapitalize: "none",
    keyboardType: 'default',
    isConstant: false,
    showIcon: true
};

FloatingInputText.propTypes = {
    icon: PropTypes.string,
    autoCapitalize: PropTypes.string,
    keyboardType: PropTypes.string,
    isConstant: PropTypes.bool,
    showIcon: PropTypes.bool,
};

export default FloatingInputText;

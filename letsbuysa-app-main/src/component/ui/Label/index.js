import React from 'react';
import {Text} from 'react-native';
import {Color} from 'src/utils/Color';
//import {fontXSmall, fontSmall, fontNormal, fontLarge, fontXLarge, fontXXLarge} from 'src/utils/theme';
import Theme from "src/utils/ThemeUtils"
import PropTypes from 'prop-types';
import Constants from '../../../utils/Constants';

class Label extends React.Component {
    onClick = () => {
        if (this.props.onPress)
            this.props.onPress();
    };

    render() {
        let stylesArray = [];
        if (this.props.xxlarge)
            stylesArray.push({fontSize: Theme.fontXXLarge});
        else if (this.props.xlarge)
            stylesArray.push({fontSize: Theme.fontXLarge});
        else if (this.props.large)
            stylesArray.push({fontSize: Theme.fontLarge});
        else if (this.props.normal)
            stylesArray.push({fontSize: Theme.fontNormal});
        else if (this.props.small)
            stylesArray.push({fontSize: Theme.fontSmall});
        else if (this.props.xsmall)
            stylesArray.push({fontSize: Theme.fontXSmall});
        else if (this.props.xxsmall)
            stylesArray.push({fontSize: Theme.fontXXSmall});
        else
            stylesArray.push({fontSize: Theme.fontNormal});

        if (this.props.bold)
            stylesArray.push({fontWeight: "500"});
        else if (this.props.bolder)
            stylesArray.push({fontWeight: "bold"});
        else if (this.props.light)
            stylesArray.push({fontWeight: "400"});
        else if (this.props.lighter)
            stylesArray.push({fontWeight: "200"});
        else
            stylesArray.push({fontWeight: "normal"});

        if (this.props.nunito_medium)
            stylesArray.push({fontFamily: Constants.FontStyle.medium});
        else if (this.props.nunito_bold)
            stylesArray.push({fontFamily: Constants.FontStyle.bold});
        else if (this.props.philosopher)
            stylesArray.push({fontFamily: Constants.PhilosopherFont.regular});
        else if(this.props.opensans_semibold) {
            stylesArray.push({fontFamily: Constants.OpenSansFont.semibold});
        } else if(this.props.opensans_bold) {
            stylesArray.push({fontFamily: Constants.OpenSansFont.bold});
        } else if(this.props.opensans_regular) {
            stylesArray.push({fontFamily: Constants.OpenSansFont.regular});
        } else if (this.props.arabic) {
            stylesArray.push({fontFamily: Constants.ArabicFont.regular});
        }  else
            stylesArray.push({fontFamily: Constants.FontStyle.regular});

        stylesArray.push({
            color: this.props.color,
            marginTop: this.props.mt,
            marginBottom: this.props.mb,
            marginStart: this.props.ms,
            marginEnd: this.props.me,
            textAlign: this.props.align,
            includeFontPadding: false
        });
        stylesArray.push(this.props.style);
        let numberOfLines = this.props.singleLine ? 1 : this.props.numberOfLines ? this.props.numberOfLines : null
        
        return (
            <Text numberOfLines={numberOfLines}
            onTextLayout={this.props.onTextLayout}
                  style={stylesArray}
                  onPress={this.props.onPress ? this.onClick : null}>
                {this.props.children}
            </Text>
        );
    }
}

Label.defaultProps = {
    xsmall: false,
    small: false,
    normal: false,
    large: false,
    xlarge: false,
    xxlarge: false,
    bold: false,
    bolder: false,
    lighter: false,
    light: false,
    color: Color.TEXT_PRIMARY,
    nunito_bold: false,
    nunito_medium: false,
    nunito_regular: true,
    opensans_bold: false,
    opensans_regular: false,
    philosopher: false,
    arabic: false,
    align: "left",
    mt: 0,
    mb: 0,
    ms: 0,
    me: 0,
    singleLine: false
};
Label.propTypes = {
    xsmall: PropTypes.bool,
    small: PropTypes.bool,
    normal: PropTypes.bool,
    large: PropTypes.bool,
    xlarge: PropTypes.bool,
    xxlarge: PropTypes.bool,
    bold: PropTypes.bool,
    bolder: PropTypes.bool,
    light: PropTypes.bool,
    lighter: PropTypes.bool,
    color: PropTypes.string,
    nunito_bold: PropTypes.bool,
    nunito_medium: PropTypes.bool,
    nunito_regular: PropTypes.bool,
    opensans_bold: PropTypes.bool,
    opensans_semibold: PropTypes.bool,
    opensans_regular: PropTypes.bool,
    philosopher: PropTypes.bool,
    arabic: PropTypes.bool,
    mt: PropTypes.number,
    mb: PropTypes.number,
    ms: PropTypes.number,
    me: PropTypes.number,
    align: PropTypes.string,
    singleLine: PropTypes.bool
};
export default Label;

import React from 'react';
import {
    View,
    TouchableHighlight,
    Text,
    ViewPropTypes
} from 'react-native';
import Ripple from 'src/component/ui/Ripple';
import {Color, ThemeUtils, Constants} from "src/utils";

import PropTypes from 'prop-types';

class RoundButton extends React.Component {

    onClick = () => {
        if (this.props.click)
            this.props.click();
    };

    render() {
        let btnContainerStylesArray = [];
        let btnTextStylesArray = [];
        if (this.props.btn_xs) {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 12});
            btnTextStylesArray.push({fontSize: ThemeUtils.fontXSmall});
        } else if (this.props.btn_sm) {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 12});
            btnTextStylesArray.push({fontSize: ThemeUtils.fontSmall});
        } else if (this.props.btn_lg) {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 14});
            btnTextStylesArray.push({fontSize: ThemeUtils.fontLarge - 2});
        } else if (this.props.btn_xl) {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 14});
            btnTextStylesArray.push({fontSize: ThemeUtils.fontXLarge - 2});
        } else if (this.props.btnPrimary) {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 12});
            btnTextStylesArray.push({
                fontSize: ThemeUtils.fontLarge,
                fontFamily: Constants.FontStyle.medium
            });
        } else {
            btnContainerStylesArray.push({paddingHorizontal: 20, paddingVertical: 12});
            btnTextStylesArray.push({fontSize: ThemeUtils.fontNormal});
        }
        let btnWholeStyles = [];

        btnWholeStyles.push({
            marginTop: this.props.mt,
            marginBottom: this.props.mb,
            marginStart: this.props.ms,
            marginEnd: this.props.me,
        });

        if (this.props.btnShadow) {
            btnWholeStyles.push({
                elevation: 3,
                shadowOpacity: 0.15,
                shadowRadius: this.props.border_radius,
                shadowOffset: {
                    width: 0,
                    height: 2,
                }
            });
        }

        if (this.props.btn_block) {
            btnWholeStyles.push({
                alignSelf: 'stretch'
            });
        }

        let borderColor = this.props.borderColor ? this.props.borderColor : this.props.backgroundColor;
        btnContainerStylesArray.push({
            backgroundColor: this.props.backgroundColor,
            borderColor: borderColor,
            borderWidth: this.props.borderWidth,
            alignItems: 'center',
            borderRadius: this.props.border_radius,
            minWidth: this.props.width,
        });
        btnTextStylesArray.push({
            color: this.props.textColor,
            fontFamily: Constants.FontStyle.medium
        });

        return (
            <TouchableHighlight style={btnWholeStyles}>
                <View>
                    <Ripple style={[btnContainerStylesArray,this.props.btnContainerStyle]}
                            rippleContainerBorderRadius={this.props.border_radius}
                            onPress={this.onClick}
                            disabled={this.props.disabled}>
                        <Text style={btnTextStylesArray}>
                            {this.props.children}
                        </Text>
                    </Ripple>
                </View>
            </TouchableHighlight>
        );
    }
}


RoundButton.defaultProps = {
    ...TouchableHighlight.defaultProps,
    textColor: Color.WHITE,
    backgroundColor: Color.PRIMARY,
    btn_xs: false,
    btn_sm: false,
    btn_lg: false,
    btn_xl: false,
    btn_block: false,
    btnShadow: false,
    btnPrimary: false,
    border_radius: 30,
    borderWidth: 0,
    mt: 0,
    mb: 0,
    ms: 0,
    me: 0,
    width: ThemeUtils.relativeWidth(30),
    disabled: false
};

RoundButton.propTypes = {
    ...TouchableHighlight.propTypes,
    textColor: PropTypes.string,
    backgroundColor: PropTypes.string,
    borderColor: PropTypes.string,
    btn_xs: PropTypes.bool,
    btn_sm: PropTypes.bool,
    btn_lg: PropTypes.bool,
    btn_xl: PropTypes.bool,
    btn_block: PropTypes.bool,
    btnShadow: PropTypes.bool,
    btnPrimary: PropTypes.bool,
    border_radius: PropTypes.number,
    borderWidth: PropTypes.number,
    mt: PropTypes.number,
    mb: PropTypes.number,
    ms: PropTypes.number,
    me: PropTypes.number,
    width: PropTypes.any,
    disabled: PropTypes.bool,
    btnContainerStyle: ViewPropTypes.style,
};
export default RoundButton;
import React from 'react';
import {View} from 'react-native';
import FloatingInputText from "../FloatingInputText";
import {styles} from "./styles"
import {Color, Icon,ThemeUtils} from 'src/utils';

export default class PasswordInputText extends React.Component {

    changePwdType = () => {
        if (this.state.password) {
            this.setState({
                icEye: 'show',
                password: false
            });
        } else {
            this.setState({
                icEye: 'hide',
                password: true
            });
        }

    };

    constructor(props) {
        super(props);

        this.state = {
            icEye: 'hide',
            password: true
        }
    }

    render() {
        return (
            <View style={{alignSelf: 'stretch'}}>
                <FloatingInputText {...this.props}
                                   password={this.state.password}/>
                <Icon style={styles.icon}
                      name={this.state.icEye}
                      size={ThemeUtils.fontNormal}
                      onPress={this.changePwdType}
                      color={Color.PRIMARY}
                />
            </View>
        );
    }
}


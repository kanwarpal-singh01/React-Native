import React, {Component} from 'react';
import {
    Animated,
    View,
    TouchableOpacity,
    Keyboard,
    Modal,
    I18nManager,
    TextInput,
    InputAccessoryView,
    Button
} from 'react-native';

//Third Party
import {connect} from "react-redux";

//Custom Components
import Label from '../../ui/Label';
import RadioComponent from '../../ui/RadioComponent';
import RoundButton from "../../ui/RoundButton";

//Utils
import {
    Color,
    ThemeUtils,
    Icon, IS_IOS,
    Strings
} from "src/utils";
import styles from "./styles";
import PropTypes from "prop-types";


class CancelReasonPopUp extends Component {


    //utility
    startAnimation = () => {
        Animated.timing(this.animatedY, {
            toValue: 0,
            duration: 300,
        }).start();
    };

    //User interaction
    handleHardwareBack = () => {
        this.closePopUp();
        // BackHandler.removeEventListener("PopUpBack", this.handleHardwareBack);
        return true;
    };


    onClickMenuItem = (item) => {
        switch (item.label) {
        }
    };

    onSelectReason = (index, value) => {
        this.setState({selectedReasonId: value});
    };

    onClickSubmitBtn = () => {
        let selectedOption = this.options.find(option => option.id === this.state.selectedReasonId);
        if (selectedOption.title === this.props.localeStrings.otherReason) {
            this.setState(prevState => ({
                reasonText: prevState.reasonText ? prevState.reasonText.trim() : ""
            }), () => {
                if (this.state.reasonText !== "") {
                    this.props.onSubmit(this.state.selectedReasonId, this.state.reasonText);
                    this.closePopUp();
                } else {
                    this.setState({reasonTextError: this.props.localeStrings.reasonTextBlank})
                }
            });
        } else {
            this.props.onSubmit(this.state.selectedReasonId);
            this.closePopUp();
        }
    };

    //UI methods
    renderRadioOptions = () => {
        return this.options && this.options.length > 0 ? (
            <RadioComponent.RadioGroup
                onSelect={this.onSelectReason}
                color={Color.PRIMARY}>
                {this.options.map((reason, idx) => (
                    <RadioComponent.RadioButton value={reason.id}
                                                key={`${idx}`}
                                                showSeparator>
                        <Label small
                               color={Color.TEXT_DARK}
                               ms={10}>
                            {reason.title}
                        </Label>
                    </RadioComponent.RadioButton>
                ))}
            </RadioComponent.RadioGroup>
        ) : null
    };

    renderListItem = (item, idx) => {
        return (
            <TouchableOpacity activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              style={styles.itemContainer}
                              onPress={() => {
                                  this.onClickMenuItem(item)
                              }}>
                <View style={styles.itemMain}>
                    <View style={styles.startContainer}>
                        <Icon size={18}
                              color={Color.PRIMARY}
                              name={item.icon}
                              style={{marginEnd: 10}}/>
                    </View>
                    <View style={styles.endContainer}>
                        <Label color={Color.TEXT_DARK}
                               ms={10}
                               nunito_bold
                               bolder={IS_IOS}>
                            {item.label}
                        </Label>
                    </View>
                </View>
            </TouchableOpacity>
        )
    };

    //User interaction
    closePopUp = () => {
        Animated.timing(this.animatedY, {
            toValue: ThemeUtils.relativeHeight(100),
            duration: 300,
        }).start(() => {
            this.props.onClosePopUp();
            this.setState({
                selectedReasonId: null,
                reasonText: "",
                reasonTextError: ""
            })
        });

    };

    keyboardWillShow = (event) => {

        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: event.endCoordinates.height,
            }),
        ]).start();
    };

    keyboardWillHide = (event) => {

        Animated.parallel([
            Animated.timing(this.keyboardHeight, {
                duration: event.duration,
                toValue: 0,
            }),
        ]).start();
    };

    //lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            selectedReasonId: null,
            reasonText: "",
            reasonTextError: "",
            enableSubmit: false
        };

        this.animatedY = new Animated.Value(ThemeUtils.relativeHeight(100));
        this.keyboardHeight = new Animated.Value(0);

        this.options = [];
        if (this.props.appConfig && Array.isArray(this.props.appConfig.languages)) {
            let selectedLang = this.props.appConfig.languages.find(lang => lang.language_id === this.props.langCode);
            if (selectedLang && selectedLang.order_cancel_reasone) {
                selectedLang.order_cancel_reasone.map(reason => {
                    this.options.push({
                        id: reason.cancel_reasone_id,
                        title: reason.name
                    })
                });
            }
        }
    }

    componentDidMount() {
        if (IS_IOS) {
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        }
    }

    componentWillUnmount() {
        if (IS_IOS) {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.showPopup !== prevProps.showPopup) {
            if (this.props.showPopup) {
                setTimeout(() => {
                    this.startAnimation();
                }, 0);
            }
        }
    }

    render() {
        let selectedOption =
                Array.isArray(this.options) &&
                this.state.selectedReasonId !== null ?
                    this.options.find(option => option.id === this.state.selectedReasonId) : null,
            inputEnabled = false;
        if (selectedOption && selectedOption.title === this.props.localeStrings.otherReason) {
            inputEnabled = true;
        }

        return (
            <Modal transparent={true}
                   visible={this.props.showPopup}
                   onRequestClose={this.handleHardwareBack}>
                <View style={styles.container}>
                    <Animated.View style={[
                        styles.bottomViewContainer,
                        {
                            bottom: IS_IOS ? this.keyboardHeight : 0,
                            minHeight: ThemeUtils.relativeHeight(45),
                            transform: [{
                                translateY: this.animatedY
                            }]
                        }
                    ]}>
                        <View style={styles.titleContainer}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   large>
                                {this.props.localeStrings.cancellationReason}
                            </Label>
                            <TouchableOpacity activeOpacity={0.7}
                                              underlayColor={Color.TRANSPARENT}
                                              style={styles.closeBtnContainer}
                                              onPress={this.closePopUp}>
                                <Icon name={'cancel'}
                                      size={15}
                                      color={Color.TEXT_LIGHT}/>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.contentContainer}>
                            {this.renderRadioOptions()}
                            <View style={[styles.inputContainer, {
                                borderColor: inputEnabled ? Color.PRIMARY : Color.TEXT_LIGHT,
                            }]}>
                                <TextInput
                                    ref={input => {
                                        this.reasonTextInput = input
                                    }}
                                    style={[styles.reviewInput, {
                                        textAlign: I18nManager.isRTL ? 'right' : 'left'
                                    }]}
                                    editable={inputEnabled}
                                    placeholder={this.props.localeStrings.reasonPlaceholder}
                                    placeholderTextColor={Color.TEXT_LIGHT}
                                    multiline
                                    value={this.state.reasonText}
                                    autoCorrect={false}
                                    inputAccessoryViewID={'reasonTextInputAccessory'}
                                    onFocus={() => {
                                        this.setState({reasonTextError: ""})
                                    }}
                                    onChangeText={(val) => {
                                        this.setState({
                                            reasonText: val
                                        })
                                    }}
                                />
                            </View>
                            {this.state.reasonTextError ?
                                <Label color={Color.ERROR}
                                       xsmall
                                       ms={10}>
                                    {this.state.reasonTextError}
                                </Label> : null
                            }
                        </View>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={this.state.selectedReasonId ?
                                Color.PRIMARY : Color.GRAY}
                            disabled={this.state.selectedReasonId === null || this.state.selectedReasonId === undefined}
                            mt={10}
                            me={ThemeUtils.relativeWidth(10)}
                            ms={ThemeUtils.relativeWidth(10)}
                            mb={10}
                            border_radius={5}
                            btn_sm
                            textColor={Color.WHITE}
                            click={this.onClickSubmitBtn}>
                            {this.props.localeStrings.submit}
                        </RoundButton>
                    </Animated.View>
                </View>
                {
                    IS_IOS && <InputAccessoryView
                        nativeID={'reasonTextInputAccessory'}
                        style={{width: '100%'}}
                        backgroundColor={Color.INPUT_ASSESORY_BG}>
                        <View style={{alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end'}}>
                            <Button
                                style={{textAlign: 'right'}}
                                onPress={() => Keyboard.dismiss()}
                                title={this.props.localeStrings.done}
                            />
                        </View>
                    </InputAccessoryView>
                }
            </Modal>
        )
    }
}

CancelReasonPopUp.defaultProps = {
    showPopup: false,
};

CancelReasonPopUp.propTypes = {
    showPopup: PropTypes.bool.isRequired,
    onClosePopUp: PropTypes.func,
    onSubmit: PropTypes.func,
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        localeStrings: state.localeStrings,
        appConfig: state.appConfig,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps)(CancelReasonPopUp);
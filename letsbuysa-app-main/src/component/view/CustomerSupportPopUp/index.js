import React, {Component} from 'react';
import {
    Animated,
    Linking,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler,
    NativeModules,
    Modal,
    Keyboard
} from 'react-native';

//Third Party
import {connect} from "react-redux";

//Custom Components
import {
    Label,
    FloatingInputText,
    RoundButton
} from 'src/component';

//Utils
import {
    Color,
    ThemeUtils,
    Icon,
    IS_IOS,
    Constants,
    Strings,
    capitalizeLetters,
    validation,
    openLinkInBrowser,
    sendEmail,
    showErrorSnackBar
} from "src/utils";
import styles from "./styles";
import Action from "src/redux/action";

const ZendeskChat = NativeModules.RNZendeskChatModule;

class CustomerSupportPopup extends Component {

    //utility
    startAnimation = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(45),
            duration: 300,
        }).start();
    };

    validateForm = () => {
        console.log('validateForm');
        Keyboard.dismiss();

        let emailError, fullNameError, mobileNoError;
        let isValide = true;

        emailError = validation("email", this.state.email);
        fullNameError = validation("name", this.state.fullName);
        mobileNoError = validation("phoneNo", this.state.mobileNumber);

        if (emailError !== null ||
            fullNameError !== null ||
            mobileNoError !== null) {
            this.setState({
                emailError: emailError,
                fullNameError: fullNameError,
                mobileNumberError: mobileNoError,
            });

            isValide = false;
        } else {
            this.setState({
                emailError: "",
                fullNameError: "",
                mobileNumberError: "",
            });
            isValide = true;
        }

        return isValide;
    };

    //User interaction
    handleHardwareBack = () => {
        this.closePopUp();
        BackHandler.removeEventListener("PopUpBack", this.handleHardwareBack);
        return true;
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

    onClickMenuItem = (item) => {
        switch (item.label) {
            case this.props.localeStrings.liveChat:
                if (this.props.user) {
                    ZendeskChat.startChat({
                        name: this.props.user.full_name,
                        email: this.props.user.email,
                        phone: this.props.user.telephone,
                        tags: [""],
                        department: 'Tech support',
                    });
                } else {
                    this.setState({userInfoPopup: true})
                }
                break;

            case this.props.localeStrings.whatsapp:

                let full_name = '',
                    email = '',
                    telephone = '',
                    whatsAppMessage = `${this.props.localeStrings.troubleMessage}\n${this.props.localeStrings.fullName}: \n${this.props.localeStrings.email}: \n${this.props.localeStrings.mobileNumber}: `;

                if (this.props.user) {
                    full_name = this.props.user.full_name;
                    email = this.props.user.email;
                    telephone = this.props.user.telephone;
                    whatsAppMessage = `${this.props.localeStrings.troubleMessage}\n${this.props.localeStrings.fullName}: ${full_name} \n${this.props.localeStrings.email}: ${email} \n${this.props.localeStrings.mobileNumber}: ${telephone}`;
                }
                openLinkInBrowser(`https://api.whatsapp.com/send?phone=${Constants.letsBuyContactNumber}&text=${whatsAppMessage}`);
                break;

            case this.props.localeStrings.email: {
                let emailMessage = `${this.props.localeStrings.troubleMessage}\n${this.props.localeStrings.fullName} :  \n${this.props.localeStrings.email} : \n${this.props.localeStrings.mobileNumber}: `;
                let emailSubject = `${this.props.localeStrings.troubleSubject}`;

                let full_name = '',
                    email = '',
                    telephone = '';

                if (this.props.user) {
                    full_name = this.props.user.full_name;
                    email = this.props.user.email;
                    telephone = this.props.user.telephone;
                    emailMessage = `${this.props.localeStrings.troubleMessage}\n${this.props.localeStrings.fullName}: ${full_name} \n${this.props.localeStrings.email}: ${email} \n${this.props.localeStrings.mobileNumber}: ${telephone}`;
                }


                sendEmail(
                    [Constants.letsBuyContactEmail],
                    null,
                    null,
                    emailSubject,
                    emailMessage,
                    (success) => {
                    }, (err) => {
                    });
                break;
            }
            case this.props.localeStrings.callUs:
                Linking.canOpenURL(`tel::${Constants.letsBuyContactNumber}`).then(supported => {
                    if (!supported) {
                        showErrorSnackBar(this.props.localeStrings.callingNotSupport);
                    } else {
                        return Linking.openURL(`tel:${Constants.letsBuyContactNumber}`);
                    }
                }).catch(err => console.log('Error Occured ::', err));

                break;
            default:
                break;
        }
    };

    onClickSubmitBtn = () => {
        this.setState(prevState => ({
            email: prevState.email ? prevState.email.trim() : "",
            fullName: prevState.fullName ? prevState.fullName.trim() : "",
            mobileNumber: prevState.mobileNumber ? prevState.mobileNumber.trim() : ""
        }), () => {
            if (this.validateForm()) {
                this.setState({userInfoPopup: false}, () => {
                    ZendeskChat.startChat({
                        name: this.state.fullName,
                        email: this.state.email,
                        phone: this.state.mobileNumber,
                        tags: [""],
                        department: 'Tech support',
                    });
                });
            }
        });
    };

    closePopUp = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(0),
            duration: 300,
        }).start(() => {
            this.props.setShowPopUp(false);
        });

        // this.animatedHeight = new Animated.Value(0);
    };

    //UI methods
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

    renderUserInfoModal = () => {
        return (
            <Modal visible={this.state.userInfoPopup}
                   transparent={true}
                   onRequestClose={() => this.setState({userInfoPopup: false})}>
                <Animated.View style={{
                    flex: 1,
                    backgroundColor: Color.DARK_LIGHT_BLACK,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingBottom: this.keyboardHeight
                }}>
                    <View style={{
                        backgroundColor: Color.WHITE,
                        borderRadius: 10,
                        width: ThemeUtils.relativeWidth(90),
                        minHeight: ThemeUtils.relativeHeight(55),
                        paddingHorizontal: 15
                    }}>
                        <TouchableOpacity activeOpacity={0.7}
                                          underlayColor={Color.TRANSPARENT}
                                          style={[styles.closeBtnContainer, {
                                              alignSelf: 'flex-end',
                                          }]}
                                          onPress={() => this.setState({userInfoPopup: false})}>
                            <Icon name={'cancel'}
                                  size={15}
                                  color={Color.TEXT_LIGHT}/>
                        </TouchableOpacity>
                        <View style={{
                            flex: 1, marginBottom: 10,
                        }}>
                            <FloatingInputText
                                style={{flex: 1}}
                                icon={"account_fill"}
                                autoCapitalize={'words'}
                                value={this.state.fullName}
                                label={this.props.localeStrings.fullName}
                                error={this.state.fullNameError}
                                onFocus={() => {
                                    this.setState({fullNameError: ""})
                                }}
                                onBlur={() => {
                                    if (this.state.fullName) {
                                        this.setState(prevState => ({
                                            fullName: capitalizeLetters(prevState.fullName)
                                        }))
                                    }
                                }}
                                onChangeText={(fullName) => this.setState({fullName})}/>
                            <FloatingInputText
                                style={{flex: 1}}
                                icon={"mail"}
                                autoCapitalize={'none'}
                                label={this.props.localeStrings.email}
                                value={this.state.email}
                                keyboardType={'email-address'}
                                error={this.state.emailError}
                                onFocus={() => {
                                    this.setState({emailError: ""})
                                }}
                                onChangeText={(email) => this.setState({email})}/>
                            <View style={styles.mobileContainer}>
                                <View style={styles.countryCodeContainer}>
                                    <FloatingInputText
                                        icon={"call"}
                                        label={""}
                                        style={styles.countryCode}
                                        isConstant={true}
                                        showFlag={Constants.SA_FLAG_ICON}
                                        editable={false}
                                        value={`+${this.state.countryCode}`}
                                    />
                                </View>
                                <FloatingInputText
                                    keyboardType={'numeric'}
                                    returnKeyType={'done'}
                                    showIcon={false}
                                    style={styles.mobileNumber}
                                    label={this.props.localeStrings.mobileNumber}
                                    placeholder={this.props.localeStrings.mobileNumberPlaceholder}
                                    helpersNumberOfLines={2}
                                    error={this.state.mobileNumberError}
                                    onFocus={() => {
                                        this.setState({mobileNumberError: ""})
                                    }}
                                    onChangeText={(mobileNumber) => this.setState({mobileNumber})}/>
                            </View>
                        </View>
                        <RoundButton
                            width={ThemeUtils.relativeWidth(80)}
                            backgroundColor={Color.PRIMARY}
                            border_radius={5}
                            btnPrimary
                            mt={20}
                            mb={10}
                            textColor={Color.WHITE}
                            click={this.onClickSubmitBtn}>
                            {this.props.localeStrings.submit}
                        </RoundButton>
                    </View>
                </Animated.View>
            </Modal>
        )
    };

    //lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            userInfoPopup: false,
            fullName: "",
            fullNameError: "",
            email: "",
            emailError: "",
            countryCode: Constants.CountryCode,
            mobileNumber: "",
            mobileNumberError: "",
            options: [
                {
                    label: this.props.localeStrings ? this.props.localeStrings.callUs : Strings.callUs,
                    icon: 'call',
                    action: null
                },
                {
                    label: this.props.localeStrings ? this.props.localeStrings.whatsapp : Strings.whatsapp,
                    icon: 'whatsapp',
                    action: null
                },
                {
                    label: this.props.localeStrings ? this.props.localeStrings.feedbackEmail : Strings.feedbackEmail,
                    icon: 'mail',
                    action: null
                }
                ,
                {
                    label: this.props.localeStrings ? this.props.localeStrings.liveChat : Strings.liveChat,
                    icon: 'online_chat',
                    action: null
                }
            ]
        };
        this.keyboardHeight = new Animated.Value(0);
        this.animatedHeight = new Animated.Value(0);
    }

    componentDidMount() {
        if (IS_IOS) {
            this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
            this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("PopUpBack", this.handleHardwareBack);
        if (IS_IOS) {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.showSupportPopUp !== prevProps.showSupportPopUp) {
            if (this.props.showSupportPopUp) {
                setTimeout(() => {
                    BackHandler.addEventListener("PopUpBack", this.handleHardwareBack);
                    this.startAnimation();
                }, 0);
            }
            this.setState({
                options: [
                    // {
                    //     label: this.props.localeStrings ? this.props.localeStrings.callUs : Strings.callUs,
                    //     icon: 'call',
                    //     action: null
                    // },
                    {
                        label: this.props.localeStrings ? this.props.localeStrings.whatsapp : Strings.whatsapp,
                        icon: 'whatsapp',
                        action: null
                    },
                    {
                        label: this.props.localeStrings ? this.props.localeStrings.feedbackEmail : Strings.feedbackEmail,
                        icon: 'mail',
                        action: null
                    }
                    ,
                    {
                        label: this.props.localeStrings ? this.props.localeStrings.liveChat : Strings.liveChat,
                        icon: 'online_chat',
                        action: null
                    }
                ]
            });
        }
    }

    render() {
        return this.props.showSupportPopUp ? (
            <View style={styles.container}>
                {this.renderUserInfoModal()}
                <Animated.View style={[
                    styles.bottomViewContainer,
                    {height: this.animatedHeight}
                ]}>
                    <View style={styles.titleContainer}>
                        <Label color={Color.TEXT_DARK}
                               nunito_bold
                               bolder={IS_IOS}
                               large>
                            {this.props.localeStrings.customerSupportTitle}
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
                    <FlatList
                        contentContainerStyle={{paddingHorizontal: ThemeUtils.relativeWidth(10)}}
                        showsHorizontalScrollIndicator={false}
                        data={this.state.options}
                        keyExtractor={item => `${item.label}`}
                        renderItem={({index, item}) => this.renderListItem(item, index)}
                    />
                </Animated.View>
            </View>
        ) : null
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        setShowPopUp: (showSupportPopUp) => dispatch(Action.setShowPopUp(showSupportPopUp))
    }
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        showSupportPopUp: state.showSupportPopUp,
        localeStrings: state.localeStrings,
        user: state.user
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomerSupportPopup);
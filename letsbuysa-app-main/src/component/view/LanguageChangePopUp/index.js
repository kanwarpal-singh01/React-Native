import React, {Component} from 'react';
import {
    Animated,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler,
    Modal,
    Image
} from 'react-native';

//Third Party
import {connect} from "react-redux";
import PropTypes from "prop-types";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

//Custom Components
import {Label} from 'src/component';

//Utils
import {
    Color,
    ThemeUtils,
    Constants,
    Strings,
    Icon, IS_IOS
} from "src/utils";
import styles from "./styles";

class LanguageChangePopUp extends Component {

    options = [
        {
            label: this.props.localeStrings.englishLabel,
            icon: Constants.EN_FLAG_ICON,
            languageCode: Constants.API_LANGUAGES.EN,
            action: null
        },
        {
            label: this.props.localeStrings.arabicLabel,
            icon: Constants.SA_FLAG_ICON,
            languageCode: Constants.API_LANGUAGES.AR,
            action: null
        },
    ];

    //User interaction
    onSelectLanguage = (item) => {
        this.props.onSelect(item);
        this.closePopUp();
    };

    //utility
    startAnimation = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(35),
            duration: 300,
        }).start();
    };

    handleHardwareBack = () => {
        this.closePopUp();
        return true;
    };


    //UI methods
    renderListItem = (item, idx) => {
        return (
            <TouchableOpacity activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              style={styles.itemContainer}
                              onPress={() => {
                                  this.onSelectLanguage(item);
                              }}>
                <View style={styles.itemMain}>
                    <View style={styles.startContainer}>
                        <Image
                            source={{uri: (item.icon)}}
                            style={{marginEnd: 10, height: 25, width: 40}}/>
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
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(0),
            duration: 300,
        }).start(() => {
            let selectedItem = this.options.find((item) => (item.id === this.state.selectedOptionId));
            this.props.onClosePopUp(selectedItem);
        });
    };

    //lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            selectedOptionId: this.props.selectedOptionId
        };
        this.animatedHeight = new Animated.Value(0);
    }

    componentDidMount() {

    }

    componentWillUnmount() {
        // BackHandler.removeEventListener("SortPopUpBack", this.handleHardwareBack);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.showPopup !== prevProps.showPopup) {
            if (this.props.showPopup) {
                setTimeout(() => {
                    // BackHandler.addEventListener("SortPopUpBack", this.handleHardwareBack);
                    this.startAnimation();
                }, 0);
            }
        }
        if (this.props.selectedOptionId !== prevProps.selectedOptionId) {
            this.setState({
                selectedOptionId: this.props.selectedOptionId
            })
        }
    }

    render() {
        return (
            <Modal transparent={true}
                   visible={this.props.showPopup}
                   onRequestClose={this.handleHardwareBack}>
                <View style={styles.container}>
                    <Animated.View style={[
                        styles.bottomViewContainer,
                        {height: this.animatedHeight}
                    ]}>
                        <View style={styles.titleContainer}>
                            <Label color={Color.TEXT_DARK}
                                   nunito_bold
                                   bolder={IS_IOS}
                                   large>
                                {this.props.localeStrings.selectLanguage}
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
                            data={this.options}
                            keyExtractor={item => `${item.label}`}
                            renderItem={({index, item}) => this.renderListItem(item, index)}
                        />
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}

LanguageChangePopUp.defaultProps = {
    showPopup: false,
    onSelect: null
};

LanguageChangePopUp.propTypes = {
    showPopup: PropTypes.bool.isRequired,
    onClosePopUp: PropTypes.func,
    onSelect: PropTypes.func
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        localeStrings: state.localeStrings,
    }
};

export default connect(mapStateToProps)(LanguageChangePopUp);
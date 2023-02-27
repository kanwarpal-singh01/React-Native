import React, {Component} from 'react';
import {
    Animated,
    View,
    FlatList,
    TouchableOpacity,
    BackHandler,
    Modal,
} from 'react-native';

//Third Party
import {connect} from "react-redux";
import PropTypes from "prop-types";

//Custom Components
import {Label, Hr} from 'src/component';

//Utils
import {
    Color,
    ThemeUtils,
    Constants,
    Icon, IS_IOS,
    Strings
} from "src/utils";
import styles from "./styles";
import Action from "src/redux/action";

class SortPopup extends Component {


    //utility
    startAnimation = () => {
        Animated.timing(this.animatedHeight, {
            toValue: ThemeUtils.relativeHeight(45),
            duration: 300,
        }).start();
    };

    handleHardwareBack = () => {
        this.closePopUp();
        // BackHandler.removeEventListener("SortPopUpBack", this.handleHardwareBack);
        return true;
    };


    //UI methods
    renderListItem = (item, idx) => {
        return (
            <TouchableOpacity activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              style={styles.itemContainer}
                              onPress={() => {
                                  this.setState({selectedOptionId: item.id}, () => {
                                      this.closePopUp();
                                  });
                                  // BackHandler.removeEventListener("SortPopUpBack", this.handleHardwareBack);
                              }}>
                <View style={styles.itemMain}>
                    <Label color={this.state.selectedOptionId === item.id ? Color.PRIMARY : Color.TEXT_DARK}
                           ms={10}>
                        {item.label}
                    </Label>
                    {this.state.selectedOptionId === item.id ?
                        <Icon name={'tick'}
                              size={ThemeUtils.fontNormal}
                              color={Color.PRIMARY}/>
                        : null
                    }
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
            let selectedItem = this.state.options.find((item) => (item.id === this.state.selectedOptionId));
            this.props.onClosePopUp(selectedItem);
        });
    };

    //lifecycle methods
    constructor(props) {
        super(props);

        let options = [];
        let selectedLang = this.props.appConfig.languages.find(language => language.language_id === this.props.langCode);
        if (selectedLang && Array.isArray(selectedLang.sort_filter) && selectedLang.sort_filter.length > 0) {
            options = selectedLang.sort_filter.slice(1, selectedLang.sort_filter.length - 1)
        } else {
            options = Constants.SORT_OPTIONS.slice(1, Constants.SORT_OPTIONS.length - 1) //remove default option
        }

        this.state = {
            selectedOptionId: this.props.selectedOptionId,
            options: options
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
        if (this.props.langCode !== prevProps.langCode) {
            let options = [];
            let selectedLang = this.props.appConfig.languages.find(language => language.language_id === this.props.langCode);
            if (selectedLang && Array.isArray(selectedLang.sort_filter) && selectedLang.sort_filter.length > 0) {
                options = selectedLang.sort_filter.slice(1, selectedLang.sort_filter.length - 1)
            } else {
                options = Constants.SORT_OPTIONS.slice(1, Constants.SORT_OPTIONS.length - 1) //remove default option
            }
            this.setState({options})
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
                                {this.props.localeStrings.sortBy}
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
                            extraData={this.state}
                            keyExtractor={item => `${item.label}`}
                            renderItem={({index, item}) => this.renderListItem(item, index)}
                            ItemSeparatorComponent={() => (<Hr lineStyle={styles.lineSeparator}/>)}
                        />
                    </Animated.View>
                </View>
            </Modal>
        )
    }
}

SortPopup.defaultProps = {
    showPopup: false,
};

SortPopup.propTypes = {
    showPopup: PropTypes.bool.isRequired,
    onClosePopUp: PropTypes.func
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        appConfig: state.appConfig,
        localeStrings: state.localeStrings,
        langCode: state.langCode
    }
};

export default connect(mapStateToProps)(SortPopup);
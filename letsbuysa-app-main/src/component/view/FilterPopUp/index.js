import React, {Component} from 'react';
import {
    Animated,
    View,
    FlatList,
    TouchableOpacity,
    I18nManager,
    Modal,
    ScrollView,
    SafeAreaView
} from 'react-native';

//Third Party
import PropTypes from "prop-types";

//Custom Components
import {Label, Hr, RoundButton} from 'src/component';

//Utils
import {
    Color,
    ThemeUtils,
    Constants,
    Icon, IS_IOS,
    IS_ANDROID,
    UtilityManager, Strings
} from "src/utils";
import styles from "./styles";
import {connect} from "react-redux";

class FilterPopup extends Component {


    //utility
    calculatePadding = () => {
        //padding is required for safe area in X devices
        //Not required in android devices
        let min = 0;
        if (ThemeUtils.isIphoneX()) {
            return min + UtilityManager.getInstance().getStatusBarHeight();
        }

        return IS_ANDROID ? min : min + 10
    };

    startAnimation = () => {
        // let topBarHeight = ThemeUtils.APPBAR_HEIGHT + this.calculatePadding();
        Animated.timing(this.animatedWidth, {
            toValue: ThemeUtils.relativeWidth(0),
            duration: 300,
        }).start();
    };

    //User interaction
    onClickOption = (item) => {
        console.log('for select',item)
        let currentFilters = this.state.selectedFilters.slice();
        let exists = currentFilters.findIndex(selectItem => selectItem === item.id);
        if (exists === -1) {
            currentFilters.push(item.id)
        } else {
            currentFilters = currentFilters.filter(id => id !== item.id)
        }
        console.log(currentFilters);
        this.setState({selectedFilters: currentFilters})
    };

    onClickApplyFilter = () => {
        this.closeAnimation(() => {
            this.props.onApplyPopUp(this.state.selectedFilters)
        });
    };

    onClickClear = () => {
        this.closeAnimation(() => {
            this.props.onClearFilter();
        });
    };

    handleHardwareBack = () => {
        this.closePopUp();
        // BackHandler.removeEventListener("SortPopUpBack", this.handleHardwareBack);
        return true;
    };

    //UI methods
    renderListItem = (item, idx) => {
        let isChecked = this.state.selectedFilters.findIndex(selectItem => selectItem === item.id) !== -1;

        return (
            <TouchableOpacity activeOpacity={0.7}
                              underlayColor={Color.TRANSPARENT}
                              style={styles.itemContainer}
                              onPress={() => {
                                  this.onClickOption(item)
                              }}>
                <View style={styles.itemMain}>
                    <Icon name={isChecked ? 'checkbox_filled' : 'checkbox_normal'}
                          size={ThemeUtils.fontLarge}
                          color={Color.PRIMARY}
                    />
                    <Label color={isChecked ? Color.PRIMARY : Color.TEXT_DARK}
                           ms={10}>
                        {item.name}
                    </Label>
                </View>
            </TouchableOpacity>
        )
    };

    closeAnimation = (callback) => {
        Animated.parallel([
            Animated.timing(this.animatedWidth, {
                toValue: I18nManager.isRTL ? -ThemeUtils.relativeWidth(100) : ThemeUtils.relativeWidth(100),
                duration: 300,
            })
        ]).start(() => {
            callback();
        });
    };

    //User interaction
    closePopUp = () => {
        this.closeAnimation(() => this.props.onClosePopUp());
    };

    //lifecycle methods
    constructor(props) {
        super(props);
        this.state = {
            selectedFilters: this.props.selectedFilters,
            availableFilters: this.props.availableFilters
        };
        this.animatedWidth = new Animated.Value(I18nManager.isRTL ? -ThemeUtils.relativeWidth(100) : ThemeUtils.relativeWidth(100));
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
                    this.startAnimation();
                }, 0);
            }
        }
        if (this.props.selectedFilters !== prevProps.selectedFilters ||
            this.props.availableFilters !== prevProps.availableFilters) {
            console.log(this.props.selectedFilters);
            console.log(this.props.availableFilters);

            this.setState({
                selectedFilters: this.props.selectedFilters,
                availableFilters: this.props.availableFilters
            })
        }
    }

    render() {
        return (
            <Modal transparent={true}
                   visible={this.props.showPopup}
                   onRequestClose={this.handleHardwareBack}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.container}>
                        <Animated.View style={[
                            styles.bottomViewContainer, {
                                width: ThemeUtils.relativeWidth(75),
                                transform: [{
                                    translateX: this.animatedWidth
                                }]
                            }
                        ]}>
                            <View style={styles.titleContainer}>
                                <TouchableOpacity activeOpacity={0.7}
                                                  underlayColor={Color.TRANSPARENT}
                                                  style={styles.closeBtnContainer}
                                                  onPress={this.closePopUp}>
                                    <Icon name={'cancel'}
                                          size={15}
                                          color={Color.TEXT_LIGHT}/>
                                </TouchableOpacity>
                                <View style={styles.filterContainer}>
                                    <Label
                                        color={Color.TEXT_DARK}
                                        nunito_bold
                                        bolder={IS_IOS}
                                        large>
                                        {this.props.localeStrings.filterBy}
                                    </Label>
                                </View>
                            </View>
                            <ScrollView style={{flex: 1}}>
                                {Array.isArray(this.state.availableFilters) &&
                                this.state.availableFilters.length > 0 &&
                                this.state.availableFilters.map((filter_group) =>
                                    <View key={filter_group.filter_group_id}
                                          style={{paddingHorizontal: ThemeUtils.relativeWidth(10)}}>
                                        <Label color={Color.TEXT_DARK}
                                               nunito_medium
                                               mb={5}>
                                            {filter_group.name}
                                        </Label>
                                        <FlatList
                                            showsHorizontalScrollIndicator={false}
                                            data={filter_group.filter}
                                            extraData={this.state}
                                            keyExtractor={item => `${item.id}`}
                                            renderItem={({index, item}) => this.renderListItem(item, index)}
                                            ItemSeparatorComponent={() => (<Hr lineStyle={styles.lineSeparator}/>)}
                                        />
                                    </View>
                                )}
                            </ScrollView>
                            <View style={styles.applyContainer}>
                                <View style={styles.bottomButton}>
                                    <RoundButton
                                        width={ThemeUtils.relativeWidth(30)}
                                        backgroundColor={Color.PRIMARY}
                                        border_radius={5}
                                        btnPrimary
                                        textColor={Color.WHITE}
                                        click={this.onClickApplyFilter}>
                                        {this.props.localeStrings.apply}
                                    </RoundButton>
                                </View>
                                <TouchableOpacity style={[styles.bottomButton]}
                                                  activeOpacity={0.7}
                                                  underlayColor={Color.TRANSPARENT}
                                                  onPress={() => this.onClickClear()}>
                                    <Icon name={"delete"}
                                          size={ThemeUtils.fontXSmall}
                                          color={Color.TEXT_DARK}/>
                                    <Label color={Color.TEXT_DARK}
                                           xsmall
                                           ms={10}>
                                        {this.props.localeStrings.clear}
                                    </Label>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </SafeAreaView>
            </Modal>
        )
    }
}

FilterPopup.defaultProps = {
    showPopup: false,
};

FilterPopup.propTypes = {
    showPopup: PropTypes.bool.isRequired,
    onClosePopUp: PropTypes.func,
    onClearFilter: PropTypes.func,
    onApplyPopUp: PropTypes.func,
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        localeStrings: state.localeStrings,
    }
};

export default connect(mapStateToProps)(FilterPopup);
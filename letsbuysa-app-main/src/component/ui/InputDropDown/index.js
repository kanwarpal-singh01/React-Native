import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FlatList, Platform, StyleSheet, TextInput, View, ViewPropTypes as RNViewPropTypes} from 'react-native';
import Label from 'src/component/ui/Label';
import {Color} from 'src/utils/Color';

const ViewPropTypes = RNViewPropTypes;

class Index extends Component {
    static propTypes = {
        ...TextInput.propTypes,

        containerStyle: ViewPropTypes.style,

        data: PropTypes.array,

        hideResults: PropTypes.bool,

        inputContainerStyle: ViewPropTypes.style,

        keyboardShouldPersistTaps: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool
        ]),

        listContainerStyle: ViewPropTypes.style,

        listStyle: ViewPropTypes.style,

        onShowResults: PropTypes.func,

        onStartShouldSetResponderCapture: PropTypes.func,

        renderItem: PropTypes.func,

        renderTextInput: PropTypes.object,

        rowHasChanged: PropTypes.func,

        getComponentRef: PropTypes.func
    };

    static defaultProps = {
        data: [],
        defaultValue: '',
        keyboardShouldPersistTaps: 'always',
        onStartShouldSetResponderCapture: () => false,
        renderTextInput: props => <TextInput {...props} />,
        rowHasChanged: (r1, r2) => r1 !== r2,
        getComponentRef: () => null

    };

    constructor(props) {
        super(props);

        this.state = {
            items: props.items
        };
        this.resultList = null;
    }

    componentWillReceiveProps({items}) {
        this.setState({items});
    }


    blur() {
        const {textInput} = this;
        textInput && textInput.blur();
    }


    focus() {
        const {textInput} = this;
        textInput && textInput.focus();
    }

    _renderListItem = (item) => {
        if (this.props.renderItem) {
            return this.props.renderItem(item)
        } else {
            return <Label>{item}</Label>;
        }
    };


    renderResultList() {
        const {items} = this.state;
        const {
            listStyle,
            keyboardShouldPersistTaps,
            onEndReached,
            onEndReachedThreshold
        } = this.props;

        return (
            <FlatList
                ref={(resultList) => {
                    this.resultList = resultList;
                }}
                data={items}
                keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                renderItem={({item}) => this._renderListItem(item)}
                ItemSeparatorComponent={() => <View
                    style={{height: 0.5, backgroundColor: Color.WHITE, marginHorizontal: 10}}/>}
                onEndReached={onEndReached}
                onEndReachedThreshold={onEndReachedThreshold}
                style={[styles.list, listStyle, {height: items.length > 4 ? 150 : null}]}
                keyExtractor={item => item.name}
            />
        );
    }

    renderTextInput() {
        const {onEndEditing, renderTextInput, style} = this.props;
        const props = {
            ref: ref => (this.textInput = ref),
            onEndEditing: e => onEndEditing && onEndEditing(e),
        };

        return React.cloneElement(renderTextInput, {
            ...props
        });
    }

    render() {
        const {items} = this.state;
        const {
            containerStyle,
            hideResults,
            inputContainerStyle,
            listContainerStyle,
            onShowResults,
        } = this.props;
        const showResults = items.length > 0;

        // Notify listener if the suggestion will be shown.
        onShowResults && onShowResults(showResults);

        return (
            <View style={[containerStyle]}
                  ref={ref => this.props.getComponentRef(ref)}>
                <View style={[styles.inputContainer, inputContainerStyle]}>
                    {this.renderTextInput()}
                </View>
                {!hideResults && (
                    <View
                        style={[styles.listContainer, listContainerStyle]}

                    >
                        {showResults && this.renderResultList()}
                    </View>
                )}
            </View>
        );
    }
}

/* */

const androidStyles = {
    container: {
        flex: 1
    },
    inputContainer: {
        // ...border,
        marginBottom: 0
    },
    list: {
        // ...border,
        backgroundColor: Color.WHITE,
        borderTopWidth: 0,

        left: 0,
        position: 'absolute',
        right: 0,
        elevation: 7,
        zIndex: 20
    },
    listContainer: {}
};

const iosStyles = {
    container: {
        zIndex: 99
    },
    inputContainer: {
        // ...border
    },
    input: {
        backgroundColor: 'white',
        height: 40,
        paddingLeft: 3
    },
    list: {
        // ...border,
        backgroundColor: Color.WHITE,
        borderTopWidth: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        zIndex: 10,
    },
    listContainer: {
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    }
};

const styles = StyleSheet.create({
    input: {
        backgroundColor: 'white',
        height: 40,
        paddingLeft: 3
    },
    ...Platform.select({
        android: {...androidStyles},
        ios: {...iosStyles}
    })
});

export default Index;

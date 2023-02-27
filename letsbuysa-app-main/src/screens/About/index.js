import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    I18nManager,
} from 'react-native';

//Third party
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import Spinner from "react-native-loading-spinner-overlay";

//Utility
import styles from './styles'
import {CustomNavigationHeader, Hr, Label} from "src/component";
import {Color, CommonStyle, Constants, Icon, Strings} from 'src/utils'
import Routes from "src/router/routes";
import {
    API_GET_ABOUT_INFO,
    APIRequest,
    ApiURL
} from "src/api";


class About extends Component {


    getAboutInformation = () => {
        this.setState({isLoaderVisible: true});
        new APIRequest.Builder()
            .get()
            .setReqId(API_GET_ABOUT_INFO)
            .reqURL(ApiURL.getAboutInfo)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest();
    };

    onResponse = (response, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ABOUT_INFO:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data) {
                            const keys=Object.keys(response.data.information)
                            const parsedData = keys.map((item)=>{
                                return{title:item,description:response.data.information[item]}
                            })
                            this.setState({routes: parsedData})
                            // console.log("Response of about",response.data.information)
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({isLoaderVisible: false});
        switch (reqId) {
            case API_GET_ABOUT_INFO:
                if (error.meta && error.meta.message) {
                    console.log(error, "Error show in onError")
                    // this.setState({addresses: []})
                }
                break;
        }
    };

    //user Interaction
    onClickMenuItem = (item) => {
        this.props.navigation.navigate(Routes.WebsiteView, {title: item.title, description: item.description})
    };


    //UI Methods
    renderMenuItem = (item, idx) => {
        console.log('item is...',item)
        return (
            <TouchableOpacity key={idx.toString()}
                              activeOpacity={0.8}
                              underlayColor={Color.TRANSPARENT}
                              onPress={() => {
                                  this.onClickMenuItem(item)
                              }}>
                <View style={styles.menuItem}
                      key={item.label}>
                    <Icon name={'about_app'}
                          color={Color.PRIMARY}
                          size={20}
                          me={20}
                          ms={5}/>
                    <Label color={Color.TEXT_DARK}
                           ms={15}
                           me={10}
                           style={{flex: 1}}>
                        {item.title}
                    </Label>
                    <Icon name={"arrow"}
                          color={Color.DARK_LIGHT_BLACK}
                          style={I18nManager.isRTL ? {transform: [{rotateY: '180deg'}]} : null}
                          size={20}
                          me={10}
                          ms={10}/>
                </View>
                {idx !== this.state.routes.length - 1 &&
                <Hr lineStyle={{backgroundColor: Color.DARK_LIGHT_BLACK}}/>
                }
            </TouchableOpacity>
        )
    };

    //Lifecyle Methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        return {
            title: "navAboutApp", //title key is added to support fallback to local strings
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            routes: [],
            isLoaderVisible: false
        }
    }

    componentDidMount() {
        this.getAboutInformation();

    }


    render() {
        return (
            <View style={[CommonStyle.safeArea,]}>
                <Spinner visible={this.state.isLoaderVisible}/>
                <KeyboardAwareScrollView
                    bounces={false}
                    keyboardVerticalOffset={0}
                    scrollEnabled={true}
                    enableOnAndroid={false}
                    keyboardShouldPersistTaps="always"
                    enabled
                    showsVerticalScrollIndicator={false}>
                    <View style={styles.container}>
                        <View style={styles.menuContainer}>
                            {this.state.routes.length > 0 ?
                                this.state.routes.map((item, index) => {
                                    return this.renderMenuItem(item, index)
                                })
                                : null
                            }
                        </View>
                    </View>
                </KeyboardAwareScrollView>
            </View>
        )
    }
}

export default About;
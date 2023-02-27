import React, {Component} from 'react';
import {CustomNavigationHeader} from "src/component";

//Third Party
import { WebView } from 'react-native-webview';

class WebsiteView extends Component {

    //User Interaction
    onShouldStartLoadWithRequest = (navigator) => {
        const description = this.props.navigation.getParam('description')
        console.log('endPoint',description)
        if (navigator.url.indexOf(description) === -1) {

            return false;
        } else {
            return true;
        }
    }

    //LifeCycle Methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        const title = navigation.getParam('title')
        const description = navigation.getParam('description')
        console.log('endPoint',description)

        return {
            title: title.replace(/&amp;/g, '&'),
            header: (props) => <CustomNavigationHeader {...props}
                                                       isMainTitle={false}
                                                       showLeftButton={true}
                                                       showRightButton={false}/>
        }
    };

    constructor(props) {
        super(props);
    }

    render() {
        const endpoint = this.props.navigation.getParam('description')
        return (
            <WebView
                ref={c => {
                    this.WebView = c;
                }}
                // source={{html: `<html><meta name="viewport" content="width=device-width, initial-scale=1.0">${endpoint}</html>`}}
                
                 source={{uri: endpoint}}

                style={{marginTop: 20}}
            />
        );
    }
}

export default WebsiteView;
import React from 'react';
import {
  View,
  TouchableHighlight,
  Modal,
  TouchableOpacity,
  Text,
} from 'react-native';
import PropTypes from 'prop-types';

//Custom Components
import WebView from 'react-native-webview';

//Utility
import {
  Color,
  ThemeUtils,
  Icon,
  Constants,
  UtilityManager,
  IS_ANDROID,
} from 'src/utils';

const redirectURL = 'com.fareapp.surge';

class PaymentWebView extends React.Component {
  //utility
  _onNavigationStateChange = webViewState => {
    console.log('data====>>>', webViewState);
    // set your filters based on the current url (of the navigation) to keep the user inside auth flow,
    // or for unwanted urls in reverse way. You can create your filters by using
    // console.log(webViewState)
    // and check the touched urls during navigation events take place.

    // You can even specify which url's are safe, like forgot password features!

    // if (webViewState.url.indexOf(`${Constants.API_CONFIG.BASE_URL}${Constants.API_CONFIG.BASE_ROUTE}`) !== -1 && webViewState.title == '') {
    //     let searchTerm = 'tap_id=';
    //     let i = webViewState.url.indexOf(searchTerm);
    //     let id = webViewState.url.substr(i + searchTerm.length, webViewState.url.length);
    //     console.log('id', id);
    //     this.webview.stopLoading();
    //     this.closeModal(id);
    // }
    let data = webViewState.url.split('/');
    let status = data.length - 1;
    let id = data.length - 2;
    let isSuccess = data.length - 3;

    if (data[isSuccess] == 'success') {
      if (data[status] == '1') {
        this.webview.stopLoading();
        this.closeModal(data[id]);
      } else {
        console.log('=======>>>here');
        this.webview.stopLoading();
        this.closeModal('');
      }
    }

    // When the user touches a link on the social media app's login page
    // that could navigate to an unwanted url (ex: clicks on actual social media app's login link on our
    // registered app's login page while the only thing we want is to make them login "over" our app)
  };

  onMessage = event => {
    const data = event.nativeEvent.data;
    //nativeEvent returns string "undefined". Not an error
    console.log('native data', data);
  };

  closeModal = (id = '') => {
    console.log(id);
    this.setState({
      modalVisible: false,
    });
    this.props.onClose(id);
  };

  //UI methods
  calculatePadding = () => {
    //padding is required for safe area in X devices
    //Not required in android devices

    let min = 0;
    if (ThemeUtils.isIphoneX()) {
      return min + UtilityManager.getInstance().getStatusBarHeight();
    } else {
      if (IS_ANDROID) {
        return min;
      } else {
        return min + 10;
      }
    }
  };

  //lifecycle
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: this.props.isOpen,
    };

    this.handleLinkJS = `
  (function () {
    window.onclick = function(e) {
      window.postMessage(e.target.href);
    }
  }());`;
  }

  //set state only if prop changes
  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.modalVisible !== nextProps.isOpen) {
      return {modalVisible: nextProps.isOpen};
    }
    return null;
  }

  /*<Modal animationType="fade"
                   transparent={true}
                   visible={this.state.modalVisible}
                   onRequestClose={this.closeModal}>
                   </Modal>*/

  render() {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => this.closeModal()}>
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0, 00.65)',
            padding: 20,
          }}
        />
        <View
          style={{
            height: '69%',
            marginTop: 'auto',
            // backgroundColor: 'blue',
          }}>
          <View style={{flex: 1,backgroundColor:'white'}}>
            <View
              style={{
                flex: 0.1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}>
              <TouchableOpacity
                activeOpacity={0.7}
                underlayColor={Color.TRANSPARENT}
                style={{
                  height: 40,
                  width: 40,
                  justifyContent: 'center',
                  alignSelf: 'center',
                }}
                onPress={() => this.closeModal()}>
                <Icon name={'cancel'} size={15} color={Color.TEXT_LIGHT} />
              </TouchableOpacity>
            </View>
            <View style={{flex:0.9}}>
              <WebView
                ref={ref => (this.webview = ref)}
                style={{flex: 1}}
                source={{uri: this.props.href}}
                onNavigationStateChange={this._onNavigationStateChange}
                javaScriptEnabled={true}
                startInLoadingState={false}
                // scrollEnabled={false}
              />
            </View>
          </View>
        </View>
        {/* <View style={{maxHeight:'70%', marginTop:'50%', backgroundColor: 'transparent',}}>
                    <View style={{
                        flex:1,
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        marginHorizontal: 15,
                        // minHeight: ThemeUtils.APPBAR_HEIGHT,
                        // paddingTop: this.calculatePadding()
                    }}>
                        <TouchableOpacity activeOpacity={0.7}
                                          underlayColor={Color.TRANSPARENT}
                                          style={{
                                              height: 40,
                                              width: 40,
                                              justifyContent: 'center',
                                              alignSelf: 'center',
                                          }}
                                          onPress={() => this.closeModal()}>
                            <Icon name={'cancel'}
                                  size={15}
                                  color={Color.TEXT_LIGHT}/>
                        </TouchableOpacity>
                    </View>
                    <WebView
                        ref={ref => this.webview = ref}
                        style={{flex: 1}}
                        source={{uri: this.props.href}}
                        onNavigationStateChange={this._onNavigationStateChange}
                        javaScriptEnabled={true}
                        startInLoadingState={false}
                        scrollEnabled={false}
                    />
                </View> */}
      </Modal>
    );
  }
}

PaymentWebView.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  href: PropTypes.string,
};

PaymentWebView.defaultProps = {
  isOpen: false,
  message: 'Message',
  onClose: () => {
    console.log('Close Pressed');
  },
};

export default PaymentWebView;

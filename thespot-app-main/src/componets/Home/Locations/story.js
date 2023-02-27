import React, { Component } from 'react';
import ImagePicker from 'react-native-image-picker';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from "react-native-video";
import ActionSheet from 'react-native-actionsheet'

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    Platform
} from 'react-native';

import { translate } from '../../../helper/translationHelper';


export default class Story extends Component {
    constructor(props) {
        console.log("------story component")
        super(props);
        this.state = {
            fileUri: "",
            renderImage: '',
            loading: false,
            userID: '',
            vedioURL: '',
            storyStatus: 1,
            storySaveStatus: false,
            video: null
        }
    }

    async componentDidMount() {
        let { storyData } = this.props.route.params
        console.log('asdas', await AsyncStorage.getItem('story_save_status'))
        
        if (storyData == null) {
            this.chooseImage(await AsyncStorage.getItem('story_save_status'))
        }
        this.setState({ userID: await AsyncStorage.getItem('userID'),story_save_status: await AsyncStorage.getItem('story_save_status') }, () => {
            console.log(this.state.userID)
            this.onStoryDetails()
        })
        this._unsubscribe = this.props.navigation.addListener('focus', async () => {
            this.onStoryDetails()
        });
    }

    componentWillUnmount() {
        this._unsubscribe()
    }

    showActionSheet = () => {
        this.ActionSheet.show()
    }

    chooseImage = (storySaveStatus) => {
     
         storySaveStatus = storySaveStatus == 1 ? true :false;
         console.log("hhhhhhhhhhhhhh---->>><>",storySaveStatus)
        let options = {
            title: 'Select Image',
            mediaType: 'mixed',
            maxWidth: 2000,
            maxHeight: 2000,
            durationLimit: 10,
            videoQuality: 'medium',
            storageOptions: {
                skipBackup: true,
                path: 'images',
                cameraRoll: storySaveStatus
            },
        };

        if (Platform.OS == 'android') {
            this.showActionSheet();
        } else {
            this.openCamera(options);
        }

    }

    onActionSheetPress(index) {
        let options = {
            title: 'Select Image',
            mediaType: 'mixed',
            maxWidth: 2000,
            maxHeight: 2000,
            durationLimit: 10,
            videoQuality: 'medium',
            storageOptions: {
                skipBackup: true,
                path: 'images',
                cameraRoll: this.state.storySaveStatus
            },
        };

        if (index == 0) {
            options.mediaType = "photo"
            this.openCamera(options);
        } else if (index == 1) {
            options.mediaType = "video"
            this.openCamera(options);
        } else {
           this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                });
        }
        console.log("Action Pressed   ->", index);
    }

    openCamera(options) {
        ImagePicker.launchCamera(options, (response) => {
            if (response.didCancel) {
               this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                })
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                let ext;
                if (Platform.OS == 'android') {
                    ext = response.path.split('.').pop();
                } else {
                    ext = response.uri.split('.').pop();
                }

                this.setState({ video: response });

                // const source = { uri: response.uri };
                if (ext == 'MOV' || ext == "mp4" || ext == "mov" || !response.uri.includes(".")) { // vedio call
                    console.log(response.uri)
                    this.setState({ vedioURL: Platform.OS == "android" ? response.path : response.uri, fileUri: '', renderImage: '' })
                } else { // camera call
                    this.setState({
                        fileUri: Platform.OS === 'android' ? response.path : response.uri,
                        renderImage: response.uri, vedioURL: '',
                    })
                }
            }
        });
    }

    onStoryDetails() {
        this.setState({ loading: true })
        let body = { user_id: this.state.userID, story_user_id: this.state.userID }
        console.log("kya ja rha h---------------------------->",body)
        axios
            .post(apiUrl + 'stories-detail', body)
            .then((response) => {
                console.log(response.data)
                this.setState({ loading: false })
                // Toast.show(response.data.message)
                if (response.data.status == 1) {
                    console.log(response.data.story_save_status,"coming")
                    if (response.data.data.story.split('.').pop() == 'MOV') {
                        this.setState({ vedioURL: response.data.url + response.data.data.story })
                    } else {
                        console.log('asdasd')
                        this.setState({ renderImage: response.data.url + response.data.data.story })
                    }
                    this.setState({ storyStatus: response.data.story_status, storySaveStatus: response.data.story_save_status == 0 ? false : true })
                    console.log('hello state', response.data.story_status, response.data.story_save_status)
                }else{
                    this.setState({ storyStatus: response.data.story_status, storySaveStatus: response.data.story_save_status == 0 ? false : true })
                }
            })
            .catch((erroraa) => {
                this.setState({ loading: false })
                if (erroraa.toJSON().message === 'Network Error') {
                    Toast.show(translate('Please check your internet connection'))
                }
            });
    }

    onImageUpload = () => {
        if (this.state.fileUri != '' || this.state.vedioURL != '') {
            this.setState({ loading: true })
            const formData = new FormData();
            formData.append('user_id', this.state.userID);
            formData.append('access_status', this.state.storyStatus) // 1 = everyone, 2 => only chat
            formData.append('description', 'new upload')
            console.log(formData,"hiiiiiiiiiiiiiiiiiiiiiii------>")
            console.log({
                uri: this.state.vedioURL,
                type: 'MOV',
                name: this.state.vedioURL.split('/').pop()
            })

            console.log("how do yououjo000--->", this.state.video);

            if (this.state.vedioURL != '') {
                if (Platform.OS === 'android') {
                    formData.append('story', {
                        uri: this.state.video.uri,
                        type: 'video/mp4',
                        name: this.state.vedioURL.split('/').pop(),
                        size: 123423
                    })
                } else {
                    formData.append('story', {
                        uri: this.state.vedioURL,
                        type: 'MOV',
                        name: this.state.vedioURL.split('/').pop()
                    })
                }
            } else {
                formData.append('story', {
                    uri: Platform.OS === 'android' ? "file://" + this.state.fileUri : this.state.fileUri,
                    type: 'image/jpeg',
                    name: this.state.fileUri.split('/').pop(),
                });
            }

            axios({
                url: apiUrl + 'upload-status',
                method: 'POST',
                data: formData,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    this.setState({ loading: false })
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        // this.props.navigation.navigate('LocationAccess')
                        this.props.navigation.navigate("StoryWithViewButton");
                    }else{
                        Toast.show(response.data.message)
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    console.log("Story Upload Error ---->", erroraa);
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
           this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                })
        }
    }

    render() {

        return (
            <>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={translate('What type of story do you want to upload')}
                    options={[translate('Take Photo'), translate('Take Video'), translate('Cancel')]}
                    cancelButtonIndex={2}
                    destructiveButtonIndex={1}
                    onPress={(index) => this.onActionSheetPress(index)}
                />

                {this.state.loading && <Spinner />}
                <ImageBackground style={{ flex: 1, width: null, height: null,}}>
                    <SafeAreaView style={{ flexGrow: 0, backgroundColor: 'white' }} />
                    <View style={{ justifyContent: 'space-between', flexDirection: 'row', flexShrink: 1, marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Location' }],
                })}>
                            <Image source={require('../../../assets/chat/backGray.png')} style={{ height: 24, width: 24 }} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Your Story")}</Text>
                        <TouchableOpacity onPress={() => this.onImageUpload()}>
                            <Text style={{ fontSize: 12, fontFamily: 'Montserrat-Bold', color: '#FF5000', marginRight: 8 }}>{this.state.renderImage == '' && this.state.vedioURL == '' ? translate('Close') : translate('Post')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 16 }}>
                        {this.state.vedioURL != '' &&
                            <Video
                                source={{ uri: this.state.vedioURL }}
                                style={{ flex: 1, borderRadius: 16, overflow: 'hidden'}}
                                muted={true}
                                repeat={true}
                                volume={4}
                                resizeMode={"cover"}
                                rate={1.0}
                                ignoreSilentSwitch={"obey"}
                            />}
                        {this.state.vedioURL == '' &&
                            <ImageBackground source={this.state.renderImage == '' ? '' : { uri: this.state.renderImage }} style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                            </ImageBackground>}
                        <View style={{ height: 60, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', position: 'absolute', bottom: 0, width: "100%" }}>
                            <TouchableOpacity>
                                <Image style={{ width: 36, height: 36, marginLeft: 16 }} />
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => this.chooseImage()}>
                                <View style={{height: 38, width: 38, borderRadius: 19, backgroundColor: 'white'}}></View>
                            </TouchableOpacity> */}
                            <View style={{ height: 38, width: 38, borderRadius: 19 }}></View>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('StorySettings', { storyStatuss: this.state.storyStatus, storySveStatuss: this.state.storySaveStatus })}>
                                <Image source={require('../../../assets/locations/setting.png')} style={{ width: 24, height: 24, marginRight: 16 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </>
        )

    }
}


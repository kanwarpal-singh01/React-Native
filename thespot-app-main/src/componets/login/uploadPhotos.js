import React, { Component } from 'react';
import BackBtn from '../../helper/backBtn';
import ImagePicker from 'react-native-image-picker';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../services/config';
import Spinner from '../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
    SafeAreaView,
    View,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    ScrollView
} from 'react-native';
import SubmitButton from '../../helper/SubmitButton';
import { translate } from '../../helper/translationHelper';

export default class UploadPhoto extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            imageData: [],
            loading: false,
            userID: '',
            count: 0
        }
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
    }

    onchoose = (data) => {
        if (!(this.state.imageData.filter(e => e.count === data.count).length > 0)) {
            console.log('hello')
            this.setState({ imageData: [...this.state.imageData, data] });
        } else {
            if (this.state.imageData.filter(datas => datas.count === data.count)) {
                let some_array = [...this.state.imageData]
                some_array[data.count] = data
                console.log(some_array)
                this.setState({ imageData: some_array })
            } else {
                console.log('asdas')
            }
            // this.setState({ imageData: this.state.imageData.filter(datas => datas.count != data.count) })
        }

        // if (this.state.imageData.length == 0) {
        //     data['count'] != 0 ? data['count'] = 0 : console.log('ajhsdghjs')
        //     this.setState({ imageData: [data] }, () => {
        //         console.log('coming here', this.state.imageData)
        //     })
        // } else {
        //     if (this.state.imageData.map(filterData => filterData.count === data.count)) {
        //         // this.state.imageData.shift();
        //         // this.setState({imageData: [...this.state.imageData, data]}, () => {
        //         //     console.log(this.state.imageData)
        //         // })
        //         console.log('equal')
        //     } else {
        //         console.log('not equal')
        //     }
        // }
    }

    chooseImage = (count) => {
        let options = {
            title: translate('Select Image'),
            maxWidth: 700,
            maxHeight: 700,
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.showImagePicker(options, (response) => {
            // console.log('Response = ', response);
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                this.setState((prevState) => ({ count: prevState.count + 1 }), () => console.log("Count ---->", this.state.count));
                // const source = { uri: response.uri };
                // this.setState({ allergiesResponseData: response.data.data.map(item => ({ label: item.name, value: item.id })) 
                this.setState({
                    data: ({ fileUri: Platform.OS === 'android' ? "file://" + response.path : response.uri, renderImage: response.uri, count: count })
                }, () => {
                    // console.log(this.state.data)
                    this.onchoose(this.state.data)
                })
            }
        });

    }

    onImageUpload = () => {
        if (this.state.imageData.length > 0) {
            this.setState({ loading: true })
            const formData = new FormData();
            formData.append('user_id', this.state.userID);
            formData.append(`urls`, "");
            this.state.imageData.forEach((image, index) => {
                formData.append(`new_images[${index}]`, {
                    uri: image.fileUri,
                    type: 'image/jpeg',
                    name: image.fileUri.split('/').pop(),
                });
            })

            axios({
                url: apiUrl + 'upload-profile-images',
                method: 'POST',
                data: formData,
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    this.setState({ loading: false })
                    console.log(response.data)
                    // Toast.show(response.data.message)
                    if (response.data.status == 1) {
                        // console.log(response.data)
                        this.props.navigation.navigate('Intro')
                    }else{
                        Toast.show(response.data.message)
                    }
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    console.log(erroraa);
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
            //this.props.navigation.navigate('Intro')
            Toast.show(translate('Please upload at least one photo'))
        }
    }


    render() {
        // console.log('length', this.state.imageData, this.state.imageData.length)
        return (
            <>
                {this.state.loading && <Spinner />}
                <SafeAreaView>
                    <ScrollView>
                        <View style={{ flexGrow: 1, alignItems: 'center' }}>
                            <BackBtn navigation={this.props.navigation} />
                            <Image source={require('../../assets/firstScreen/graylogo.png')} resizeMode={'contain'} style={{ height: 80, marginHorizontal: 16, marginTop: 70 }} />
                            <Text style={{ fontSize: 19, fontFamily: 'Montserrat-SemiBold', marginTop: 40 }}>{translate("Upload your photos")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 24 }}>
                                <TouchableOpacity style={[style.imageViewStyle, { marginRight: 16 }]} onPress={() => this.chooseImage(0)}>
                                    {this.state.imageData.length == 0 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>1</Text>
                                    }
                                    {this.state.imageData.length > 0 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[0].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={[style.imageViewStyle, { marginRight: 16 }]} onPress={() => this.chooseImage(1)}>
                                    {this.state.imageData.length <= 1 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>2</Text>
                                    }
                                    {this.state.imageData.length > 1 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[1].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={style.imageViewStyle} onPress={() => this.chooseImage(2)}>
                                    {this.state.imageData.length <= 2 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>3</Text>
                                    }
                                    {this.state.imageData.length > 2 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[2].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', marginTop: 24 }}>
                                <TouchableOpacity style={[style.imageViewStyle, { marginRight: 16 }]} onPress={() => this.chooseImage(3)}>
                                    {this.state.imageData.length <= 3 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>4</Text>
                                    }
                                    {this.state.imageData.length > 3 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[3].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={[style.imageViewStyle, { marginRight: 16 }]} onPress={() => this.chooseImage(4)}>
                                    {this.state.imageData.length <= 4 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>5</Text>
                                    }
                                    {this.state.imageData.length > 4 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[4].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={style.imageViewStyle} onPress={() => this.chooseImage(5)}>
                                    {this.state.imageData.length <= 5 &&
                                        <Text style={{ fontSize: 44, color: 'white' }}>6</Text>
                                    }
                                    {this.state.imageData.length > 5 &&
                                        <Image style={[style.imageViewStyle]} source={{ uri: this.state.imageData[5].renderImage }}></Image>
                                    }
                                </TouchableOpacity>
                            </View>
                            <View>
                                <TouchableOpacity onPress={() => {
                                    let currentCount = this.state.count;
                                    if (this.state.imageData.length >= 6) {
                                        Toast.show(translate('Maximum Images uploaded'))
                                    } else {
                                        this.chooseImage(currentCount)
                                    }

                                }}>
                                    <Image source={require('../../assets/Group.png')} resizeMode={'contain'} style={{ height: 25, marginHorizontal: 16, marginTop: 30 }} />
                                </TouchableOpacity>
                            </View>
                            <SubmitButton title={translate("Continue")} TouchableStyle={{ marginTop: 30 }} onPress={() => this.onImageUpload()} />
                            {/* <TouchableOpacity style={{ marginTop: 60, marginBottom: 40 }} onPress={() => this.onImageUpload()}>
                                <ImageBackground source={require('../../assets/btnBackground.png')} resizeMode={'stretch'} style={{ height: 46, justifyContent: 'center', borderRadius: 27, overflow: 'hidden' }}>
                                    <Text style={{ color: "white", fontSize: 12, fontFamily: 'Montserrat-Bold', alignSelf: "center", marginHorizontal: 60 }}>CONTINUE</Text>
                                </ImageBackground>
                            </TouchableOpacity> */}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </>
        )
    }
}

const style = StyleSheet.create({
    imageViewStyle: {
        height: 120,
        width: 80,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center'
    }
})
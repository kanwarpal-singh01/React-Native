import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import axios from "axios";
import { ApiUrl as apiUrl } from '../../../services/config';
import Spinner from '../../../helper/spinner';
import Toast from 'react-native-simple-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { validations } from '../../../helper/validation';
import ImagePicker from 'react-native-image-picker';
import { DragSortableView } from 'react-native-drag-sort';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AuthContext } from '../../../navigations/context';

import { translate } from '../../../helper/translationHelper';

import {
    ImageBackground,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Dimensions,
    Alert
} from 'react-native';

const parentWidth = Dimensions.get('window').width
const childrenWidth = 100
const childrenHeight = 130
const marginChildrenTop = 0
const marginChildrenBottom = 24
const marginChildrenLeft = 5
const marginChildrenRight = 0

const boxWidth = Dimensions.get('window').width / 3 - 25;


export default class EditInfo extends Component {
    static contextType = AuthContext;
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            height: 0,
            nationlity: '',
            male: true,
            female: false,
            loading: false,
            userID: '',
            data: [],
            imageData: [],

            scrollEnabled: true,
            isEnterEdit: false,
            imageIndexCount: 0,

            serverImages: [],
            img_base_url: ""
        }
        this.index = 1;
    }

    async componentDidMount() {
        this.setState({ userID: await AsyncStorage.getItem('userID') })
        let { response } = this.props.route.params

        // console.log({ user_image: response.data.user_images, profile_url: response.profile_url, images: response.data.images });

        this.setState({ serverImages: response.data.images, img_base_url: response.profile_url })

        this.setState({
            description: response.data.user_detail.bio, height: response.data.user_detail.height, male: response.data.user_detail.gender == 'Male' ? true : false,
            female: response.data.user_detail.gender == 'Female' ? true : false, nationlity: response.data.user_detail.nationality,
        });
    }

    async componentDidUpdate() {
        this.checkLoginStatus(this.state.userID);
    }

    checkLoginStatus = (userId) => {
        console.log("CALLIING API FORM LOGIN STATUS", userId);

        if (userId) {
            let body = { user_id: userId };


            axios
                .post(apiUrl + 'login-status', body)
                .then((response) => {
                    console.log("THIS IS RESPONSE DATE", response.data)

                    if (response.data.status == 1) {

                    } else if (response.data.status == 10) {
                        this.context.signOut();
                        Toast.show(response.data.message)
                    }
                })
                .catch((erroraa) => {
                    console.log("ERROR FOR HERE", erroraa);

                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show('Please check your internet connection')
                    }
                });
        }
    }

    onGenderclick(first, second) {
        this.setState({ male: first, female: second })
    }

    onChange = (name, value) => {
        this.setState({ [name]: value })
    }

    onChangess = (name, value) => {
        this.setState({ [name]: Number(value) })
    }

    increment() {
        this.setState({ height: Number(this.state.height) + 1 })
    }

    decrement() {
        this.state.height == 0 ? 0 : this.setState({ height: Number(this.state.height) - 1 })
    }

    imageIncment() {
        this.setState({ imageIndexCount: this.state.imageIndexCount + 1 })
    }

    editInfo() {
        this.setState({ loading: true })
        let vaildationBody = { height: this.state.height }
        let error = ""
        let errors = validations.signUpValidation(error, vaildationBody);

        if (errors == "") {
            let body = { user_id: this.state.userID, profile_type: 'edit', bio: this.state.description, height: this.state.height, nationality: this.state.nationlity, gender: this.state.male == true ? 'Male' : 'Female' }
            axios
                .post(apiUrl + 'profile-completion', body)
                .then(async (response) => {
                    // Toast.show('Profile updated successfully.')

                    console.log("Navigation aayaaa =------------->");

                    this.setState({ loading: false });
                    this.props.navigation.goBack()
                })
                .catch((erroraa) => {
                    this.setState({ loading: false })
                    if (erroraa.toJSON().message === 'Network Error') {
                        Toast.show(translate('Please check your internet connection'))
                    }
                });
        } else {
            this.setState({ loading: false })
            Toast.show(translate(errors), 6)
        }
    }

    chooseImage = () => {
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
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            } else {
                this.uploadImageOnserver(response);
            }
        });
    }

    uploadImageOnserver = (data = null, ifDelete = false) => {
        this.setState({ loading: true })
        const formData = new FormData();
        formData.append('user_id', this.state.userID);

        this.state.serverImages.forEach((url, index) => {
            formData.append(`urls[${index}]`, url);
        });

        if (data) {
            let uri = Platform.OS === 'android' ? "file://" + data.path : data.uri;
            let new_image = {
                uri: uri,
                type: 'image/jpeg',
                name: uri.split('/').pop(),
            };
            formData.append(`new_images[0]`, new_image);
        } else {
            formData.append(`new_images`, "");
        }

        axios({
            url: apiUrl + 'upload-profile-images',
            method: 'POST',
            data: formData,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            this.setState({ loading: false })
            if (response.data.status == 1) {
                this.setState({ serverImages: response.data.data.filter(image => image) }, () => console.log("ShowImages -->", this.state.serverImages));
                if (ifDelete) {
                    // Toast.show('Image deleted successfully.')
                } else {
                    // Toast.show('Image saved successfully.')
                }
            }else{
                Toast.show(response.data.message)
            }
        }).catch((erroraa) => {
            this.setState({ loading: false })
            console.log("Image upload Error --->", erroraa);
            if (erroraa.toJSON().message === 'Network Error') {
                Toast.show(translate('Please check your internet connection'))
            }
        });
    }

    deleteItemImage(index) {
        Alert.alert(
            translate("Delete Image"),
            translate("Are you sure_You want to delete this image"),
            [
                {
                    text: translate("Cancel"),
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: translate("Delete"), onPress: () => {
                        if (this.state.serverImages.length == 1) {
                            Toast.show(translate('One photo is mandatory'))
                        } else {
                            if (this.state.isEnterEdit) {
                                const newData = this.state.serverImages;
                                newData.splice(index, 1)
                                this.setState({ serverImages: newData }, () => {
                                    this.uploadImageOnserver(null, true);
                                })
                            }
                        }
                    }
                }
            ]
        );
    }

    renderItem(item, index) {
        if (item) {
            let uri = "";
            if (item.includes("/")) {
                uri = item;
            } else {
                uri = this.state.img_base_url + item
            }

            if (this.state.isEnterEdit) {
                return (
                    <View style={[{ zIndex: 1, width: boxWidth, height: 110, alignItems: "center", justifyContent: "center" }]}>
                        <Image style={{ width: boxWidth - 20, height: 110 }} source={{ uri }} />

                        <TouchableOpacity onPress={() => this.deleteItemImage(index)} style={{
                            width: 30,
                            height: 30,
                            position: 'absolute',
                            right: -10,
                            bottom: -17,
                        }}>
                            <Image
                                style={{ width: 15, height: 15 }}
                                source={require('../../../assets/home/cross.png')}
                            />
                        </TouchableOpacity>
                    </View>
                )
            } else {
                return (
                    <View style={[{ width: boxWidth, justifyContent: 'center', alignItems: 'center' }]}>
                        <Image style={{ width: boxWidth - 20, height: 110 }} source={{ uri }} />
                    </View>
                )
            }
        } else {
            return (<View style={[
                {
                    width: boxWidth,
                    height: 110,
                    zIndex: -1,
                    alignItems: "center"
                }
            ]}>
                <TouchableOpacity
                    onPress={() => {
                        if (this.state.serverImages.length <= 5) {
                            this.chooseImage()
                        }
                    }}
                >
                    <Image source={require('../../../assets/home/addImg.png')} style={{ height: 110, width: boxWidth - 20, }}></Image>
                </TouchableOpacity>
            </View>)
        }
    }

    showCompleteBlockOfImage(array = []) {
        if (array.length > 0) {
            array = array.filter(image => image);
        }
        if (array.length < 6) {
            let remainingImages = 6 - array.length;
            for (let i = 1; i <= remainingImages; i++) {
                array.push("");
            }
        }

        return array;
    }

    render() {
        let { nationlity, height } = this.state
        return (
            <>
                {this.state.loading && <Spinner />}
                <ImageBackground style={{ flex: 1, width: null, height: null }}>
                    <SafeAreaView style={{ backgroundColor: 'white' }} />
                    <KeyboardAwareScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} scrollEnabled={this.state.scrollEnabled}>
                        <View style={{ backgroundColor: 'white' }}>
                            <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
                                <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                                    <View style={{ height: 20, width: 50 }}>
                                        <Image source={require('../../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
                                    </View>
                                </TouchableOpacity>
                                <Text style={{ fontSize: 13, fontFamily: 'Montserrat-Bold', color: '#FF5000' }}>{translate("Edit Info")}</Text>
                                <TouchableOpacity onPress={() => this.editInfo()}>
                                    <View style={{ height: 20, width: 60 }}>
                                        <Text style={{ fontSize: 11, fontFamily: 'Montserrat-Medium', color: '#FF5000', textAlign: 'right' }}>{translate("Done")}</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} scrollEnabled={this.state.scrollEnabled} style={style.container}>
                            {/* <View style={{ alignItems:"center",justifyContent: 'center' }}> */}
                            <View style={{ paddingHorizontal: 32 }}>
                                <DragSortableView
                                    dataSource={this.showCompleteBlockOfImage(this.state.serverImages)}
                                    parentWidth={Dimensions.get('window').width}
                                    fixedItems={6}
                                    childrenWidth={(Dimensions.get('window').width / 3) - 20}
                                    childrenHeight={130}
                                    marginChildrenTop={15}
                                    // marginChildrenBottom={24}
                                    // marginChildrenLeft={5}
                                    // marginChildrenRight={0}
                                    onDragStart={(startIndex, endIndex) => {
                                        if (!this.state.isEnterEdit) {
                                            this.setState({
                                                isEnterEdit: true,
                                                scrollEnabled: false
                                            })
                                        } else {
                                            this.setState({
                                                scrollEnabled: false
                                            })
                                        }
                                    }}
                                    onDragEnd={(startIndex) => {
                                        this.setState({ scrollEnabled: true })
                                    }}
                                    onDataChange={(data) => {
                                        this.setState({ serverImages: data }, () => {
                                            this.uploadImageOnserver();
                                        })
                                    }}
                                    onClickItem={(data, item, index) => { }}
                                    keyExtractor={(item, index) => item}
                                    renderItem={(item, index) => {
                                        return this.renderItem(item, index)
                                    }}
                                />
                            </View>
                            {/* </View> */}
                            <Text style={{ fontSize: 10, fontFamily: 'Montserrat-Medium', marginTop: 24, textAlign: 'center', color: '#9D9D9D' }}>{this.state.serverImages.filter(image => image).length > 5 ? translate("Maximum Images Uploaded_Delete images to upload more") : translate("Press and hold to rearrange photos")}</Text>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginTop: 32, marginHorizontal: 44 }}>{translate("Introduce Yourself")}</Text>
                            <TouchableWithoutFeedback style={{ marginTop: 8, borderRadius: 4, backgroundColor: 'white', height: 180, flex: 1, marginHorizontal: 36 }} onPress={() => this.ref.focus()}>
                                <TextInput style={{ fontSize: 16, marginHorizontal: 6, paddingTop: 6, color: '#262626' }} ref={ref => (this.ref = ref)} multiline={true} onChangeText={text => this.onChange("description", text)} >{this.state.description}</TextInput>
                            </TouchableWithoutFeedback>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginTop: 24, marginHorizontal: 44 }}>{translate("Enter Your Height")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 8, backgroundColor: 'white', marginHorizontal: 36, height: 44 }}>
                                <View style={{ marginLeft: 16, alignSelf: 'center' }}>
                                    <TouchableOpacity style={{ marginBottom: 8 }} onPress={() => this.increment()}>
                                        <Image source={require('../../../assets/firstScreen/topArrow.png')} style={{ height: 8, width: 12 }} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{}} onPress={() => this.decrement()}>
                                        <Image source={require('../../../assets/firstScreen/bottomArrow.png')} style={{ height: 8, width: 12 }} />
                                    </TouchableOpacity>
                                </View>
                                <TouchableWithoutFeedback style={{ height: 44, width: Dimensions.get('screen').width - 110, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} onPress={() => this.refs.focus()}>
                                    <TextInput style={{ fontSize: 14, ontFamily: 'Montserrat-Regular', width: 40, color: '#262626', height: 44, }} ref={ref => (this.refs = ref)} maxLength={3} textAlign={'center'} keyboardType={'number-pad'} onChangeText={text => this.onChangess("height", text)}>{this.state.height}</TextInput>
                                    <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#262626', marginLeft: -4, }}> {translate("cm")}</Text>
                                </TouchableWithoutFeedback>
                                {/* <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#262626', alignSelf: 'center', marginLeft: 100 }}> cm</Text> */}
                            </View>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginTop: 24, marginHorizontal: 44 }}>{translate("Enter Your Nationality")}</Text>
                            <TextInput style={{ fontSize: 16, backgroundColor: 'white', color: '#262626', height: 44, marginHorizontal: 36, padding: 6, marginTop: 8 }} onChangeText={text => this.onChange("nationlity", text)} value={nationlity}></TextInput>
                            <Text style={{ fontSize: 13, fontFamily: 'Montserrat-SemiBold', color: '#535253', marginTop: 24, marginHorizontal: 44 }}>{translate("Select Your Gender")}</Text>
                            <View style={{ flexDirection: 'row', marginTop: 8, marginHorizontal: 36, alignItems: 'center', marginBottom: 40 }}>
                                <TouchableOpacity style={{}} onPress={() => this.onGenderclick(true, false)}>
                                    <Image source={this.state.male == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 28, width: 28 }} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8, marginRight: 24 }}>{translate("Male")}</Text>
                                <TouchableOpacity style={{}} onPress={() => this.onGenderclick(false, true)}>
                                    <Image source={this.state.female == true ? require('../../../assets/Ellipse.png') : require('../../../assets/home/radio.png')} style={{ height: 28, width: 28 }} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 14, fontFamily: 'Montserrat-Regular', color: '#535253', marginLeft: 8 }}>{translate("Female")}</Text>
                            </View>
                        </ScrollView>
                    </KeyboardAwareScrollView>
                </ImageBackground>
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
    },
    container: {
        flex: 1,
    },
    txt: {
        fontSize: 18,
        lineHeight: 24,
        padding: 5,
    },
    sort: {
        borderWidth: 2,
        backgroundColor: "pink",
        width: "80%"
    },
    item: {
        width: childrenWidth,
        height: childrenHeight,
    },
    item_children: {
        width: childrenWidth - 8,
        height: childrenHeight,
    },
    item_delete_icon: {
        width: 14,
        height: 14,
        position: 'absolute',
        right: 1,
        top: 1
    },
    item_icon: {
        width: childrenWidth - 4 - 8,
        height: childrenHeight - 4 - 8,
    },
})
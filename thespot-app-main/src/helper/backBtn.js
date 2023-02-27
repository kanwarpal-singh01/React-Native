import React from 'react';
import { Image, TouchableOpacity} from 'react-native';

const BackBtn = ({navigation}) => {
    return (
        <TouchableOpacity style={{ marginTop: 24}} onPress={() => navigation.goBack()}>
            <Image source={require('../assets/backs.png')} resizeMode={'contain'} style={{ height: 30, width: 30}}></Image>
        </TouchableOpacity>
    )
}

export default BackBtn;
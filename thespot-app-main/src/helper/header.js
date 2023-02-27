import React from 'react';
import { View, TouchableOpacity, Image, Text } from 'react-native';
import { translate } from '../helper/translationHelper';


const Header = ({ navigation, title }) => {
    console.log(navigation, title)
    return (
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', marginHorizontal: 16, marginTop: 16 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/home/blackClose.png')} style={{ height: 18, width: 18 }} />
            </TouchableOpacity>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#f76128' }}>{title}</Text>
            <TouchableOpacity>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#f76128' }}>{translate("Done")}</Text>
            </TouchableOpacity>
        </View>
    )
}


export default Header;
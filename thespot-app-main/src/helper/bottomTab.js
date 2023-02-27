import React from 'react';
import { Dimensions, Image, TouchableOpacity, View } from 'react-native';

const BottomTab = ({ navigation, controller }) => {
    console.log('asdasd', navigation)
    return (
        <View style={{ width: Dimensions.get('window').width, flexDirection: 'row', backgroundColor: 'yellow', height: 70, position: 'absolute', bottom: 0, alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ marginLeft: 30 }} onPress={() => navigation.navigate('Home')}>
                <Image source={controller == "Home" ? require("../assets/tabs/profilActive.png") : require("../assets/tabs/profileInactive.png")} style={{ height: 30, width: 30 }}></Image>
            </TouchableOpacity>
            <TouchableOpacity style={{}} onPress={() => navigation.navigate('Location')}>
                <Image source={controller == "Location" ? require("../assets/tabs/locationActive.png") : require("../assets/tabs/locationInactive.png")} style={{ height: 42, width: 27 }}></Image>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginRight: 30 }} onPress={() => navigation.navigate('Chat')}>
                <Image source={controller == "Chat" ? require("../assets/tabs/chatActive.png") : require("../assets/tabs/chatInactive.png")} style={{ height: 30, width: 30 }}></Image>
            </TouchableOpacity>
        </View>
    )
}

export default BottomTab;
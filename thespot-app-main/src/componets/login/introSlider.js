import  React from 'react';
import { Platform, StyleSheet } from 'react-native';

import AppIntroSlider from 'react-native-app-intro-slider';
import{View,Text,Image,StatusBar} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { actuatedNormalize as an } from "../../componets/responsiveScreen";

const slides = [
  {
    key: 'one',
    title: 'Meet New People in The Spot',
    text: "What is The Spot? The Spot is where you can chat with anyone who is located within a 500 m radius.  Click on the user's profile and start chatting!",
    image: require('../../assets/intro/slide1.png'),
   
  },
  {
    key: 'two',
    title: 'Chat Without Matching',
    text: 'Fancy someone? Initiate a chat, and continue the conversation once the user accepts your request.',
    image: require('../../assets/intro/slide2.png'),
   
   
  },
  {
    key: 'three',
    title: 'See Who Viewed & Liked You',
    text: 'Get instant notifications whenever a user visits or likes your profile.',
    image: require('../../assets/intro/slide3.png'),
    
  },
  {
    key: 'four',
    title: 'Activate Spy Mode',
    text: 'Want to keep a low profile? Activate spy mode to remain invisible on the map while still being able to see who is around!',
    image: require('../../assets/intro/slide4.png'),
    
  },
  {
    key: 'five',
    title: 'Drop Your Pin Anywhere',
    text: 'Not enough people in your Spot? Change your location by dropping your pin anywhere on the map and start chatting with new users!',
    image: require('../../assets/intro/slide5.png'),
    
  },
  {
    key: 'six',
    title: 'Share Your Moments',
    text: 'You can share pictures and videos on your story by clicking the + symbol.',
    image: require('../../assets/intro/slide6.png'),
    
  },
  
];

export default class IntroSlider extends React.Component {
   constructor(props) {
     super(props);
      this.state = {
      showRealApp: false,
      skipBtnStatus:true,
  }
}
  _renderItem = ({ item, index}) => {
    console.log(item, index)
    return (
      <View  style={styles.slide}>
        <StatusBar backgroundColor='black' />
        <Image source={item.image} style={styles.images} resizeMode='stretch'/>
        <Text style={styles.titles}>{item.title} </Text>
        <Text style={styles.text}>{item.text}</Text>
        {index != 5 ?
        <View style={{height: 40, width: 40, position: 'absolute', top: Platform.OS == 'ios' ? 50 : 15, right:20, justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity  style={{}} onPress={() => this._onDone()}>
            <Text style={{fontSize: an(14),color:"grey",fontFamily:"Montserrat-SemiBold"}}>Skip</Text>
          </TouchableOpacity>
        </View> : console.log("heyysadasd")}
      </View>
    );
  };
  _renderNextButton = () => {
   
    return (
      <View style={{backgroundColor: 'pink', zIndex: 1}}>
      <Text>Next</Text>
     </View>
    );
  };
  _renderSkipButton = () => {
    return (
      <View style={{backgroundColor: 'pink', zIndex: 1,}}>
      <Text>Skip</Text>
     </View>
    );
  };
  _renderDoneButton = () => {
    return (
      <View style={{backgroundColor: 'pink', zIndex: 1}}>
       <Text>Done</Text>
      </View>
    );
  };
  _onDone = () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    this.setState({ showRealApp: true });
    this.props.navigation.replace('FirstScreen')

  };
  render() {
    if (this.state.showRealApp) {
      return <IntroSlider />
    } else {
      return <AppIntroSlider renderItem={this._renderItem} data={slides} bottomButton={this._renderNextButton} bottomButton={this._renderDoneButton} doneLabel={"Get Started"}  onDone={this._onDone}
      />
    }
  }
}
const styles = StyleSheet.create({
    slide: {
      width:"100%",
      height:"100%",
      alignItems:"center",
      position:"absolute",
      zIndex:0
},
 images:{
   marginTop:"20%",
   width:"100%",
   height:"50%",   
   zIndex:0,
 
 },
 text:{
   marginTop:"3%",
   fontSize:Platform.OS == 'ios' ? an(14) : an(13),
   width:Platform.OS == 'ios' ? "90%" : "80%",
   zIndex:1,
   color:"grey",
   textAlign:"center",
   fontFamily: "Montserrat-Medium",
  lineHeight:18
 
 }, 
 titles:{
   marginTop:Platform.OS == 'ios' ? "12%" : "10%",
   color:"black",
   zIndex:1,
   fontSize:an(24),
   fontFamily:"Montserrat-SemiBold",
   
   
 },
 buttonCircle: {
 
 color:"red",
 zIndex:1,

},
buttonCircle2: {
 
  color: 'white',
  zIndex:1,
  
 },
})


  
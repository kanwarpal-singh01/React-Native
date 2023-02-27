/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

 import { Dimensions, PixelRatio, Platform } from 'react-native';

 const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
 const scale = SCREEN_WIDTH / 320;
 
 const widthPercentageToDP = (widthPercent) => {
   const screenWidth = Dimensions.get('window').width;
   // Convert string input to decimal number
   const elemWidth = parseFloat(widthPercent);
   return PixelRatio.roundToNearestPixel((screenWidth * elemWidth) / 100);
 };
 
 const heightPercentageToDP = (heightPercent) => {
   const screenHeight = Dimensions.get('window').height;
   // Convert string input to decimal number
   const elemHeight = parseFloat(heightPercent);
   return PixelRatio.roundToNearestPixel((screenHeight * elemHeight) / 100);
 };
 const actuatedNormalize = (size) => {
   let px = size * (72 / 96);
   const newSize = px * scale;
   if (Platform.OS === 'ios') {
     return Math.round(PixelRatio.roundToNearestPixel(newSize));
   } else {
     return Math.round(PixelRatio.roundToNearestPixel(newSize));
   }
 };
 const getDelta = (size) => {
   const window = Dimensions.get('window');
   const { width, height } = window
   return 0.0922 + (width / height)
 };
 
 export { widthPercentageToDP, heightPercentageToDP, actuatedNormalize, getDelta };
 
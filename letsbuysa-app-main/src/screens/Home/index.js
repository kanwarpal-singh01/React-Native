import React, {Component} from 'react';
import {
  Image,
  View,
  I18nManager,
  StatusBar,
  FlatList,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Text,
  Dimensions,
  Modal
} from 'react-native';


//Third party
import {connect} from 'react-redux';
import {SafeAreaView, NavigationEvents} from 'react-navigation';
import {IndicatorViewPager, PagerDotIndicator} from 'rn-viewpager';
import LinearGradient from 'react-native-linear-gradient';
import {Modalize} from 'react-native-modalize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';


//Custom component
import {Label, Hr, ProductCard} from 'src/component';

//Utility
import styles from './styles';
import Action from 'src/redux/action';
import {API_GET_CATEGORIES, API_HOME_PAGE, APIRequest, ApiURL} from 'src/api';
import {
  Color,
  ThemeUtils,
  Constants,
  Icon,
  Strings,
  CommonStyle,
  IS_IOS,
  showSuccessSnackBar,
  decodeImageUrl,
  
} from 'src/utils';
import Routes from 'src/router/routes';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import { Platform } from 'react-native';
import { Alert } from 'react-native';
const {height} = Dimensions.get('window');

const banners = [
  {
    category_id: '66',
    image: require('../../assets/images/home_dummy_assets/HomeBanner.png'),
    link: 'Current-Offers',
    name: 'الصور المتحركة في الصفحة الرئيسية - سلايدر New',
    title: 'افضل العروض',
  },
  {
    category_id: '66',
    image: require('../../assets/images/home_dummy_assets/HomeBanner.png'),
    link: 'Current-Offers',
    name: 'الصور المتحركة في الصفحة الرئيسية - سلايدر New',
    title: 'افضل العروض',
  },
  {
    category_id: '66',
    image: require('../../assets/images/home_dummy_assets/HomeBanner.png'),
    link: 'Current-Offers',
    name: 'الصور المتحركة في الصفحة الرئيسية - سلايدر New',
    title: 'افضل العروض',
  },
  {
    category_id: '66',
    image: require('../../assets/images/home_dummy_assets/HomeBanner.png'),
    link: 'Current-Offers',
    name: 'الصور المتحركة في الصفحة الرئيسية - سلايدر New',
    title: 'افضل العروض',
  },
];

const brands = [
  {
    id: '1',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '2',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '3',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '4',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '5',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '6',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '7',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
  {
    id: '8',
    image: require('../../assets/images/home_dummy_assets/brand.png'),
  },
];

const products = [
  {
    product_id: '633',
    thumb: 'catalog/048/9215600772_669602093-200x200.jpg',
    name: 'Golden Earring',
    description:
      'Modern gold plated earring with exquisite square-shaped design',
    price: 'SR  77',
    special: 'SR  59',
    tax: false,
    minimum: '1',
    percentage: 23,
    wishlist: false,
    qty: '5',
    options: [],
  },
  {
    product_id: '685',
    thumb: 'catalog/000E/10651349024_1413985291-200x200.jpg',
    name: 'Golden Earring',
    description: 'Modern gold plated earring with great design',
    price: 'SR  57',
    special: 'SR  49',
    tax: false,
    minimum: '1',
    percentage: 14,
    wishlist: false,
    qty: '5',
    options: [],
  },
  {
    product_id: '668',
    thumb: 'catalog/000E/10358060405_786828687-200x200.jpg',
    name: 'Golden Earring',
    description: 'Modern gold plated earring with gorgeous pearl design',
    price: 'SR  59',
    special: 'SR  46',
    tax: false,
    minimum: '1',
    percentage: 22,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '822',
    thumb:
      'catalog/000E/Nihao%20NHSA19050605188/8584666462_418100057-200x200.jpg',
    name: 'Golden Earring',
    description:
      'Trendy earring, square shaped gold-plated design with colorful crystals',
    price: 'SR  49',
    special: 'SR  44',
    tax: false,
    minimum: '1',
    percentage: 10,
    wishlist: false,
    qty: '12',
    options: [
      {
        product_option_id: '625',
        product_option_value: [
          {
            qty: '6',
            hex_code: '#9F00C5',
            product_option_value_id: '924',
            option_value_id: '58',
            name: 'Purple',
            image:
              'catalog/000E/Nihao%20NHSA19050605188/8564793427_418100057-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '6',
            hex_code: '#FF0800',
            product_option_value_id: '923',
            option_value_id: '39',
            name: 'red',
            image:
              'catalog/000E/Nihao%20NHSA19050605188/8584666462_418100057-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '659',
    thumb: 'catalog/000E/9529233346_1569970395-200x200.jpg',
    name: 'Golden Earring',
    description:
      'A modern, gold-plated earring with a gorgeous design with colored strings',
    price: 'SR  55',
    special: 'SR  36',
    tax: false,
    minimum: '1',
    percentage: 35,
    wishlist: false,
    qty: '17',
    options: [
      {
        product_option_id: '532',
        product_option_value: [
          {
            qty: '5',
            hex_code: '#FF0800',
            product_option_value_id: '661',
            option_value_id: '39',
            name: 'red',
            image: 'catalog/000E/9529218690_1569970395-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '6',
            hex_code: '#FFF600',
            product_option_value_id: '659',
            option_value_id: '42',
            name: 'yellow',
            image: 'catalog/000E/9529233346_1569970395-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '6',
            hex_code: '#000000',
            product_option_value_id: '660',
            option_value_id: '49',
            name: 'black',
            image: 'catalog/000E/9529224556_1569970395-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '475',
    thumb: 'catalog/071/51022_P_1538038966850-200x200.jpg',
    name: 'Golden Earring',
    description:
      'A modern, gold-plated earring studded with beautiful colored zircon',
    price: 'SR  53',
    special: 'SR  49',
    tax: false,
    minimum: '1',
    percentage: 8,
    wishlist: false,
    qty: '17',
    options: [
      {
        product_option_id: '433',
        product_option_value: [
          {
            qty: '6',
            hex_code: '#00008B',
            product_option_value_id: '378',
            option_value_id: '59',
            name: 'Dark Blue',
            image: 'catalog/071/51022_P_1538038966030-200x200.JPG',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '5',
            hex_code: '#FF0800',
            product_option_value_id: '380',
            option_value_id: '39',
            name: 'red',
            image: 'catalog/071/51022_P_1538038967405-200x200.JPG',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '6',
            hex_code: '#00a800',
            product_option_value_id: '379',
            option_value_id: '41',
            name: 'green',
            image: 'catalog/071/51022_P_1538038966795-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '858',
    thumb: 'catalog/000E/Xuping%2020200202974434/b7774fd6b01-200x200.jpg',
    name: 'Golden Earring',
    description: 'Golden elegant earring design plated with 14K gold color',
    price: 'SR  46',
    special: 'SR  41',
    tax: false,
    minimum: '1',
    percentage: 11,
    wishlist: false,
    qty: '3',
    options: [],
  },
  {
    product_id: '567',
    thumb: 'catalog/055/10364252020_14139852912-200x200.jpg',
    name: 'Golden Earring',
    description:
      'Modern golden plated earring with exquisite design with gray stone and zircon',
    price: 'SR  66',
    special: 'SR  33',
    tax: false,
    minimum: '1',
    percentage: 50,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '655',
    thumb: 'catalog/000E/9466225059_2042183389-200x200.jpg',
    name: 'Golden Earring',
    description:
      'A modern, gold-plated earring with a gorgeous design with colored strings',
    price: 'SR  52',
    special: 'SR  43',
    tax: false,
    minimum: '1',
    percentage: 17,
    wishlist: false,
    qty: '12',
    options: [
      {
        product_option_id: '529',
        product_option_value: [
          {
            qty: '6',
            hex_code: '#FF0800',
            product_option_value_id: '655',
            option_value_id: '39',
            name: 'red',
            image: 'catalog/000E/9466222086_2042183389-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '6',
            hex_code: '#000000',
            product_option_value_id: '656',
            option_value_id: '49',
            name: 'black',
            image: 'catalog/000E/9466189779_2042183389-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '694',
    thumb: 'catalog/000E/8071554916_418100057-200x200.jpg',
    name: 'Golden Earring',
    description:
      'Modern gold plated earring with a gorgeous design with oval shaped stone',
    price: 'SR  87',
    special: 'SR  69',
    tax: false,
    minimum: '1',
    percentage: 21,
    wishlist: false,
    qty: '10',
    options: [
      {
        product_option_id: '540',
        product_option_value: [
          {
            qty: '6',
            hex_code: '#FF0800',
            product_option_value_id: '678',
            option_value_id: '39',
            name: 'red',
            image: 'catalog/000E/8096972865_418100057-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '4',
            hex_code: '#00a800',
            product_option_value_id: '679',
            option_value_id: '41',
            name: 'green',
            image: 'catalog/000E/8071617019_418100057-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '682',
    thumb: 'catalog/000E/10191281815_701462832-200x200.jpg',
    name: 'Golden Earring',
    description:
      'Modern gold plated earring with a magnificent design in a circular ring with golden strings',
    price: 'SR  89',
    special: 'SR  69',
    tax: false,
    minimum: '1',
    percentage: 22,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '677',
    thumb: 'catalog/000E/10373467059_1777934208-200x200.jpg',
    name: 'Golden Earring',
    description: 'A modern, gold-plated earring with a stunning circle design',
    price: 'SR  49',
    special: 'SR  37',
    tax: false,
    minimum: '1',
    percentage: 24,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '459',
    thumb: 'catalog/074/34176_P_1474595054892-200x200.jpg',
    name: 'Golden Zircon Earring',
    description:
      'Modern earrings inlaid with zircon , plated in gold and wonderful rose designed',
    price: 'SR  121',
    special: 'SR  59',
    tax: false,
    minimum: '1',
    percentage: 51,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '902',
    thumb:
      'catalog/000E/Nihao%20NHSA20021855959/13122569060_2042183389-200x200.jpg',
    name: 'Tassel Vintage Earrings',
    description:
      'Gorgeous Tassel Vintage Earrings in gold color decorated with red crystal',
    price: 'SR  79',
    special: 'SR  71',
    tax: false,
    minimum: '1',
    percentage: 10,
    wishlist: false,
    qty: '3',
    options: [],
  },
  {
    product_id: '921',
    thumb: 'catalog/000E/Xuping%2020200202974434/55588b32cb1-200x200.jpg',
    name: 'Gray Elegant Earring ',
    description:
      'Fashion Gray Elegant Earring, plated by 14K gold color comes in an elegant gift box.',
    price: 'SR  59',
    special: 'SR  49',
    tax: false,
    minimum: '1',
    percentage: 17,
    wishlist: false,
    qty: '2',
    options: [],
  },
  {
    product_id: '481',
    thumb: 'catalog/070/36597_P_1486882350412-200x200.jpg',
    name: 'Zircon Earring',
    description: 'Modern silver plated earring with a beautiful zircon design',
    price: 'SR  129',
    special: 'SR  69',
    tax: false,
    minimum: '1',
    percentage: 47,
    wishlist: false,
    qty: '6',
    options: [],
  },
  {
    product_id: '153',
    thumb: 'catalog/059/35100_P_1492408632782-200x200.jpg',
    name: 'Zircon Earring',
    description:
      'Silver earring with exquisite design in a circle shape and colored stones',
    price: 'SR  72',
    special: 'SR  50',
    tax: false,
    minimum: '1',
    percentage: 31,
    wishlist: false,
    qty: '8',
    options: [
      {
        product_option_id: '295',
        product_option_value: [
          {
            qty: '5',
            hex_code: '#00008B',
            product_option_value_id: '170',
            option_value_id: '59',
            name: 'Dark Blue',
            image: 'catalog/059/35100_P_1492408632606-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
          {
            qty: '3',
            hex_code: '#00a800',
            product_option_value_id: '171',
            option_value_id: '41',
            name: 'green',
            image: 'catalog/059/35100_P_1492408633443-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '223',
    thumb: 'catalog/110/6417058666_109652400_1-200x200.jpg',
    name: 'Zircon Earring',
    description: 'Silver earring studded with zircon to give a wonderful shine',
    price: 'SR  89',
    special: 'SR  47',
    tax: false,
    minimum: '1',
    percentage: 47,
    wishlist: false,
    qty: '4',
    options: [],
  },
  {
    product_id: '466',
    thumb: 'catalog/072/40714_P_1501466446184-200x200.jpg',
    name: 'Zircon Earring',
    description:
      'A modern silver (radium) plated earring with a magnificent colored zircon',
    price: 'SR  101',
    special: 'SR  79',
    tax: false,
    minimum: '1',
    percentage: 22,
    wishlist: false,
    qty: '6',
    options: [
      {
        product_option_id: '431',
        product_option_value: [
          {
            qty: '6',
            hex_code: '#66b3ff',
            product_option_value_id: '376',
            option_value_id: '56',
            name: 'light blue',
            image: 'catalog/072/40714_P_1501466446184-200x200.jpg',
            price: false,
            price_prefix: '+',
          },
        ],
        option_id: '5',
        name: 'Choose color',
        type: 'select',
        value: '',
        required: '1',
      },
    ],
  },
  {
    product_id: '872',
    thumb:
      'catalog/000E/Nihao%20NHSA19050605188/10832050427_192854676-200x200.jpg',
    name: 'Zircon Earrings',
    description:
      'Butterfly Zircon Earrings gold designed to be simple and elegant',
    price: 'SR  59',
    special: 'SR  49',
    tax: false,
    minimum: '1',
    percentage: 17,
    wishlist: false,
    qty: '24',
    options: [],
  },
];

class Home extends Component {
  //Server request
  getCategoryRequest = () => {
    new APIRequest.Builder()
      .get()
      .setReqId(API_GET_CATEGORIES)
      .reqURL(ApiURL.getCategories)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  getHomeRequest = () => {
    // this.checkToShowPromotion()
    this.setState({isLoaderVisible: true});
    let params = null;
    if (this.props.user) {
      params = {
        customer_id: this.props.user.customer_id,
      };
    }
    new APIRequest.Builder()
      .post()
      .setReqId(API_HOME_PAGE)
      .reqURL(ApiURL.homePage)
      .formData(params)
      .response(this.onResponse)
      .error(this.onError)
      .build()
      .doRequest();
  };

  checkToShowPromotion =async()=>{
    const currentTime = new Date();
      const savedTime = this.props?.promoTime
      console.log('saved Time',savedTime)
      if(savedTime == null){
        this.setState({showPromotion:true}) 
        this.props.setPromoTime(currentTime)
        return
      }
      let duration = moment.duration(moment().diff(savedTime));
      let hours = duration.asHours();            
      if (hours < 2) {return} 
      this.setState({showPromotion:true}) 
      this.props.setPromoTime(currentTime)
  }

  onResponse = (response, reqId) => {
    this.setState({isLoaderVisible: false});


    // this.openModel()
   
    switch (reqId) {
      case API_HOME_PAGE:
        switch (response.status) {
          case Constants.ResponseCode.OK:
            if (response.data) {
              
              this.setState({productsData: response.data});
              if (
                Object.keys(response?.data?.response).includes('banners') &&
                response?.data?.response['banners'].length > 0
              ) {
                this.setState({banners: response.data?.response['banners']});
              }
              if (response.data.product_path){
                this.setState({product_path: response.data.product_path});
              }
              if (
                response.data.wishlist_count !== null &&
                response.data.wishlist_count !== undefined
              ) {
                this.props.setWishlistCount(
                  parseInt(response.data.wishlist_count),
                );
              }
              if (
                response.data.cart_count !== null &&
                response.data.cart_count !== undefined
              ) {
                this.props.setCartCount(parseInt(response.data.cart_count));
              }
              if (
                Array.isArray(response.data?.response.category_banners) &&
                response.data?.response?.category_banners.length > 0
              ) {
                this.setState({
                  categoryBanners: response.data?.response.category_banners,
                });
                
              }
                if(response.data?.model_image_path && response.data?.response?.model_category_id && response.data?.response?.model_sub_category_id ){
                  this.setState({
                    promotionImage: `${response?.data?.model_image_path}${response.data?.response?.model_image}`,
                    promotionCategory:response.data?.response?.model_category_id,
                    promotionSubCategory:response.data?.response?.model_sub_category_id,
                    promotionStatus:response.data?.response?.model_status,
                  },()=>{
                    //this.openModel()
                 //   this.modalizeRef?.open();
                 setTimeout(()=>{
                  const currentTime = new Date();
                  const savedTime = this.props?.promoTime
                  console.log('saved Time',savedTime)
                  if(savedTime == null){
                    this.setState({showModel:true}) 
                    this.props.setPromoTime(currentTime)
                    return
                  }
                  let duration = moment.duration(moment().diff(savedTime));
                  let hours = duration.asHours();  
                  console.log('hours',hours)
          
                  if (hours < 2) {return} 
                  this.props.setPromoTime(currentTime)
                  //  if(this.state.showPromotion){
                    //  this.openModel()
                    this.setState({
                      showModel:true
                    })
                  //  }
                },3000)
                  });
                }
            }
            break;
        }
        break;
    }
  };

  onError = (error, reqId) => {
    this.setState({isLoaderVisible: false});
    console.log('error', error);
  };

  //User Interaction
  onClickBanner = (banner, isFromSlider = false) => {
    console.log('banner',banner)
    if (banner?.category_id == null || banner.subCategory_id){return}
    if (banner.product_id && banner.product_id !== '') {
      this.onClickProduct(banner);
    } else {
      this.props.navigation.navigate(
        Routes.ProductListHome, {
            categoryId :banner?.category_id,
              subCategoryId: banner.subcategory_id,
            },
      );
    }
  };

  onClickProduct = item => {
    this.props.navigation.navigate(Routes.ProductDetail, {
      productData: item,
    });
  };

  onClickViewAll = section => {
      if (section.type.id == 'topbrands'){
        this.props.navigation.navigate(Routes.BrandListHome,{
        type: section.type,
        })
      }
      else{
        this.props.navigation.navigate(Routes.ProductListHome, {
            type: section.type,
          });
      }
 
  };

  

  brandTapped = (brand) => {
    const obj = {id: I18nManager.isRTL ? brand?.name_ar : brand?.name_en, title: I18nManager.isRTL ? brand?.name_ar : brand?.name_en}
    this.props.navigation.navigate(Routes.ProductListHome, {
      brand_id: brand.id,
      type:obj
    });
  };


  //Utility
  updateProductData = (product, updateVal) => {
    let selectedLang = this.props.appConfig.languages.find(
        lang => lang.language_id === this.props.langCode,
      ),
      HOME_SECTIONS = Constants.HOME_SECTIONS;
    if (selectedLang) {
      HOME_SECTIONS = selectedLang.home_string;
    }

    let sectionsData = HOME_SECTIONS.map(item => {
    
      if (
        Object.keys(this.state.productsData.response).includes(item.id) &&
        this.state.productsData.response[item.id]?.length > 0
      ) {
        return {
          id: item.id,
          title: item.title,
          products: this.state.productsData.response[item.id],
        };
      }
    });

    for (let i = 0; i < sectionsData.length; i++) {
      console.log
      let idxToReplace = sectionsData[i].products.findIndex(
        item => item.id === product.id,
      );

      if (idxToReplace !== -1) {
        //update product array
        sectionsData[i].products[idxToReplace] = {
          ...product,
          wishlist: updateVal,
        };
        console.log('productsData',sectionsData[i].products[idxToReplace].id, product.id)

        //update section in state
        let newProductsData = {...this.state.productsData};
        newProductsData[sectionsData[i].id] = sectionsData[i].products;

        this.setState({productsData: newProductsData});

        //exit
        break;
      }
    }
    this._ismounted &&
      showSuccessSnackBar(
        updateVal
          ? this.props.localeStrings.productAddWishlist
          : this.props.localeStrings.productRemoveWishlist,
      );
  };

  getBannerImage = item => {
    const imgPath = this.state.productsData?.banner_path;
    const img = this.state.currentRTL ? item?.image_ar : item.image_en;
    return imgPath + img;
  };

    // Action
    openModel = () => {
      this.modalizeRef?.open();

    };
    closeModel = () => {
      this.modalizeRef?.close();
            console.log('model close  ke liye aaya')

      this.setState({showPromotion:false}) 
    };


  //UI methods
  renderListItem = (item, index, type) => {
    if (type.id === 'topbrands') {
      const imgPath = this.state.productsData?.topbrands_path;
      const img = this.state.currentRTL ? item?.image_ar : item.image_en;
      return (
        <View style={styles.brandItem}>
          <TouchableOpacity
            style={styles.brandItemTouchable}
            onPress={()=>this.brandTapped(item)}
            activeOpacity={0.8}>
            <LinearGradient
              start={{x: 0, y: 0.5}}
              end={{x: 0, y: 1}}
              colors={['#EFEFEF', '#FFFFFF']}
              style={styles.brandItemLinearGradient}>
             <View style = {styles.brandImageContainer}>
                <Image
                source={{uri: imgPath + img}}
                style={styles.brandItemImage}
              />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }
    return (

      <ProductCard productData={item}
      imagepath={this.state.product_path}
      itemWidth =  {ThemeUtils.relativeWidth(40)}
      onPress={this.onClickProduct}
      onUpdateProduct={this.updateProductData}
      navigation={this.props.navigation}
      showDescription
      newDesign/>
    );
  };

  renderOfferBanners = () => {
    const imgPath = this.state.productsData?.banner_path;

    return (
      <View style={styles.fifthRow}>
        {this.state.productsData.response.offerbanners.map((item, index) => {
          const img = this.state.currentRTL ? item?.image_ar : item.image_en;
          return (
            <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              this.onClickBanner(item)
          }}
            style={{ width: '33.33%'}}>
            <Image
              source={{uri: imgPath+img}}
              style={{width:'100%' , resizeMode:'contain', aspectRatio: 1.2}}
            />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  renderSideBanners = () => {
    const imgPath = this.state.productsData?.sidebanner_path;
    return (
      <View style={{marginHorizontal: 15, flexDirection:'row', marginVertical: 10}}>
        {this.state.productsData.response.sidebanners.map((item, index) => {
          const img = this.state.currentRTL ? item?.image_ar : item.image_en;
          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                this.onClickBanner(item)
            }}
              style={{marginVertical: 5, aspectRatio: 1.5, width: '50%'}}>
              <Image
                source={{uri:imgPath+img}}
                style={{
                  flex: 1,
                  width: '100%',
                  borderRadius: 10,
                  resizeMode:'contain'
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  renderHotDeals = ()=>{

    const imgPath = this.state.productsData.hotdeal;
    return (
        <View style={styles.tenthRow}>
        {this.state.productsData?.response?.hotdeals.map((item, index) => {
          const img = this.state.currentRTL ? item?.image_ar : item.image_en;
          return (
            <TouchableOpacity  onPress={() => {
              this.onClickBanner(item)
          }}
           activeOpacity={0.8} style={styles.tenthRowItem}>
              <Image
                source={{uri:imgPath+img}}
                style={{flex: 1 ,resizeMode:'contain'}}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
     
  }

  renderHotTodayBanners = ()=>{
    const imgPath = this.state.productsData.hottoday;
    let lastItem = null
    return (
      <View>
        <View style={styles.lastRow}>
        {this.state.productsData?.response?.hottodaybanner.map((item, index) => {

          const img = this.state.currentRTL ? item?.image_ar : item.image_en;
          if(index === 3){
            lastItem = item
            return
          }

          return (
            <TouchableOpacity  onPress={() => {
              this.onClickBanner(item)
          }}
           activeOpacity={0.8} style={styles.lastRowItem}>
              <Image
                source={{uri:imgPath+img}}
                style={{flex: 1, resizeMode:'contain'}}
              />
            </TouchableOpacity>
          );

        })}
      </View>
     { lastItem ? <TouchableOpacity  onPress={() => {
                this.onClickBanner(lastItem)
            }}
             activeOpacity={0.8} style={styles.lastLRowItem}>
                <Image
                  source={{uri:imgPath+(this.state.currentRTL ? lastItem?.image_ar : lastItem.image_en)}}
                  style={{flex: 1, resizeMode:'contain'}}
                />
              </TouchableOpacity> : null}
      </View>
    );
  }

  renderSection = (sectionData, index, length) => {
    return (
      <View>
        {this.props?.user && index === 0 ? (
          <View style={styles.sectionContainer}>
            <View style={CommonStyle.content_center}>
              <Label
                mt={5}
                mb={5}
                large
                nunito_bold
                bolder={IS_IOS}
                color={Color.TEXT_DARK}>
                {this.props.user
                  ? `${this.props.localeStrings.hello}, ${
                      this.props.user.full_name
                    }`
                  : `${this.props.localeStrings.hello}`}
              </Label>
            </View>
            {/* <View style={styles.userLineContainer}>
              <Hr lineStyle={styles.lineSeparator} />
            </View> */}
          </View>
        ) : null}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Label opensans_bold bolder color={Color.TEXT_DARK} singleLine>
              {sectionData.title}
            </Label>
            <TouchableOpacity onPress={()=>this.onClickViewAll(sectionData)}>
              <Label opensans_bold bolder color={Color.PRIMARY} singleLine>
                {this.props.localeStrings.viewAll || 'See All Items'}
              </Label>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionLineContainer}>
            {/* <Hr lineStyle={styles.sectionLine} /> */}
          </View>
          {
            <FlatList
              horizontal
              contentContainerStyle={{paddingHorizontal: 10}}
              showsHorizontalScrollIndicator={false}
              extraData={this.state}
              data={sectionData.products}
              keyExtractor={item => `${item.product_id}`}
              renderItem={({index, item}) =>
                this.renderListItem(item, index, sectionData.type)
              }
            />
          }
          {index === 3 && this.renderHotDeals()}
          {index === 2 && this.renderHotTodayBanners()}
          {index === 1 && this.renderOfferBanners()}
          {index === 0 && this.renderSideBanners()}

          {/* {this.state.categoryBanners.length > 0
                    && this.state.categoryBanners[index] !== null
                    && this.state.categoryBanners[index] !== undefined
                    && this.state.categoryBanners[index].image ?
                        <View style={styles.bannerCategory}>
                            <TouchableOpacity activeOpacity={1}
                                              underlayColor={Color.TRANSPARENT}
                                              onPress={() => {
                                                  this.onClickBanner(this.state.categoryBanners[index])
                                              }}>
                                <Image
                                    source={{uri: decodeImageUrl(this.state.categoryBanners[index].image)}}
                                    resizeMode={'contain'}
                                    style={styles.bannerCategoryImage}/>
                            </TouchableOpacity>
                        </View>
                        : null
                    }
                    <View style={styles.sectionRuleContainer}>
                        {index !== length - 1 &&
                        <Hr lineStyle={styles.lineSeparator}/>
                        }

                    </View> */}
        </View>
      </View>
    );
  };

  renderHome = () => {
    let selectedLang = this.props.appConfig.languages.find(
        lang => lang.language_id === this.props.langCode,
      ),
      HOME_SECTIONS = Constants.HOME_SECTIONS;
    if (selectedLang) {
      HOME_SECTIONS = selectedLang.home_string;
    }

    //create sections with title and products array
    let sectionsData = HOME_SECTIONS.map(item => {
      if (
        Object.keys(this.state.productsData?.response).includes(item.id) &&
        this.state.productsData?.response[item.id].length > 0
      ) {
        return {
          type: item,
          title: item.title,
          products: this.state.productsData?.response[item.id],
        };
      }
    });


    //return array of Views
    return sectionsData.map((section, index) => {
      if (section) {
        return this.renderSection(section, index, sectionsData.length);
      }
    });
  };

  // _renderDotIndicator = () => (
  //     <PagerDotIndicator
  //         pageCount={banners.length}
  //         hideSingle
  //         dotStyle={{backgroundColor: 'red' }}
  //         selectedDotStyle={{backgroundColor: Color.PRIMARY}}
  //     />
  // );

  _renderDotIndicator = () => (
    <PagerDotIndicator
      pageCount={this.state.banners.length}
      hideSingle
      dotStyle={{
        backgroundColor: Color.LIGHT_GRAY,
        height: 10,
        width: 10,
        borderRadius: 5,
      }}
      selectedDotStyle={{
        backgroundColor: Color.PRIMARY,
        height: 10,
        width: 10,
        borderRadius: 5,
      }}
    />
  );

  renderBannersSection = () => {
    return this.state.banners?.length > 0 ? (
      <IndicatorViewPager
        indicator={this._renderDotIndicator()}
        autoPlayEnable={true}
        autoPlayInterval={15000}
        style={{width: '100%', aspectRatio: 1.62}}>
        {this.state.banners.map((item, index) => {
          return (
            <View >
              <TouchableOpacity
                activeOpacity={0.8}
                // key={index}
                onPress={() => {
                  this.onClickBanner(item, true)
              }}
                style={styles.bannerItem}>
                <Image
                  style={styles.bannerImage}
                  source={{uri: this.getBannerImage(item)}}
                />
              </TouchableOpacity>
            </View>
          );
        })}
      </IndicatorViewPager>
    ) : null;
  };

  renderModelView = ()=>{
    console.log('ayyyyaaaaa')
    return(<View  style ={styles.promoView}>
      <TouchableOpacity
        activeOpacity={0.8}
        // key={index}
        onPress={() => {
          console.log('tappeddd')
          this.setState({showModel:false},()=>{
            this.props.navigation.navigate(
              Routes.ProductListHome, {
                  categoryId :this.state.promotionCategory,
                    subCategoryId: this.state.promotionSubCategory,
                  },
            );
          })
          
      }}
        // style={styles.promoView}
        >
        <Image
          style={styles.promoImage}
          source={{uri: this.state.promotionImage}}
          onLoadEnd={()=>{
            console.log('Complete ho gyi')
            
          }}
        />
      </TouchableOpacity>
      <TouchableOpacity style = {{position:'absolute', top:5, right:5, padding:5}} onPress={()=>this.setState({showModel:false})}>
    <Text style={{fontSize:20, fontWeight:'bold' ,}} >X</Text>
    </TouchableOpacity>
    </View>)
  }

  //Lifecycle methods
  constructor(props) {
    super(props);
    this.modalizeRef = null;

    this.state = {
      currentRTL: I18nManager.isRTL,
      promotionImage:'',
      promotionCategory:null,
      promotionSubCategory:null,
      promotionStatus:0,
      showPromotion:false,
      showModel:false,
      banner_path: '',
      banners: [],
      productsData: null,
      bannerPath: '',
      categoryBanners: [],
      isLoaderVisible: false,
    };
    this._ismounted = false;
  }

  

  componentDidMount() {
    // console.log("isRTL", I18nManager.isRTL);
    // this.getHomeRequest();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.user !== this.props.user ||
      prevProps.wishlist !== this.props.wishlist ||
      prevProps.wishlistCount !== this.props.wishlistCount
    ) {
      if(this.props.user){
        this.getHomeRequest();
      }
    }
  }


  render() {
    return (
      <View style={styles.safeArea}>
        <StatusBar
          barStyle={'light-content'}
          backgroundColor={Color.BG_COLOR_DARK}
        />
        <NavigationEvents
          onWillFocus={payload => {
            this._ismounted = false;
          }}
          onDidFocus={payload => {
            this.getHomeRequest();
          }}
          onWillBlur={payload => {
            this._ismounted = true;
          }}
          onDidBlur={payload => {
            this._ismounted = false;
          }}
        />
        <ScrollView
          removeClippedSubviews={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isLoaderVisible}
              onRefresh={this.getHomeRequest}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {this.renderBannersSection()}
            {this.state.productsData ? this.renderHome() : null}
          </View>         
        </ScrollView>

        {/* <Modalize
        
            ref={model => (this.modalizeRef = model)}
            modalHeight={height*0.2}
            style={{backgroundColor:'transparent'}}
            withHandle={false}
            modalStyle={styles.modelView}>
            {this.renderModelView()}
        </Modalize> */}

    <Modal
      transparent={true}
      animationType={'none'}
      visible={this.state.showModel}
      style={{zIndex: 1100}}
      onRequestClose={() => {}}>
      <View style={styles.modalBackground}>
         {this.renderModelView()}
      </View>
    </Modal>

      </View>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    logoutUser: () => dispatch(Action.logout()),
    setWishlistCount: count => dispatch(Action.setWishlistCount(count)),
    setCartCount: count => dispatch(Action.setCartCount(count)),
    setPromoTime: time => dispatch(Action.setPromoTime(time)),

  };
};

const mapStateToProps = state => {
  if (state === undefined) return {};
  return {
    user: state.user,
    wishlist: state.wishlist,
    wishlistCount: state.wishlistCount,
    localeStrings: state.localeStrings,
    appConfig: state.appConfig,
    langCode: state.langCode,
    promoTime: state.promoTime
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Home);

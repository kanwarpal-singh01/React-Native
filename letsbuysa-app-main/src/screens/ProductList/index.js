import React, {Component} from 'react';
import {
    View,
    TouchableOpacity,
    FlatList,
    RefreshControl,
} from 'react-native';

//Third party
import {connect} from "react-redux";
import {FlatGrid} from 'react-native-super-grid';
import {NavigationEvents, SafeAreaView} from "react-navigation";

//Custom component
import {
    Label,
    SortPopUp,
    ProductCard,
    CustomNavigationHeader,
    FilterPopUp
} from "src/component";

//Utility
import Action from "src/redux/action";
import {
    API_GET_PRODUCTS,
    API_GET_FILTERS,
    APIRequest,
    ApiURL
} from "src/api";
import styles from './styles';
import {
    Color,
    Constants,
    ThemeUtils,
    IS_IOS,
    CommonStyle,
    Icon,
    Strings,
    showSuccessSnackBar
} from "src/utils";
import Routes from "src/router/routes";

class ProductList extends Component {

    //Server request
    getProductsList = () => {
        this.setState({
            isLoaderVisible: true,
            errMessage: this.props.localeStrings.pleaseWait
        });
        let params = {
            "page": this.state.tempPage,
            "sort": this.state.sortOption.sort_val,
            "order": this.state.sortOption.order_val,
        };

        

        if (Array.isArray(this.state.selectedFilters) && this.state.selectedFilters) {
            let id_string = "";
            this.state.selectedFilters.map(id => {
                id_string = `${id_string}${id_string ? "," : ""}${id}`;
            });
            params['filter'] = id_string;
        }

        if (this.state.subCategoryId) {
            params["category_id"] = this.state.subCategoryId
        } 
        else if(this.state.home_brand_id){
            params["brand_id"] = this.state.home_brand_id
        }else if (this.state.homeTypeData) {
            params["type"] = this.state.homeTypeData.id.toLowerCase()
        }
          if (this.state.searchTypeData) {
            params["search"] = this.state.searchTypeData;
        }

        if (this.props.user) {
            params["customer_id"] = this.props.user.customer_id
        }

        new APIRequest.Builder()
            .post()
            .setReqId(API_GET_PRODUCTS)
            .reqURL(ApiURL.getProducts)
            .formData(params)
            .response(this.onResponse)
            .error(this.onError)
            .build()
            .doRequest()
    };

    getFilters = () => {
        this.setState({
            isLoaderVisible: true
        });
        if (this.state.categoryId) {
            let params = {
                "category_id": this.state.categoryId,
            };
            new APIRequest.Builder()
                .post()
                .setReqId(API_GET_FILTERS)
                .reqURL(ApiURL.getProductFilters)
                .formData(params)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        } else {
            new APIRequest.Builder()
                .post()
                .setReqId(API_GET_FILTERS)
                .reqURL(ApiURL.getProductFilters)
                .response(this.onResponse)
                .error(this.onError)
                .build()
                .doRequest()
        }
    };

    onResponse = (response, reqId) => {

        this.setState({
            isLoaderVisible: false
        });
        switch (reqId) {
            case API_GET_PRODUCTS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data && response.data.product) {
                            let dummyPage = 1;
                            dummyPage = response.data.total_pages === this.state.tempPage ?
                                0 : this.state.tempPage; //last page
                            this.setState({
                                product_path:response.data.product_path,
                                products: this.state.tempPage === 1 ? response.data.product : [...this.state.products, ...response.data.product],
                                page: dummyPage
                            });
                            /*if (Object.keys(response.data).includes("banners") && response.data["banners"].length > 0) {
                                this.setState({banners: response.data["banners"]})
                            }*/
                        }
                        break
                }
                break;
            case API_GET_FILTERS:
                switch (response.status) {
                    case Constants.ResponseCode.OK:
                        if (response.data &&
                            Array.isArray(response.data.filters.filter) &&
                            response.data.filters.filter.length > 0) {
                            this.setState({
                                availableFilters: [response.data.filters]
                            }, () => {
                                this.setState({
                                    showFilterPopUp: true
                                })
                            })
                        }
                        break
                }
                break;
        }
    };

    onError = (error, reqId) => {
        this.setState({
            isLoaderVisible: false
        });
        console.log('error', error);
        switch (reqId) {
            case API_GET_PRODUCTS:
                if (this.state.page !== 1) {
                    this.setState({
                        page: 0
                    });
                }
                this.setState({
                    errMessage: this.props.localeStrings.noProductsFound
                });
                break;
        }
    };

    //Utility
    updateProductData = (product, updateVal) => {

        let currentProducts = this.state.products.slice();
        let idxToReplace = currentProducts.findIndex((item) => item.id === product.id);
        if (idxToReplace !== -1) {
            currentProducts[idxToReplace] = {...product, wishlist: updateVal};
            this.setState({products: currentProducts})
        }
        this._ismounted && showSuccessSnackBar(updateVal ? this.props.localeStrings.productAddWishlist : this.props.localeStrings.productRemoveWishlist);
    };

    //User Interaction
    onClickProduct = (item) => {
        this.props.navigation.navigate(Routes.ProductDetail, {
            productData: item
        })
    };

    handleLoadMore = () => {

        if (!this.state.isLoaderVisible && this.state.page !== 0) {
            this.setState({
                    tempPage: this.state.page + 1,
                    isLoaderVisible: true
                },
                () => {
                    this.getProductsList();
                });
        }
    };

    onCloseSort = (sortOption) => {
        this.setState({showSortPopUp: false,});
        if (sortOption && sortOption.id !== this.state.sortOption.id) {
            this.setState({
                sortOption,
                products: null,
                page: 1,
                tempPage: 1,
            }, () => {
                this.getProductsList()
            });
        }
    };

    onCloseFilter = () => {
        this.setState({showFilterPopUp: false,});
    };

    onClearFilter = () => {
        this.setState({
            selectedFilters: [],
            showFilterPopUp: false,
            products: null,
            page: 1,
            tempPage: 1,
        }, () => {
            this.getProductsList()
        })
    };

    onApplyFilter = (selectedFilters) => {
        this.setState({showFilterPopUp: false,});
        if (Array.isArray(selectedFilters)) {
            this.setState({
                selectedFilters,
                products: null,
                page: 1,
                tempPage: 1,
            }, () => {
                this.getProductsList()
            });
        }
    };

  

    renderRelatedCategory = (item, index) => {
        return (
            <TouchableOpacity style={styles.relatedCategoryChip}
                              activeOpacity={0.8}
                              underlayColor={Color.TRANSPARENT}
                              onPress={() => this.onClickRelatedCategory(item)}>
                <Label color={Color.TEXT_DARK}
                       me={10}
                       ms={10}
                       small>{item.name}</Label>
            </TouchableOpacity>)
    };

    _renderFooter = () => {
        if (this.state.isLoaderVisible && this.state.tempPage !== 1) {
            return (
                <View
                    style={{
                        marginVertical: 20,
                    }}>
                    <Label align="center"
                           color={Color.TEXT_DARK}
                           small>
                        {this.props.localeStrings.loadingMoreProducts}
                    </Label>
                </View>
            );
        }
        return null
    };

    _renderEmptyView = () => {
        return (!this.state.isLoaderVisible ?
            <View style={{flex: 1, alignItems: 'center'}}>
                <Label align="center" normal color={Color.TEXT_DARK}
                       mt={15}>
                    {this.props.localeStrings.pullRefresh}
                </Label>
            </View>
            : null)
    };

    emptyListStyle = () => {
        if (!this.state.products.length > 0)
            return {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            }
    };

    renderProductGrid = () => {
        return (
            <View style={styles.gridContainer}>
                <FlatGrid
                    key={this.state.sortOption.id}
                    spacing={10}
                    itemDimension={ThemeUtils.relativeWidth(95) / 2 - 10}
                    items={this.state.products}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isLoaderVisible}
                        />}
                    itemContainerStyle={{alignItems: "center"}}
                    renderItem={({item}) => this.renderProductItem(item)}
                    onEndReachedThreshold={0.5}
                    onEndReached={this.handleLoadMore}
                    // ListHeaderComponent={this._renderHeader}
                    ListFooterComponent={this._renderFooter}
                    ListEmptyComponent={this._renderEmptyView}
                    contentContainerStyle={this.emptyListStyle()}
                />
            </View>
        )
    };

    renderProductItem = (item) => {
        return (
            <ProductCard productData={item}
                         imagepath = {this.state.product_path}
                         onPress={this.onClickProduct}
                         onUpdateProduct={this.updateProductData}
                         navigation={this.props.navigation}
                         newDesign/>
        )
    };

    renderSortModal = () => {
        return <SortPopUp showPopup={this.state.showSortPopUp}
                          selectedOptionId={this.state.sortOption.id}
                          onClosePopUp={this.onCloseSort}/>
    };

    renderFilterModal = () => {
        return <FilterPopUp showPopup={this.state.showFilterPopUp}
                            availableFilters={this.state.availableFilters}
                            selectedFilters={this.state.selectedFilters}
                            onClosePopUp={this.onCloseFilter}
                            onApplyPopUp={this.onApplyFilter}
                            onClearFilter={this.onClearFilter}/>
    };

    //Lifecycle methods
    static navigationOptions = ({navigation, navigationOptions}) => {
        let {state} = navigation;

        let title = navigation.getParam("appNameTitle", ""),
            all = navigation.getParam("allCategoryTitle", Strings.all);

        if (state.params && state.params.subCategory && state.params.subCategory.name) {
            if (state.params.subCategory.name.toUpperCase() === all.toUpperCase()) {
                title = state.params && state.params.mainCategory && state.params.mainCategory.name ?
                    state.params.mainCategory.name : "";
            } else {
                title = state.params && state.params.subCategory && state.params.subCategory.name
            }
        } else if (state.params && state.params.searchParam) {
            title = state.params.searchParam
        } else {
            if (state.params && state.params.type && state.params.type.title) {
                title = state.params.type.title;
            }
        }

        return {
            title,
            header: (props) => <CustomNavigationHeader {...props}
                                                       showRightButton={true}
                                                       showLeftButton={true}
                                                       titleCenter={true}
                                                       isMainTitle={title === navigation.getParam("appNameTitle", Strings.appName)}/>
        }
    };

    constructor(props) {
        super(props);

        let mainCategoryData = this.props.navigation.getParam('mainCategory', null);

        let categoryId = this.props.navigation.getParam('categoryId', null);
        let subCategoryId = this.props.navigation.getParam('subCategoryId', null);

        let homeTypeData = this.props.navigation.getParam('type', null);
        let home_brand_id = this.props.navigation.getParam('brand_id', null);

        let searchTypeData = this.props.navigation.getParam('searchParam', null);

        let sortOption =  Constants.SORT_OPTIONS[0];
        let showTop = homeTypeData ? false : home_brand_id ? false : true

        this.state = {
            mainCategoryData,
            subCategoryId,
            categoryId,
            homeTypeData,
            searchTypeData,
            home_brand_id,
            products: null,
            product_path:'',
            isLoaderVisible: false,
            page: 1,
            tempPage: 1,
            showSortPopUp: false,
            sortOption,
            showFilterBtn: showTop, //this.props.navigation.state.routeName !== Routes.ProductListHome, //dont show filters on Home products
            showFilterPopUp: false,
            availableFilters: [],
            selectedFilters: [],
            errMessage: this.props.localeStrings.pleaseWait
        };

        this.currentWishlistProduct = null;
    }

    componentWillMount() {
        this.props.navigation.setParams({
            appNameTitle: this.props.localeStrings.appName,
            allCategoryTitle: this.props.localeStrings.all
        })
    }

    componentDidMount() {
        this.getProductsList();
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.navigation.state &&
            this.props.navigation.state.routeName === Routes.ProductListSearch &&
            this.props.navigation.state.params &&
            nextProps.navigation.state &&
            nextProps.navigation.state.params &&
            this.props.navigation.state.params.searchParam !== nextProps.navigation.state.params.searchParam
        ) {
            return true
        } else if (this.state !== nextState) {
            return true
        } else if (this.props !== nextProps) {
            return true
        }
        return false
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.navigation.state &&
            this.props.navigation.state.routeName === Routes.ProductListSearch &&
            this.props.navigation.state.params &&
            prevProps.navigation.state &&
            prevProps.navigation.state.params &&
            this.props.navigation.state.params.searchParam !== prevProps.navigation.state.params.searchParam) {
            // console.log('mesafe1', this.props.navigation.state.params.searchParam);
            // console.log('mesafe2', prevProps.navigation.state.params.searchParam);

            this.setState({
                selectedFilters: [],
                showFilterPopUp: false,
                products: null,
                page: 1,
                tempPage: 1,
                searchTypeData: this.props.navigation.state.params.searchParam
            }, () => {
                this.getProductsList()
            })
        }
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillFocus={payload => {
                        this._ismounted = false;
                    }}
                    onDidFocus={payload => {
                        this._ismounted = true;
                    }}
                    onWillBlur={payload => {
                        this._ismounted = true;
                    }}
                    onDidBlur={payload => {
                        this._ismounted = false;
                    }}
                />
               {this.state.showFilterBtn ? <View style={styles.topButtonContainer}>
                    <TouchableOpacity style={styles.button}
                                      onPress={() => {
                                          this.setState({showSortPopUp: true})
                                      }}>
                        <Icon name={'sort_by'}
                              color={Color.TEXT_DARK}
                              size={ThemeUtils.fontNormal}/>
                        <Label color={Color.TEXT_DARK}
                               ms={10}>
                            {this.props.localeStrings.sortBy}
                        </Label>
                    </TouchableOpacity>
                    <View style={styles.verticalSeparator}/>
                    
                        <TouchableOpacity style={styles.button}
                                          onPress={() => {
                                              this.getFilters()
                                          }}>
                            <Icon name={'filter_by'}
                                  color={Color.TEXT_DARK}
                                  size={ThemeUtils.fontNormal}/>
                            <Label color={Color.TEXT_DARK}
                                   ms={10}>
                                {this.props.localeStrings.filters}
                            </Label>
                        </TouchableOpacity> 
                    
                </View>: null}
                {this.state.products ?
                    this.renderProductGrid() :
                    <View style={{flex: 1, marginVertical: 10}}>
                        <View style={[{flex: 1}, CommonStyle.content_center]}>
                            <Label>{this.state.errMessage}</Label>
                        </View>
                    </View>}
                {this.renderSortModal()}
                {this.renderFilterModal()}
            </View>
        );
    }
}

const mapDispatchToProps = (dispatch) => {
    return {}
};

const mapStateToProps = (state) => {
    if (state === undefined)
        return {};
    return {
        user: state.user,
        localeStrings: state.localeStrings
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ProductList)

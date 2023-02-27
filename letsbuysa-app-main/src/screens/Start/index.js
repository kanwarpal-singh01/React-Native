import React from 'react';
import {
    Button,
    Image,
    ImageBackground,
    StatusBar,
    View
} from 'react-native';

//Third party
import {
    NavigationActions,
    SafeAreaView,
    StackActions
} from 'react-navigation';

//Custom components
import {
    Label,
    RoundButton
} from 'src/component';

//Utility
import Routes from "src/router/routes";
import styles from './styles';
import {
    Color,
    IS_IOS,
    Strings,
    UtilityManager,
    ThemeUtils
} from "src/utils";

//assets
import LOGO from 'src/assets/images/Splash_Logo.png';

class Start extends React.Component {

    //utility
    resetToAuth = StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({routeName: Routes.Authenticated}),
        ]
    });

    //User interaction
    onClickLogin = () => {
        this.props.navigation.navigate(Routes.Login)
    };
    onClickSignUp = () => {
        this.props.navigation.navigate(Routes.SignUp)
    };
    onClickSkip = () => {
        this.props.navigation.dispatch(this.resetToAuth);
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: Color.GRAY}} forceInset={{top: 'never'}}>
                <StatusBar
                    translucent={IS_IOS}
                    backgroundColor={Color.GRAY}
                    barStyle="dark-content"
                />
                <View style={styles.container}>
                    {/*TODO replace with image background*/}
                    <View style={styles.bgImage}/>
                    {/*----------------------------------*/}
                    <Image source={LOGO}
                           style={[styles.headerImage, {marginTop: UtilityManager.getInstance().getStatusBarHeight()}]}
                           resizeMode={'contain'}/>
                    <View style={styles.bottomContainer}>
                        <View style={styles.buttonsContainer}>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(30)}
                                backgroundColor={Color.WHITE}
                                border_radius={5}
                                textColor={Color.PRIMARY}
                                click={this.onClickLogin}>
                                {Strings.signIn}
                            </RoundButton>
                            <RoundButton
                                width={ThemeUtils.relativeWidth(30)}
                                btn_sm
                                backgroundColor={Color.PRIMARY}
                                border_radius={5}
                                textColor={Color.WHITE}
                                click={this.onClickSignUp}>
                                {Strings.signUp}
                            </RoundButton>
                        </View>
                        <View style={styles.textContainer}>
                            <Label color={Color.WHITE}
                                   small
                                   style={styles.skipText}
                                   onPress={this.onClickSkip}>
                                {Strings.skip}
                            </Label>
                        </View>
                    </View>
                </View>
            </SafeAreaView>
        )
    }
}

export default Start;
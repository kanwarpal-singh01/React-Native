import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Routing from '../navigations/homeController';
import Auth from '../navigations/loginController';
import { AuthContext } from './context';
import { ApiUrl as apiUrl } from '../services/config';
import Toast from 'react-native-simple-toast';
import axios from "axios";

export default function AuthLoading({ navigation }) {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;
      try {
        userToken = await AsyncStorage.getItem('token');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({ type: 'RESTORE_TOKEN', token: userToken });

    };

    bootstrapAsync();

  }, []);

  React.useEffect(() => {
    const bootstrapAsync = async () => {
      let userId = await AsyncStorage.getItem('userID');
      checkLoginStatus(userId);
    };

    bootstrapAsync();
  }, [])

  const checkLoginStatus = (userId) => {
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

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        console.log('aksdhjkhsdjk', data)
        await AsyncStorage.setItem('token', 'avc') //data
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async data => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token

        dispatch({ type: 'SIGN_IN', token: 'dummy-auth-token' });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={authContext}>
      {state.userToken == null ? (
        <Auth />
      ) : (
        <Routing />
      )}
    </AuthContext.Provider>
  );
}
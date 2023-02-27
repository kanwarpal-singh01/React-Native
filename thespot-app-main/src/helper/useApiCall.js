import { useState } from 'react';
import axios from "axios";
import { ApiUrl as apiUrl } from '../services/config';
import Toast from 'react-native-simple-toast';
import { translate } from '../helper/translationHelper'

export default function useCallApi(url) {
    console.log("123456789065716946465465654--------------------------------->",url)
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null)

    let call = async (body, callback = () => { }) => {
        console.log(body);
        setLoading(true);
        try {
            let result = axios.post(apiUrl + url, body);
            let awaitResult = await result;
            setLoading(false)
            setData(awaitResult);

            result.then((res) => callback(res));

            return result;
        } catch (error) {
            setLoading(false);

            console.log("Got the error--------------->", error);

            setError(error.toJSON().message);

            if (error.toJSON().message === 'Network Error') {
                Toast.show(translate('Please check your internet connection'))
            }
        }
    }

    return {
        loading,
        data,
        error,
        call
    }
}
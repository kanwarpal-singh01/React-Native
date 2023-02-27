package com.lets.buyapk.GetDeeplinkModule;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.lets.buyapk.MainApplication;

public class GetDeeplinkModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext mainAppContext;

    @Override
    public String getName() {
        /**
         * return the string name of the NativeModule which represents this class in JavaScript
         * In JS access this module through React.NativeModules.GetDeeplink
         */
        return "GetDeeplink";
    }

    @ReactMethod
    public void getOpenedUrl(Callback callback) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            Log.d("App url getter", "activity null");
            callback.invoke("");
        }

        try {
            String s = ((MainApplication) this.mainAppContext.getApplicationContext()).getDeeplinkUrl();
            Log.d("App url getter", s);
            callback.invoke(s);
        } catch (Exception e) {
            Log.d("App url getter", e.getMessage());
            callback.invoke("");
        }
    }

    @ReactMethod
    public void setOpenedUrl(String url) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            Log.d("App url setter", "activity null");
            return;
        }

        try {
            ((MainApplication) this.mainAppContext.getApplicationContext()).setDeeplinkUrl(url);
            Log.d("App url setter", "Added");
        } catch (Exception e) {
            Log.d("App url setter", e.getMessage());
        }
    }

    /* constructor */
    public GetDeeplinkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.mainAppContext = reactContext;
    }
}

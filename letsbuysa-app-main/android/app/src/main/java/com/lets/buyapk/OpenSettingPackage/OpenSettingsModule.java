package com.lets.buyapk.OpenSettingPackage;

import android.app.Activity;
import android.content.Intent;

import android.net.Uri;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class OpenSettingsModule extends ReactContextBaseJavaModule {
    @Override
    public String getName() {
        /**
         * return the string name of the NativeModule which represents this class in JavaScript
         * In JS access this module through React.NativeModules.OpenSettings
         */
        return "OpenSettings";
    }

    @ReactMethod
    public void openNetworkSettings(Callback cb) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            cb.invoke(false);
            return;
        }

        try {
            final Intent i = new Intent();
            i.setAction(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            i.addCategory(Intent.CATEGORY_DEFAULT);
            i.setData(Uri.parse("package:" + currentActivity.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            i.addFlags(Intent.FLAG_ACTIVITY_NO_HISTORY);
            i.addFlags(Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS);
            currentActivity.startActivity(i);
            cb.invoke(true);
        } catch (Exception e) {
            cb.invoke(e.getMessage());
        }
    }

    /* constructor */
    public OpenSettingsModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }
}

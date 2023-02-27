package com.lets.buyapk.LocationModule;

import android.app.Activity;
import android.content.Intent;
import android.location.Location;
import android.provider.Settings;

import android.app.AlertDialog;
import android.content.DialogInterface;

import io.nlopez.smartlocation.OnLocationUpdatedListener;
import io.nlopez.smartlocation.SmartLocation;
import io.nlopez.smartlocation.location.config.LocationAccuracy;
import io.nlopez.smartlocation.location.config.LocationParams;

import com.lets.buyapk.R;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Locale;

/**
 * @author Rutvik Bhatt
 * for WebMob Technologies.
 * Email:adr1.webmobtech@gmail.com.
 * @since 11/1/18.
 * Copyright (c) 2018 WebMob Technologies.
 */
public class LocationModule extends ReactContextBaseJavaModule {

    private static final int GPS_ENABLED = 10;
    private static AlertDialog alertDialog;
    private Callback successCB;
    private Callback errorCB;
    private static String alertTitle;
    private static String alertMessage;
    private static String positiveBtn;
    private static String negativeBtn;
    private Activity currentActivity;
    private static Boolean isCancelable = true;

    public LocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(mActivityEventListener);
        alertTitle = isSpanish() ? "Habilitar GPS" : "Enable GPS";
        alertMessage = isSpanish()
                ? "La aplicación requiere la ubicación de su dispositivo para brindarle una mejor experiencia.\nHabilite el GPS desde Configuración por favor."
                : "App require your device\'s location to provide you better experience\nPlease enable GPS from Settings";
        positiveBtn = isSpanish() ? "Ir a la configuración" : "Go to Settings";
        negativeBtn = isSpanish() ? "Cancelar" : "Cancel";
    }

    @Override
    public String getName() {
        /*
         * return the string name of the NativeModule which represents this class in JavaScript
         * In JS access this module through React.NativeModules.OpenSettings
         */
        return "LocationModule";
    }

    @ReactMethod
    public void getSingleLocation(Boolean isCancelable,
                                  Callback successCB,
                                  Callback errorCB) {
        currentActivity = getCurrentActivity();
        String mAlertTitle;
        String mAlertMessage;
        String mPositiveBtn;
        String mNegativeBtn;

        if (currentActivity != null && !currentActivity.isFinishing()) {
            mAlertTitle = currentActivity.getString(R.string.location_alert_title);
            mAlertMessage = currentActivity.getString(R.string.location_alert_message);
            mPositiveBtn = currentActivity.getString(R.string.location_positive_btn);
            mNegativeBtn = currentActivity.getString(R.string.location_negative_btn);
        } else {
            mAlertTitle = isSpanish() ? "Habilitar GPS" : "Enable GPS";
            mAlertMessage = isSpanish()
                    ? "La aplicación requiere la ubicación de su dispositivo para brindarle una mejor experiencia.\\nHabilite el GPS desde Configuración por favor."
                    : "App require your device\\'s location to provide you better experience\\nPlease enable GPS from Settings";
            mPositiveBtn = isSpanish() ? "Ir a la configuración" : "Go to Settings";
            mNegativeBtn = isSpanish() ? "Cancelar" : "Cancel";
        }
        this.successCB = successCB;
        this.errorCB = errorCB;
        LocationModule.alertTitle = mAlertTitle;
        LocationModule.alertMessage = mAlertMessage;
        LocationModule.positiveBtn = mPositiveBtn;
        LocationModule.negativeBtn = mNegativeBtn;
        LocationModule.isCancelable = isCancelable;

        if (currentActivity == null) {
            errorCB.invoke(false);
            return;
        } else {
            initAlertDialog();
            startLocation();
        }

    }

    private boolean isSpanish() {
        return Locale.getDefault().getLanguage().equals(new Locale("es").getLanguage());
    }

    @ReactMethod
    public void watchPosition(Callback successCB, Callback errorCB) {
        currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            errorCB.invoke();
            return;
        } else {
            SmartLocation.with(currentActivity)
                    .location()
                    .config(new LocationParams.Builder()
                            .setAccuracy(LocationAccuracy.HIGH)
                            .setDistance(0.0F)
                            .setInterval(1000L)
                            .build())
                    .start(new OnLocationUpdatedListener() {
                        @Override
                        public void onLocationUpdated(Location location) {
                            try {
                                JSONObject jsonObject = new JSONObject();
                                jsonObject.put("mocked", location.isFromMockProvider());
                                jsonObject.put("timestamp", location.getTime());
                                JSONObject coordsObject = new JSONObject();
                                coordsObject.put("speed", location.getSpeed());
                                coordsObject.put("heading", location.getBearing());
                                coordsObject.put("accuracy", location.getAccuracy());
                                coordsObject.put("longitude", location.getLongitude());
                                coordsObject.put("altitude", location.getAltitude());
                                coordsObject.put("latitude", location.getLatitude());
                                jsonObject.put("coords", coordsObject);
                                sendLocationEvent(getReactApplicationContext(), jsonObject);
                            } catch (JSONException | java.lang.RuntimeException e) {
                                e.printStackTrace();
                                /*errorCB.invoke(e.toString());*/
                            }
                        }
                    });
            successCB.invoke();
        }
    }

    @ReactMethod
    public void stopWatchPosition(Callback successCB, Callback errorCB) {
        currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            errorCB.invoke();
            return;
        } else {
            SmartLocation.with(currentActivity).location().stop();
            successCB.invoke();
        }
    }

    private void sendLocationEvent(ReactContext reactContext, JSONObject jsonObject) {
        try {
            WritableMap locationObj = JsonConvert.jsonToReact(jsonObject);
            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("locationUpdated", locationObj);
        } catch (JSONException | java.lang.RuntimeException e) {
            e.printStackTrace();
            /*errorCB.invoke(e.toString());*/
        }

    }

    private void initAlertDialog() {


    }

    private void getLocation() {

        SmartLocation.with(currentActivity)
                .location()
                .config(LocationParams.NAVIGATION)
                .oneFix()
                .start(new OnLocationUpdatedListener() {
                    @Override
                    public void onLocationUpdated(Location location) {
                        try {
                            JSONObject jsonObject = new JSONObject();
                            jsonObject.put("mocked", location.isFromMockProvider());
                            jsonObject.put("timestamp", location.getTime());
                            JSONObject coordsObject = new JSONObject();
                            coordsObject.put("speed", location.getSpeed());
                            coordsObject.put("heading", location.getBearing());
                            coordsObject.put("accuracy", location.getAccuracy());
                            coordsObject.put("longitude", location.getLongitude());
                            coordsObject.put("altitude", location.getAltitude());
                            coordsObject.put("latitude", location.getLatitude());
                            jsonObject.put("coords", coordsObject);
                            successCB.invoke(JsonConvert.jsonToReact(jsonObject));
                        } catch (JSONException | java.lang.RuntimeException e) {
                            e.printStackTrace();
                            /*errorCB.invoke(e.toString());*/
                        }
                    }
                });
    }

    public static void showAlertDialog(final Activity activity) {
        if (alertDialog == null) {
            alertDialog = new AlertDialog
                    .Builder(activity)
                    .setTitle(alertTitle)
                    .setMessage(alertMessage)
                    .setPositiveButton(positiveBtn, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.cancel();
                            Intent callGPSSettingIntent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS);
                            activity.startActivityForResult(callGPSSettingIntent, GPS_ENABLED);
                        }
                    })
                    .setNegativeButton(negativeBtn, new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.cancel();
                            alertDialog = null;
                        }
                    })
                    .setOnCancelListener(new DialogInterface.OnCancelListener() {
                        @Override
                        public void onCancel(DialogInterface dialog) {
                            alertDialog = null;
                        }
                    })
                    .setCancelable(isCancelable)
                    .create();
            alertDialog.show();
        } else {
            alertDialog = null;
        }
    }

    public static void hideAlert() {
        if (alertDialog != null && alertDialog.isShowing()) {
            alertDialog.cancel();
            alertDialog = null;
        }
    }


    private void startLocation() {
        boolean isLocationEnabled = SmartLocation.with(currentActivity).location().state().locationServicesEnabled();
        if (isLocationEnabled) {
            getLocation();
        } else {
            showAlertDialog(currentActivity);
        }
    }

    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (requestCode == GPS_ENABLED) {
                currentActivity = activity;
                startLocation();
            }
        }
    };
}
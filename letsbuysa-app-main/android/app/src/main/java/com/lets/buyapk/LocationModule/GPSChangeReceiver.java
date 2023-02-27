package com.lets.buyapk.LocationModule;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;


import io.nlopez.smartlocation.SmartLocation;

/**
 * @author Rutvik Bhatt
 * for WebMob Technologies.
 * Email:adr1.webmobtech@gmail.com.
 * @since 3/9/18.
 * Copyright (c) 2018 WebMob Technologies.
 */

public class GPSChangeReceiver extends BroadcastReceiver {

    private onGPSChangeListener gpsChangeListener;

    public GPSChangeReceiver(onGPSChangeListener gpsChangeListener) {
        this.gpsChangeListener = gpsChangeListener;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        boolean networkAvailable = SmartLocation.with(context).location().state().locationServicesEnabled();
        gpsChangeListener.onGPSChage(networkAvailable);
    }

    public interface onGPSChangeListener {
        void onGPSChage(boolean isGPSEnabled);
    }
}

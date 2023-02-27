package com.lets.buyapk;

import android.app.Application;
import android.util.Log;

import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.PackageList;
import com.facebook.react.bridge.JavaScriptExecutorFactory;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.zopim.android.sdk.api.ZopimChat;
import com.zopim.android.sdk.prechat.EmailTranscript;


import com.lets.buyapk.OpenSettingPackage.OpenSettingsPackage;
import com.lets.buyapk.LocationModule.LocationModulePackage;
import com.lets.buyapk.GetDeeplinkModule.GetDeeplinkPackage;
import com.lets.buyapk.ZendeskModule.RNZendeskChatPackage;
import com.zopim.android.sdk.widget.ChatWidgetService;

import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import com.google.android.gms.common.GooglePlayServicesNotAvailableException;
import com.google.android.gms.common.GooglePlayServicesRepairableException;
import com.google.android.gms.security.ProviderInstaller;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import javax.net.ssl.SSLContext;

import java.security.MessageDigest;
import java.util.List;


public class MainApplication extends androidx.multidex.MultiDexApplication implements ReactApplication {
    private String deeplinkUrl = "none";

    public String getDeeplinkUrl() {
        Log.d("getter============", this.deeplinkUrl);
        return this.deeplinkUrl;
    }

    public void setDeeplinkUrl(String url) {
        Log.d("setter============", url);
        this.deeplinkUrl = url;
    }

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            @SuppressWarnings("UnnecessaryLocalVariable")
            List<ReactPackage> packages = new PackageList(this).getPackages();
            // Packages that cannot be autolinked yet can be added manually here, for example:
            packages.add(new OpenSettingsPackage());
            packages.add(new LocationModulePackage());
            packages.add(new GetDeeplinkPackage());
            packages.add(new RNZendeskChatPackage());
            packages.add(new RNFirebaseNotificationsPackage());
            packages.add(new RNFirebaseCrashlyticsPackage());
            packages.add(new RNFirebaseMessagingPackage());

            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);

        ZopimChat.init("lGF0zOGEZSSxWBCtsyl0665zAOTO8Fdd").emailTranscript(EmailTranscript.DISABLED);
        ChatWidgetService.disable();

        if (android.os.Build.VERSION.SDK_INT < android.os.Build.VERSION_CODES.LOLLIPOP) {
            // Do something for lollipop and above versions
            try {
                // Google Play will install latest OpenSSL
                ProviderInstaller.installIfNeeded(getApplicationContext());
                SSLContext sslContext;
                sslContext = SSLContext.getInstance("TLSv1.2");
                sslContext.init(null, null, null);
                sslContext.createSSLEngine();
            } catch (GooglePlayServicesRepairableException | GooglePlayServicesNotAvailableException
                    | NoSuchAlgorithmException | KeyManagementException e) {
                e.printStackTrace();
            }
        }
    }

}

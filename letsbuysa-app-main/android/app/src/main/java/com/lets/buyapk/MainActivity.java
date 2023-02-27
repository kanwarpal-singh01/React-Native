package com.lets.buyapk;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

//import com.wmt.wmtbug.customview.HelpFloatingButton;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this);
        super.onCreate(savedInstanceState);
        I18nUtil sharedI18nUtilInstance = I18nUtil.getInstance();
        sharedI18nUtilInstance.allowRTL(getApplicationContext(), true);
//        HelpFloatingButton.setup(getApplication(), "c8qy6NQo");
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "LetsBuy";
    }

    @Override
    protected void onPause() {
        super.onPause();
        ((MainApplication) getApplicationContext()).setDeeplinkUrl("");
    }
}

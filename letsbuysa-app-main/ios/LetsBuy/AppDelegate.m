/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "RNSplashScreen.h"
#import <RNGoogleSignin/RNGoogleSignin.h>
#import <FBSDKCoreKit/FBSDKCoreKit.h>
//#import <Buglife/Buglife.h>
#import <React/RCTLinkingManager.h>
#import <ZDCChat/ZDCChat.h>
#import <GoogleMaps/GoogleMaps.h>
#import <Firebase.h>
#import "RNFirebaseNotifications.h"
#import "RNFirebaseMessaging.h"

@import GooglePlaces;
@import GoogleMaps;

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  //Notifications
  [FIRApp configure];
  [RNFirebaseNotifications configure];
  
  
  [[NSUserDefaults standardUserDefaults] setValue:[NSString stringWithFormat:@"%f",[UIApplication sharedApplication].statusBarFrame.size.height] forKey:@"statusBarHeight"];
  
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"LetsBuy"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  [RNSplashScreen show];
  
//  for (NSString *familyName in [UIFont familyNames]){
//    NSLog(@"Family name: %@", familyName);
//    for (NSString *fontName in [UIFont fontNamesForFamilyName:familyName]) {
//      NSLog(@"--Font name: %@", fontName);
//    }
//  }
  
  [GMSServices provideAPIKey:@"AIzaSyBDX5Y_Py4PM-NoWCEPH1O-RUVp6hTfoyc"];
  [GMSPlacesClient provideAPIKey:@"AIzaSyBDX5Y_Py4PM-NoWCEPH1O-RUVp6hTfoyc"];
  [GMSServices provideAPIKey:@"AIzaSyBDX5Y_Py4PM-NoWCEPH1O-RUVp6hTfoyc"];
  
 
  
//  [[Buglife sharedBuglife] startWithEmail:@"nishantn@webmob.tech"];
//  [[Buglife sharedBuglife] setInvocationOptions: LIFEInvocationOptionsShake | LIFEInvocationOptionsScreenshot | LIFEInvocationOptionsFloatingButton];


  dispatch_async(dispatch_get_main_queue(), ^{
    //Zendesk Chat
    
    [ZDCChat initializeWithAccountKey:@"lGF0zOGEZSSxWBCtsyl0665zAOTO8Fdd"];
    [[[ZDCChat instance] overlay] setEnabled:NO];
//    [ChatStyling applyStyling];
    
    [[UINavigationBar appearance] setTintColor: UIColorFromRGB(0xffffff)];
    [[UINavigationBar appearance] setBarTintColor: UIColorFromRGB(0xBAA06F)];
    
    [[ZDCVisitorChatCell appearance] setBubbleBorderColor:UIColorFromRGB(0xBAA06F)];
    [[ZDCAgentChatCell appearance] setBubbleColor:UIColorFromRGB(0xffffff)];
  });
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

//- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url
//  sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
//
//  return [[FBSDKApplicationDelegate sharedInstance] application:application
//                                                        openURL:url
//                                              sourceApplication:sourceApplication
//                                                     annotation:annotation]
//          ||
//          [RCTLinkingManager application:application
//                             openURL:url
//                             sourceApplication:sourceApplication
//                             annotation:annotation];
//}

- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options{
  BOOL handleRCT;

  if ([url.scheme caseInsensitiveCompare:@"com.morb7.letsBuy.payments"] == NSOrderedSame) {
    
    NSLog(@"Get in application %@",url);
       
   //    return [[RNFirebaseLinks instance] application:application openURL:url options:options] || [[Twitter sharedInstance] application:application openURL:url options:options];
     
            // send notification to get payment status
          [[NSNotificationCenter defaultCenter] postNotificationName:@"getStatusOrder" object:url];
            handleRCT = YES;
        } else {
            handleRCT = [RCTLinkingManager application:app openURL:url options:options];
        }
    
  return [[FBSDKApplicationDelegate sharedInstance] application:app openURL:url options:options]
  || [RCTLinkingManager application:app openURL:url options:options]
  || [RNGoogleSignin application:app openURL:url options:options] || handleRCT;
}


- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}





@end

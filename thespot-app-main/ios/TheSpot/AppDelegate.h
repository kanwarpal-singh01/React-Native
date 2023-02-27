#import <React/RCTBridgeDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UNUserNotificationCenter.h>
#import <Firebase/Firebase.h>
#import <FirebaseMessaging/FirebaseMessaging.h>

//@import FIRMessaging

@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate,FIRMessagingDelegate>


@property (nonatomic, strong) UIWindow *window;

@end

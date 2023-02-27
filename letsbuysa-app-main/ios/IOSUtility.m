//
//  IOSUtility.m
//
//  Copyright © 2018 Webmob Technologies. All rights reserved.
//

#import "IOSUtility.h"
#import <React/RCTLog.h>
#import <React/RCTBridge.h>
#import <React/RCTEventDispatcher.h>

@implementation IOSUtility

RCT_EXPORT_MODULE(IOSUtility);

RCT_EXPORT_METHOD(getStatusBarHeight : (RCTResponseSenderBlock)callBack){  
  callBack(@[[NSNull null],[[NSUserDefaults standardUserDefaults] valueForKey:@"statusBarHeight"]]);
 /* dispatch_async(dispatch_get_main_queue(), ^{
    // do work here
    callBack(@[[NSNull null], [NSString stringWithFormat:@"%f",[UIApplication sharedApplication].statusBarFrame.size.height]]);
  });*/
}
@end

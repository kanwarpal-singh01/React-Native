//
//  HyperPayModule.h
//  LetsBuy
//
//  Created by MAC-6 on 16/12/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>
#import <OPPWAMobile/OPPWAMobile.h>


NS_ASSUME_NONNULL_BEGIN

@interface HyperPayModule : NSObject <RCTBridgeModule, OPPCheckoutProviderDelegate,PKPaymentAuthorizationViewControllerDelegate>

@end

NS_ASSUME_NONNULL_END

//
//  HyperPayModule.m
//  LetsBuy
//
//  Created by MAC-6 on 16/12/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import "HyperPayModule.h"
#import <React/RCTLog.h>
#import <OPPWAMobile/OPPWAMobile.h>
#import <PassKit/PassKit.h>

//https://docs.oppwa.com/tutorials/mobile-sdk/apple-pay


@implementation HyperPayModule

RCTResponseSenderBlock onDoneClick;
RCTResponseSenderBlock onCancelClick;
UIViewController *rootViewController;
NSString *myCheckOutId;
NSString *isRedirect;

OPPPaymentProvider *provider;
OPPCheckoutProvider *checkoutProvider;
RCT_EXPORT_MODULE(HyperPayModule);

- (instancetype)init{
    self = [super init];
    if (self) {
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(getStatusOder:) name:@"getStatusOrder" object:nil];
//      provider = [OPPPaymentProvider paymentProviderWithMode:OPPProviderModeLive];

    }
    return self;
}

// Request Applepay
RCT_EXPORT_METHOD(openHyperPayInBuildUI:(NSString *)checkOutId  amount:(NSString*)amount type:(NSString *)type createDialog:(RCTResponseSenderBlock)doneCallback createDialog:(RCTResponseSenderBlock)cancelCallback) {

  myCheckOutId = checkOutId;
  onDoneClick = doneCallback;
  onCancelClick = cancelCallback;
  NSArray *events = @[];
    provider = [OPPPaymentProvider paymentProviderWithMode:OPPProviderModeLive];
  OPPCheckoutSettings *checkoutSettings = [[OPPCheckoutSettings alloc] init];
    if(![OPPPaymentProvider deviceSupportsApplePay]){
      RCTLogInfo(@"Device Support");
      onCancelClick(@[@"Device not supported applepay", events]);
      return;
    }

    PKPaymentRequest *paymentRequest = [OPPPaymentProvider paymentRequestWithMerchantIdentifier:@"merchant.com.letsbuy" countryCode:@"SA"];
//    paymentRequest.supportedNetworks = @[@"Visa",@"MasterCard"]; // set up supported payment
  paymentRequest.merchantIdentifier = @"merchant.com.letsbuy";
  paymentRequest.currencyCode = @"SAR";

    paymentRequest.paymentSummaryItems = @[[PKPaymentSummaryItem summaryItemWithLabel:type amount:[NSDecimalNumber decimalNumberWithString:amount]]];
    if (@available(iOS 12.1.1, *)) {
      paymentRequest.supportedNetworks = @[PKPaymentNetworkVisa,PKPaymentNetworkMasterCard,PKPaymentNetworkMada];
    } else {
      // Fallback on earlier versions
      paymentRequest.supportedNetworks = @[@"Visa",@"MasterCard"]; // set up supported payment

    }
    
    BOOL canSubmit = [OPPPaymentProvider canSubmitPaymentRequest:paymentRequest];
    
    if(!canSubmit){
      RCTLogInfo(@"Can Submit request");
      onCancelClick(@[@"Apple Pay not supported.", events]);
      return;
    }

  checkoutSettings.applePayPaymentRequest = paymentRequest;
  checkoutSettings.paymentBrands = @[@"APPLEPAY"];
  checkoutSettings.shopperResultURL = @"com.morb7.letsBuy.payments://result";

    checkoutProvider = [OPPCheckoutProvider checkoutProviderWithPaymentProvider:provider checkoutID:checkOutId settings:checkoutSettings];
    checkoutProvider.delegate = self;

  dispatch_async(dispatch_get_main_queue(), ^{
    [checkoutProvider presentCheckoutForSubmittingTransactionCompletionHandler:^(OPPTransaction * _Nullable transaction, NSError * _Nullable error) {
      if (error) {

              if (isRedirect && ![isRedirect isEqualToString:@"1"]) {
                onCancelClick(@[@"cancel", events]);
              }
              else{
                if(error.code == 2001){
                PKPassLibrary *library = [[PKPassLibrary alloc] init];
                  [library openPaymentSetup];
                }
                onCancelClick(@[error.code == 2001 ? @"Please add payment method in your wallet then try again" : error.localizedDescription, events]);
              }
            } else if (transaction.type == OPPTransactionTypeSynchronous)  {
              RCTLogInfo(@"ios transation is %@", transaction);
              NSDictionary *responeDic = @{@"responeDic" : transaction.resourcePath};
              onDoneClick(@[responeDic, events]);
            }
            else if(transaction.type == OPPTransactionTypeAsynchronous){
//              [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(getStatusOder:) name:@"getStatusOrder" object:nil];
            }else {
              RCTLogInfo(@"ios error 2 is ");
            }
    } cancelHandler:^{
            RCTLogInfo(@"ios error 3 is ");
            onCancelClick(@[@"cancel", events]);
    }];

  });

}

// Request Applepay customUI
RCT_EXPORT_METHOD(openHyperPay:(NSString *)checkOutId  amount:(NSString*)amount type:(NSString *)type createDialog:(RCTResponseSenderBlock)doneCallback createDialog:(RCTResponseSenderBlock)cancelCallback) {

  myCheckOutId = checkOutId;
  onDoneClick = doneCallback;
  onCancelClick = cancelCallback;
  NSArray *events = @[];
  provider = [OPPPaymentProvider paymentProviderWithMode:OPPProviderModeLive];
  
    if(![OPPPaymentProvider deviceSupportsApplePay]){
      RCTLogInfo(@"Device Support");
      onCancelClick(@[@"Device not supported applepay", events]);
      return;
    }

  PKPaymentRequest *paymentRequest = [OPPPaymentProvider paymentRequestWithMerchantIdentifier:@"merchant.com.letsbuy" countryCode:@"SA"];
  paymentRequest.merchantIdentifier = @"merchant.com.letsbuy";
  paymentRequest.currencyCode = @"SAR";
  paymentRequest.countryCode = @"SA";


    paymentRequest.paymentSummaryItems = @[[PKPaymentSummaryItem summaryItemWithLabel:type amount:[NSDecimalNumber decimalNumberWithString:amount]]];
    if (@available(iOS 12.1.1, *)) {
      paymentRequest.supportedNetworks = @[PKPaymentNetworkVisa,PKPaymentNetworkMasterCard,PKPaymentNetworkMada];
    } else {
      // Fallback on earlier versions
      paymentRequest.supportedNetworks = @[@"Visa",@"MasterCard"]; // set up supported payment

    }
    
    BOOL canSubmit = [OPPPaymentProvider canSubmitPaymentRequest:paymentRequest];
    
    if(!canSubmit){
      RCTLogInfo(@"Can Submit request");
      onCancelClick(@[@"Apple Pay not supported.", events]);
      return;
    }

  dispatch_async(dispatch_get_main_queue(), ^{
    PKPaymentAuthorizationViewController *vc = [[PKPaymentAuthorizationViewController alloc] initWithPaymentRequest:paymentRequest];
    if(vc){
      UIViewController *rootViewController = [[[[UIApplication sharedApplication] delegate] window] rootViewController];
      vc.delegate = self;
        [rootViewController presentViewController:vc animated:YES completion:nil];
    }
  });
}

- (void)paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller didAuthorizePayment:(PKPayment *)payment handler:(void (^)(PKPaymentAuthorizationResult * _Nonnull))completion{

  NSArray *events = @[];

  OPPApplePayPaymentParams *params = [[OPPApplePayPaymentParams alloc] initWithCheckoutID:myCheckOutId tokenData:payment.token.paymentData error:NULL];
  if(params){
    OPPTransaction *transaction = [OPPTransaction transactionWithPaymentParams:params];
      
    [provider submitTransaction:transaction completionHandler:^(OPPTransaction * _Nonnull tra, NSError * _Nullable err) {
      if(err){
        onCancelClick(@[err.localizedDescription, events]);
        PKPaymentAuthorizationResult *errorResult = [[PKPaymentAuthorizationResult alloc] initWithStatus:PKPaymentAuthorizationStatusFailure errors:@[ err ]];
        completion(errorResult);
      }
      else{
        [provider requestCheckoutInfoWithCheckoutID:myCheckOutId completionHandler:^(OPPCheckoutInfo * _Nullable checkoutInfo, NSError * _Nullable error) {
          if(error){
            onCancelClick(@[error.localizedDescription, events]);
            PKPaymentAuthorizationResult *errorResult = [[PKPaymentAuthorizationResult alloc] initWithStatus:PKPaymentAuthorizationStatusFailure errors:@[ error ]];
            completion(errorResult);
            
          }
          else{
                dispatch_async(dispatch_get_main_queue(), ^{

            NSDictionary *responeDic = @{@"responeDic" : checkoutInfo.resourcePath};
              if(checkoutInfo.resourcePath){
                onDoneClick(@[responeDic, events]);
                PKPaymentAuthorizationResult *successResult = [[PKPaymentAuthorizationResult alloc] initWithStatus:PKPaymentAuthorizationStatusSuccess errors:nil];
                  completion(successResult);
              }else{
                onCancelClick(@[@"Checkout info is empty or doesn't contain resource path", events]);
                PKPaymentAuthorizationResult *errorResult = [[PKPaymentAuthorizationResult alloc] initWithStatus:PKPaymentAuthorizationStatusFailure errors:nil];
                completion(errorResult);
              }
                });

          }
        }];
      }
      
    }];

  }
  else{
    onCancelClick(@[@"Checkout info is empty or doesn't contain resource path", events]);

    PKPaymentAuthorizationResult *errorResult = [[PKPaymentAuthorizationResult alloc] initWithStatus:PKPaymentAuthorizationStatusFailure errors:nil];
    completion(errorResult);
  }
}

- (void)getStatusOder:(NSNotification*)noti{
  [checkoutProvider dismissCheckoutAnimated:YES completion:^{
    isRedirect = @"1";
    NSURL *url = noti.object;
    NSString *urlString = [url absoluteString];
    NSLog(@" Result url is %@", urlString);
    if (![urlString isEqualToString:@"com.morb7.letsBuy.payments://result"]) {
      NSArray *events = @[];
      NSDictionary *responeDic = @{@"url" : urlString};
      onDoneClick(@[responeDic, events]);
    }
  }];
}


- (void)paymentAuthorizationViewControllerDidFinish:(nonnull PKPaymentAuthorizationViewController *)controller {
  [controller dismissViewControllerAnimated:true completion:nil];
}


//- (void)paymentAuthorizationViewController(PKPaymentAuthorizationViewController *)controller didAuthorizePayment(PKPayment *)payment

@end










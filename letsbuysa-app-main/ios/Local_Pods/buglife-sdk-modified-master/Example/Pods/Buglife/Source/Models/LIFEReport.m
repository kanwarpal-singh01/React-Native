//
//  LIFEReport.m
//  Copyright (C) 2017 Buglife, Inc.
//  
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//  
//       http://www.apache.org/licenses/LICENSE-2.0
//  
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//
//

#import "LIFEReport.h"
#import "LIFEReproStep.h"
#import "LIFEAppInfo.h"
#import "LIFEDeviceInfo.h"
#import "LIFEReportAttachmentImpl.h"
#import "LIFEMacros.h"
#import "NSArray+LIFEAdditions.h"
#import "NSMutableDictionary+LIFEAdditions.h"

@interface LIFEReport ()

@end

@implementation LIFEReport

#pragma mark - Public methods

- (NSString *)suggestedFilename
{
    return [NSString stringWithFormat:@"report_%.0f.snr", [_creationDate timeIntervalSince1970]];
}

#pragma mark - NSCoding

- (instancetype)initWithCoder:(NSCoder *)coder
{
    self = [super init];
    if (self) {
        for (NSString *key in [[self class] _objectPropertyKeys]) {
            id value = [coder decodeObjectForKey:key];
            [self setValue:value forKey:key];
        }
        
        self.invocationMethod = [coder decodeIntegerForKey:NSStringFromSelector(@selector(invocationMethod))];
        self.submissionAttempts = [coder decodeIntegerForKey:NSStringFromSelector(@selector(submissionAttempts))];
    }
    return self;
}

- (void)encodeWithCoder:(NSCoder *)coder
{
    for (NSString *key in [[self class] _objectPropertyKeys]) {
        id value = [self valueForKey:key];
        [coder encodeObject:value forKey:key];
    }
    
    [coder encodeInteger:self.invocationMethod forKey:NSStringFromSelector(@selector(invocationMethod))];
    [coder encodeInteger:self.submissionAttempts forKey:NSStringFromSelector(@selector(submissionAttempts))];
}

+ (NSArray<NSString *> *)_objectPropertyKeys
{
    return @[LIFE_STRING_FROM_SELECTOR_NAMED(whatHappened),
             LIFE_STRING_FROM_SELECTOR_NAMED(component),
             LIFE_STRING_FROM_SELECTOR_NAMED(reproSteps),
             LIFE_STRING_FROM_SELECTOR_NAMED(expectedResults),
             LIFE_STRING_FROM_SELECTOR_NAMED(actualResults),
             LIFE_STRING_FROM_SELECTOR_NAMED(screenshot),
             LIFE_STRING_FROM_SELECTOR_NAMED(creationDate),
             LIFE_STRING_FROM_SELECTOR_NAMED(logs),
             LIFE_STRING_FROM_SELECTOR_NAMED(appInfo),
             LIFE_STRING_FROM_SELECTOR_NAMED(deviceInfo),
             LIFE_STRING_FROM_SELECTOR_NAMED(userIdentifier),
             LIFE_STRING_FROM_SELECTOR_NAMED(userEmail),
             LIFE_STRING_FROM_SELECTOR_NAMED(attachments),
             LIFE_STRING_FROM_SELECTOR_NAMED(timeZoneName),
             LIFE_STRING_FROM_SELECTOR_NAMED(timeZoneAbbreviation),
             LIFE_STRING_FROM_SELECTOR_NAMED(attributes)];
}

#pragma mark - JSON serialization

- (NSDictionary *)JSONDictionary
{
    LIFEReport *report = self;
    NSMutableDictionary *reportDict = [[NSMutableDictionary alloc] init];
    
    [reportDict life_safeSetObject:report.whatHappened forKey:@"what_happened"];
    [reportDict life_safeSetObject:report.component forKey:@"component"];
    [reportDict life_safeSetObject:report._formattedReproSteps forKey:@"repro_steps"];
    [reportDict life_safeSetObject:report.expectedResults forKey:@"expected_results"];
    [reportDict life_safeSetObject:report.actualResults forKey:@"actual_results"];
    [reportDict life_safeSetObject:report._base64screenshotData forKey:@"base64_screenshot_data"];
    [reportDict life_safeSetObject:report._base64logData forKey:@"base64_log_data"];
    
    [reportDict life_safeSetObject:report.appInfo.bundleShortVersion forKey:@"bundle_short_version"];
    [reportDict life_safeSetObject:report.appInfo.bundleVersion forKey:@"bundle_version"];
    [reportDict life_safeSetObject:report.appInfo.bundleIdentifier forKey:@"bundle_identifier"];
    [reportDict life_safeSetObject:report.appInfo.bundleName forKey:@"bundle_name"];

    [reportDict life_safeSetObject:report.deviceInfo.operatingSystemVersion forKey:@"operating_system_version"];
    [reportDict life_safeSetObject:report.deviceInfo.deviceModel forKey:@"device_model"];
    [reportDict life_safeSetObject:report.deviceInfo.fileSystemSizeInBytes forKey:@"total_capacity_bytes"];
    [reportDict life_safeSetObject:report.deviceInfo.freeFileSystemSizeInBytes forKey:@"free_capacity_bytes"];
    [reportDict life_safeSetObject:report.deviceInfo.freeMemory forKey:@"free_memory_bytes"];
    [reportDict life_safeSetObject:report.deviceInfo.usableMemory forKey:@"total_memory_bytes"];
    [reportDict life_safeSetObject:report.deviceInfo.identifierForVendor forKey:@"device_identifier"];
    [reportDict life_safeSetObject:report.deviceInfo.localeIdentifier forKey:@"locale"];
    [reportDict life_safeSetObject:report.deviceInfo.carrierName forKey:@"carrier_name"];
    [reportDict life_safeSetObject:report.deviceInfo.currentRadioAccessTechnology forKey:@"current_radio_access_technology"];
    [reportDict life_safeSetObject:@(report.deviceInfo.wifiConnected) forKey:@"wifi_connected"];
    [reportDict life_safeSetObject:@(report.deviceInfo.batteryLevel) forKey:@"battery_level"];
    [reportDict life_safeSetObject:report._formattedAttachments forKey:@"attachments"];
    [reportDict life_safeSetObject:report.timeZoneName forKey:@"time_zone_name"];
    [reportDict life_safeSetObject:report.timeZoneAbbreviation forKey:@"time_zone_abbreviation"];
    
    if (report.deviceInfo.batteryState != LIFEDeviceBatteryStateUnknown) {
        [reportDict life_safeSetObject:@(report.deviceInfo.batteryState) forKey:@"battery_state"];
    }
    
    
    [reportDict life_safeSetObject:@(report.deviceInfo.lowPowerMode) forKey:@"low_power_mode"];
    
    [reportDict life_safeSetObject:report.userIdentifier forKey:@"user_identifier"];
    [reportDict life_safeSetObject:report.userEmail forKey:@"user_email"];
    [reportDict life_safeSetObject:@(report.invocationMethod) forKey:@"invocation_method"];
    [reportDict life_safeSetObject:@(report.submissionAttempts) forKey:@"submission_attempts"];
    [reportDict life_safeSetObject:report._formattedCreationDate forKey:@"invoked_at"];
    
    if (self.attributes.count > 0) {
        NSMutableDictionary *attributesJSON = [[NSMutableDictionary alloc] init];
        
        [self.attributes enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key, LIFEAttribute * _Nonnull obj, BOOL * _Nonnull stop) {
            attributesJSON[key] = obj.JSONDictionary;
        }];
        
        [reportDict life_safeSetObject:attributesJSON forKey:@"attributes"];
    }
    
    return [NSDictionary dictionaryWithDictionary:reportDict];
}

- (NSString *)JSONString
{
    LIFEReport *report = self;
    NSMutableString *urlString = [[NSMutableString alloc] init];
    
    if (report.whatHappened != NULL){
        [urlString appendString:@"What Happend : "];
        [urlString appendString:report.whatHappened];
        [urlString appendString:@"\n"];
    }
    
    if (report.component != NULL){
        [urlString appendString:@"component : "];
        [urlString appendString:report.component];
        [urlString appendString:@"\n"];
    }
    
    if (report._formattedReproSteps != NULL){
        [urlString appendString:@"repro_steps : "];
        [urlString appendString:report._formattedReproSteps];
        [urlString appendString:@"\n"];
    }
    
    if (report.expectedResults != NULL){
        [urlString appendString:@"expected_results : "];
        [urlString appendString:report.expectedResults];
        [urlString appendString:@"\n"];
    }
    
    if (report.actualResults != NULL){
        [urlString appendString:@"actual_results : "];
        [urlString appendString:report.actualResults];
        [urlString appendString:@"\n"];
    }
    
    if (report.appInfo.bundleShortVersion != NULL){
        [urlString appendString:@"bundle_short_version : "];
        [urlString appendString:report.appInfo.bundleShortVersion];
        [urlString appendString:@"\n"];
    }
    
    if (report.appInfo.bundleVersion != NULL){
        [urlString appendString:@"bundle_version : "];
        [urlString appendString:report.appInfo.bundleVersion];
        [urlString appendString:@"\n"];
    }
    
    if (report.appInfo.bundleIdentifier != NULL){
        [urlString appendString:@"bundle_identifier : "];
        [urlString appendString:report.appInfo.bundleIdentifier];
        [urlString appendString:@"\n"];
    }
    
    if (report.appInfo.bundleName != NULL){
        [urlString appendString:@"bundle_name : "];
        [urlString appendString:report.appInfo.bundleName];
        [urlString appendString:@"\n"];
    }
    
    if (report.deviceInfo.operatingSystemVersion != NULL){
        [urlString appendString:@"operating_system_version : "];
        [urlString appendString:report.deviceInfo.operatingSystemVersion];
        [urlString appendString:@"\n"];
    }
    
    if (report.deviceInfo.deviceModel != NULL){
        [urlString appendString:@"device_model : "];
        [urlString appendString:report.deviceInfo.deviceModel];
        [urlString appendString:@"\n"];
    }
    
//    if (report.deviceInfo.fileSystemSizeInBytes != NULL){
//        [urlString appendString:@"total_capacity_bytes : "];
//        [urlString appendString:report.deviceInfo.fileSystemSizeInBytes];
//    }
//
//    if (report.deviceInfo.freeFileSystemSizeInBytes != NULL){
//        [urlString appendString:@"free_capacity_bytes : "];
//        [urlString appendString:report.deviceInfo.freeFileSystemSizeInBytes];
//    }
//
//    if (report.deviceInfo.freeMemory != NULL){
//        [urlString appendString:@"free_memory_bytes : "];
//        [urlString appendString:report.deviceInfo.freeMemory];
//    }
//
//    if (report.deviceInfo.usableMemory != NULL){
//        [urlString appendString:@"total_memory_bytes : "];
//        [urlString appendString:report.deviceInfo.usableMemory];
//    }
    
    if (report.deviceInfo.identifierForVendor != NULL){
        [urlString appendString:@"device_identifier : "];
        [urlString appendString:report.deviceInfo.identifierForVendor];
        [urlString appendString:@"\n"];
    }
    
    if (report.deviceInfo.localeIdentifier != NULL){
        [urlString appendString:@"locale : "];
        [urlString appendString:report.deviceInfo.localeIdentifier];
        [urlString appendString:@"\n"];
    }
    
    if (report.deviceInfo.carrierName != NULL){
        [urlString appendString:@"carrier_name : "];
        [urlString appendString:report.deviceInfo.carrierName];
        [urlString appendString:@"\n"];
    }
    
    if (report.deviceInfo.currentRadioAccessTechnology != NULL){
        [urlString appendString:@"current_radio_access_technology : "];
        [urlString appendString:report.deviceInfo.currentRadioAccessTechnology];
        [urlString appendString:@"\n"];
    }
    
//    if (report.deviceInfo.wifiConnected != 0){
//        [urlString appendString:@"wifi_connected : "];
//        [urlString appendString:report.deviceInfo.wifiConnected];
//    }
//
//    if (report.deviceInfo.batteryLevel != NULL){
//        [urlString appendString:@"battery_level : "];
//        [urlString appendString:report.deviceInfo.batteryLevel];
//    }
    
    
    if (report.timeZoneName != NULL){
        [urlString appendString:@"time_zone_name : "];
        [urlString appendString:report.timeZoneName];
        [urlString appendString:@"\n"];
    }
    
    
    if (report.timeZoneAbbreviation != NULL){
        [urlString appendString:@"time_zone_abbreviation : "];
        [urlString appendString:report.timeZoneAbbreviation];
        [urlString appendString:@"\n"];
    }
    
    
    
//    if (report.deviceInfo.batteryState != LIFEDeviceBatteryStateUnknown) {
//
//        if (report.deviceInfo.batteryState != NULL){
//            [urlString appendString:@"battery_state : "];
//            [urlString appendString:report.deviceInfo.batteryState];
//        }
//    }
//
//    if (report.deviceInfo.lowPowerMode != NULL){
//        [urlString appendString:@"low_power_mode : "];
//        [urlString appendString:report.deviceInfo.lowPowerMode];
//    }
    
    if (report.userIdentifier != NULL){
        [urlString appendString:@"user_identifier : "];
        [urlString appendString:report.userIdentifier];
        [urlString appendString:@"\n"];
    }
    
    if (report.userEmail != NULL){
        [urlString appendString:@"user_email : "];
        [urlString appendString:report.userEmail];
        [urlString appendString:@"\n"];
    }
//
//    if (report.invocationMethod != NULL){
//        [urlString appendString:@"invocation_method : "];
//        [urlString appendString:report.invocationMethod];
//    }
    
    if (report._formattedCreationDate != NULL){
        [urlString appendString:@"invoked_at : "];
        [urlString appendString:report._formattedCreationDate];
        [urlString appendString:@"\n"];
    }
    
   
    
    return urlString;
}


- (NSString *)_formattedReproSteps
{
    NSMutableArray<NSString *> *reproStepStrings = [[NSMutableArray alloc] init];
    
    [self.reproSteps enumerateObjectsUsingBlock:^(LIFEReproStep *step, NSUInteger index, BOOL *stop) {
        NSString *stepString = [NSString stringWithFormat:@"%@. %@", @(index + 1), step.userDescription];
        [reproStepStrings addObject:stepString];
    }];
    
    if (reproStepStrings.count > 0) {
        return [reproStepStrings componentsJoinedByString:@"\n"];
    } else {
        return nil;
    }
}

- (NSString *)_formattedCreationDate
{
    NSDateFormatter *iso8601DateFormatter = [[NSDateFormatter alloc] init];
    [iso8601DateFormatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ssZZZZ"];
    [iso8601DateFormatter setTimeZone:[NSTimeZone timeZoneForSecondsFromGMT:0]];
    return [iso8601DateFormatter stringFromDate:self.creationDate];
}

- (NSString *)_base64screenshotData
{
    if (self.screenshot) {
        NSData *imageData = UIImagePNGRepresentation(self.screenshot);
        NSString *imageDataString = [imageData base64EncodedStringWithOptions:0];
        return imageDataString;
    }
    
    return nil;
}

- (NSString *)_base64logData
{
    NSData *logData = [self.logs dataUsingEncoding:NSUTF8StringEncoding];
    NSString *base64encodedLogs = [logData base64EncodedStringWithOptions:0];
    return base64encodedLogs;
}

- (NSArray<NSDictionary *> *)_formattedAttachments
{
    return [self.attachments life_map:^id(LIFEReportAttachmentImpl *attachment) {
        return [attachment JSONDictionary];
    }];
}

@end

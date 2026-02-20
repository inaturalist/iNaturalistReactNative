//
//  UIImage+INaturalist.m
//  iNaturalist
//
//  Created by Alex Shepard on 6/15/15.
//  Copyright (c) 2015 iNaturalist. All rights reserved.
//

@import UIColor_HTMLColors;

#import "UIImage+INaturalist.h"

@implementation UIImage (INaturalist)

- (NSData *)inat_JPEGDataRepresentationWithMetadata:(NSDictionary *)metadata quality:(CGFloat)quality {
    NSMutableData *destMutableData = [NSMutableData data];
    
    NSData *jpegData = UIImageJPEGRepresentation(self, quality);
    CGImageSourceRef source = CGImageSourceCreateWithData((CFDataRef)jpegData,
                                                          NULL);
    
    CGImageDestinationRef destination = CGImageDestinationCreateWithData((CFMutableDataRef)destMutableData,
                                                                         (CFStringRef) @"public.jpeg",
                                                                         1,
                                                                         NULL);
    CGImageDestinationAddImageFromSource(destination, source,0, (CFDictionaryRef) metadata);
    CGImageDestinationFinalize(destination);
    
    CFRelease(destination);
    CFRelease(source);
    
    return [NSData dataWithData:destMutableData];
}


@end

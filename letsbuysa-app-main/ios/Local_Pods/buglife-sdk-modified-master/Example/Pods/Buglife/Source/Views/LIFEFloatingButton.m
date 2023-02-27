//
//  LIFEFloatingButton.m
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

#import "LIFEFloatingButton.h"
#import "LIFEUserDefaults.h"
#import "UIBezierPath+LIFEAdditions.h"
#import "LIFEMacros.h"

static const CGSize kIntrinsicButtonSize = { 22, 22 };

@interface LIFEFloatingButton ()

@property (nonatomic) UIPanGestureRecognizer *panGestureRecognizer;
@property (nonatomic) CGPoint normalizedCenter;

// For some reason when we apply a rotation transform directly to the button,
// it breaks tap events. So I moved the dragonfly into a separate imageView,
// and just rotate that instead of rotating the entire button.
@property (nonatomic) UIImageView *dragonflyImageView;

@end

@implementation LIFEFloatingButton

- (instancetype)init
{
    self = [super init];
    if (self) {
        _panGestureRecognizer = [[UIPanGestureRecognizer alloc] initWithTarget:self action:@selector(_panGestureRecognized:)];
        [self addGestureRecognizer:_panGestureRecognizer];
        
        NSBundle *bundle = [NSBundle bundleForClass:self.classForCoder];
        NSURL *bundleURL = [[bundle resourceURL] URLByAppendingPathComponent:@"Buglife.bundle"];
        NSBundle *resourceBundle = [NSBundle bundleWithURL:bundleURL];

        UIImage *podImage = [UIImage imageNamed:@"image_name" inBundle:resourceBundle compatibleWithTraitCollection:nil];
        
        NSData* data = [[NSData alloc] initWithBase64EncodedString:@"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" options:0];
        UIImage* image = [UIImage imageWithData:data];
        
        _dragonflyImageView = [[UIImageView alloc] initWithImage:image];
        _dragonflyImageView.contentMode = UIViewContentModeCenter;
        _dragonflyImageView.frame = self.bounds;
        _dragonflyImageView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
//        _dragonflyImageView.backgroundColor = [UIColor redColor];
        [self addSubview:_dragonflyImageView];
        
        [self sizeToFit];
        
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(_orientationDidChange:) name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
        
        self.accessibilityLabel = LIFELocalizedString(LIFEStringKey_ReportABug);
//
        self.foregroundColor = [UIColor redColor]; // Reset to default
        self.backgroundColor = [UIColor greenColor]; // Reset to default
    }
    return self;
}

- (void)dealloc
{
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidChangeStatusBarOrientationNotification object:nil];
}


#pragma mark - UIView

- (void)setCenter:(CGPoint)center
{
    center = [self _centerPointedConstrained:center];

    [super setCenter:center];
    
    if (self.superview != nil) {
        _normalizedCenter.x = center.x / self.superview.bounds.size.width;
        _normalizedCenter.y = center.y / self.superview.bounds.size.height;
    }
}

- (CGSize)sizeThatFits:(CGSize)size
{
    return kIntrinsicButtonSize;
}


- (void)setForegroundColor:(UIColor *)foregroundColor
{
    _foregroundColor = foregroundColor;
    
    
}

- (void)setBackgroundColor:(UIColor *)backgroundColor
{
    _backgroundColor = backgroundColor;
    
    [self setNeedsDisplay];
}



- (void)_panGestureRecognized:(UIPanGestureRecognizer *)panGestureRecognizer
{
    switch (panGestureRecognizer.state) {
        case UIGestureRecognizerStateChanged: {
            CGPoint newPosition = [panGestureRecognizer locationInView:self.superview];
            newPosition = [self _centerPointedConstrained:newPosition];
            self.center = newPosition;
            break;
        }
        case UIGestureRecognizerStateEnded: {
            [[LIFEUserDefaults sharedDefaults] setLastFloatingButtonCenterPoint:self.center];
            break;
        }
        default:
            break;
    }
}

- (void)_orientationDidChange:(NSNotification *)notification
{
    if (self.superview == nil) {
        return;
    }
    
    UIInterfaceOrientation statusBarOrientation = [UIApplication sharedApplication].statusBarOrientation;
    CGFloat angle = LIFEUIInterfaceOrientationAngleOfOrientation(statusBarOrientation);
    CGAffineTransform transform = CGAffineTransformMakeRotation(angle);
    UIViewAnimationOptions options = UIViewAnimationOptionBeginFromCurrentState;
    
    [UIView animateWithDuration:0 delay:0 options:options animations:^{
        self.dragonflyImageView.transform = transform;
    } completion:NULL];
}

- (CGPoint)_centerPointedConstrained:(CGPoint)centerPoint
{
    CGRect bounds = self.superview.bounds;
    
    if (centerPoint.x < CGRectGetMinX(bounds)) {
        centerPoint.x = CGRectGetMinX(bounds);
    } else if (centerPoint.x > CGRectGetMaxX(bounds)) {
        centerPoint.x = CGRectGetMaxX(bounds);
    }
    
    if (centerPoint.y < CGRectGetMinY(bounds)) {
        centerPoint.y = CGRectGetMinY(bounds);
    } else if (centerPoint.y > CGRectGetMaxY(bounds)) {
        centerPoint.y = CGRectGetMaxY(bounds);
    }
    
    return centerPoint;
}

static CGFloat LIFEUIInterfaceOrientationAngleOfOrientation(UIInterfaceOrientation orientation)
{
    CGFloat angle;
    
    switch (orientation)
    {
        case UIInterfaceOrientationPortraitUpsideDown:
            angle = M_PI;
            break;
        case UIInterfaceOrientationLandscapeLeft:
            angle = -M_PI_2;
            break;
        case UIInterfaceOrientationLandscapeRight:
            angle = M_PI_2;
            break;
        default:
            angle = 0.0;
            break;
    }
    
    return angle;
}

@end

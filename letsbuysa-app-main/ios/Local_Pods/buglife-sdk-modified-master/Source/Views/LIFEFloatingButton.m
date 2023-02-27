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

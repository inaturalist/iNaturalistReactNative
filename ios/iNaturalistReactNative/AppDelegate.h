#import <UIKit/UIKit.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>

// Kept for code (e.g. RN's RCTLogBoxView) that still reaches into
// AppDelegate.window instead of resolving the key window via UIScene —
// without this, such a call is an unrecognized selector on a non-nil object
// and crashes (SIGABRT), rather than the harmless nil-message it would be if
// this class had no window property at all.
@property (nonatomic, readonly, nullable) UIWindow *window;

@end

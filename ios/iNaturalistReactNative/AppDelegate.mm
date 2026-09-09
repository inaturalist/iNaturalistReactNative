#import "AppDelegate.h"

#import <Firebase.h>
#import <React/RCTUtils.h>

@interface AppDelegate ()
@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Required for react-native-firebase: https://rnfirebase.io/#configure-firebase-with-ios-credentials-react-native--077
  [FIRApp configure];

  return YES;
}

- (UIWindow *)window
{
  return RCTKeyWindow();
}

@end

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <RNShareMenu/ShareMenuManager.h>
#import <React/RCTLinkingManager.h>

@interface AppDelegate ()
@end

@implementation AppDelegate

// https://reactnative.dev/docs/linking#get-the-deep-link
- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  BOOL handledByShareMenu = [ShareMenuManager application:app openURL:url options:options];
  BOOL handledByLinkingManager = [RCTLinkingManager application:app openURL:url options:options];

  // Return YES if either of the managers can handle the URL
  return handledByShareMenu || handledByLinkingManager;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity
 restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler
{
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:self];
  self.dependencyProvider = [RCTAppDependencyProvider new];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];

  [self.reactNativeFactory startReactNativeWithModuleName:@"iNaturalistReactNative"
                                                 inWindow:self.window
                                        initialProperties:@{}
                                            launchOptions:launchOptions];

  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}
 
- (NSURL *)bundleURL
{
#if DEBUG
  return [RCTBundleURLProvider.sharedSettings jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

#import "SceneDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <ReactAppDependencyProvider/RCTAppDependencyProvider.h>
#import <RNShareMenu/ShareMenuManager.h>

@interface SceneDelegate ()
@end

@implementation SceneDelegate

// RN's own scene-aware bootstrap/linking APIs (RCTReactNativeFactory's
// startReactNative...connectionOptions: and RCTLinkingManager's scene:... methods)
// aren't in our pinned React Native version yet, so this hand-rolls the
// equivalent of the pre-scene AppDelegate flow on top of UIScene lifecycle.
// TODO: once RN ships official SceneDelegate support (tracked upstream in
// facebook/react-native's SceneDelegate migration), switch to those APIs.
- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;

  self.reactNativeFactory = [[RCTReactNativeFactory alloc] initWithDelegate:self];
  self.dependencyProvider = [RCTAppDependencyProvider new];

  self.window = [[UIWindow alloc] initWithWindowScene:windowScene];

  // Reconstruct the pieces of launchOptions that iOS used to hand to
  // application:didFinishLaunchingWithOptions: for a cold launch via URL or
  // universal link, so RCTLinkingManager's getInitialURL() keeps working.
  NSMutableDictionary *launchOptions = [NSMutableDictionary dictionary];
  UIOpenURLContext *urlContext = connectionOptions.URLContexts.anyObject;
  NSUserActivity *userActivity = connectionOptions.userActivities.anyObject;
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  if (urlContext != nil) {
    launchOptions[UIApplicationLaunchOptionsURLKey] = urlContext.URL;
  } else if (userActivity != nil) {
    // RCTLinkingManager.getInitialURL() reads this back out via the literal
    // string "UIApplicationLaunchOptionsUserActivityKey" (there is no public
    // UIKit constant for it), so we must match that key exactly here.
    launchOptions[UIApplicationLaunchOptionsUserActivityDictionaryKey] = @{
      UIApplicationLaunchOptionsUserActivityTypeKey : userActivity.activityType,
      @"UIApplicationLaunchOptionsUserActivityKey" : userActivity,
    };
  }
#pragma clang diagnostic pop

  [self.reactNativeFactory startReactNativeWithModuleName:@"iNaturalistReactNative"
                                                 inWindow:self.window
                                        initialProperties:@{}
                                            launchOptions:launchOptions];

  // Unlike RCTLinkingManager (which reads its initial URL back out of
  // launchOptions above), ShareMenuManager's cold-launch handoff only
  // happens through this application:openURL:options: call — under the old
  // AppDelegate-only lifecycle iOS made this same call right after
  // didFinishLaunchingWithOptions: for a cold URL-launch, but UIScene
  // delivers cold-launch URLs solely via connectionOptions here, never via
  // scene:openURLContexts:. Without this, sharing to the app while it's not
  // running silently drops the share.
  if (urlContext != nil) {
    [ShareMenuManager application:[UIApplication sharedApplication]
                           openURL:urlContext.URL
                           options:[self openURLOptionsFromSceneOptions:urlContext.options]];
  }
}

// Warm-launch equivalent of AppDelegate's application:openURL:options: —
// handles custom-scheme deep links and the share extension handoff.
- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  for (UIOpenURLContext *context in URLContexts) {
    NSDictionary<UIApplicationOpenURLOptionsKey, id> *options = [self openURLOptionsFromSceneOptions:context.options];

    // https://reactnative.dev/docs/linking#get-the-deep-link
    [ShareMenuManager application:[UIApplication sharedApplication] openURL:context.URL options:options];
    [RCTLinkingManager application:[UIApplication sharedApplication] openURL:context.URL options:options];
  }
}

- (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)openURLOptionsFromSceneOptions:(UISceneOpenURLOptions *)sceneOptions
{
  NSMutableDictionary<UIApplicationOpenURLOptionsKey, id> *options = [NSMutableDictionary dictionary];
  if (sceneOptions.sourceApplication != nil) {
    options[UIApplicationOpenURLOptionsSourceApplicationKey] = sceneOptions.sourceApplication;
  }
  if (sceneOptions.annotation != nil) {
    options[UIApplicationOpenURLOptionsAnnotationKey] = sceneOptions.annotation;
  }
  options[UIApplicationOpenURLOptionsOpenInPlaceKey] = @(sceneOptions.openInPlace);
  return options;
}

// Warm-launch equivalent of AppDelegate's application:continueUserActivity:restorationHandler:
// (universal links).
- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
  [RCTLinkingManager application:[UIApplication sharedApplication]
             continueUserActivity:userActivity
               restorationHandler:^(NSArray<id<UIUserActivityRestoring>> *_Nullable restorableObjects){
               }];
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

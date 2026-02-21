#import "NativeNewsView.h"

#import <React/RCTConversions.h>
#import <UIKit/UIKit.h>

#import <react/renderer/components/NativeNewsViewSpec/ComponentDescriptors.h>
#import <react/renderer/components/NativeNewsViewSpec/Props.h>
#import <react/renderer/components/NativeNewsViewSpec/RCTComponentViewHelpers.h>

#import "RCTFabricComponentsPlugins.h"
#import "SiteNewsViewController.h"

using namespace facebook::react;

@implementation NativeNewsView {
    UIView * _view;
    SiteNewsViewController * _siteNewsViewController;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
    return concreteComponentDescriptorProvider<NativeNewsViewComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const NativeNewsViewProps>();
    _props = defaultProps;

    _view = [[UIView alloc] init];
    self.contentView = _view;

    NSBundle *bundle = [NSBundle bundleForClass:[SiteNewsViewController class]];
    UIStoryboard *storyboard = [UIStoryboard storyboardWithName:@"Activity" bundle:bundle];
    _siteNewsViewController = [storyboard instantiateViewControllerWithIdentifier:@"SiteNewsViewController"];
    UIView *newsView = _siteNewsViewController.view;
    newsView.frame = _view.bounds;
    newsView.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [_view addSubview:newsView];
  }

  return self;
}

- (void)layoutSubviews
{
  [super layoutSubviews];
  _siteNewsViewController.view.frame = self.contentView.bounds;
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
    const auto &oldViewProps = *std::static_pointer_cast<NativeNewsViewProps const>(_props);
    const auto &newViewProps = *std::static_pointer_cast<NativeNewsViewProps const>(props);

    [super updateProps:props oldProps:oldProps];
}

@end

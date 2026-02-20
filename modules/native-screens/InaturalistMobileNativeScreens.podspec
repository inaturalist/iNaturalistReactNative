require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "InaturalistMobileNativeScreens"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => min_ios_version_supported }
  s.source       = { :git => "https://github.com/jtklein/inaturalist-mobile-native-screens.git", :tag => "#{s.version}" }

  s.dependency "AFNetworking", "3.2.0"
  s.dependency "ARSafariActivity"
  s.dependency "UIColor-HTMLColors", "1.0.0"
  s.dependency "NSString_stripHtml", "0.1.0"
  s.dependency "Mantle", "1.5.8"
  s.dependency "SVPullToRefresh", "0.4.1"

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"
  s.resources = "ios/User Interface/**/*.storyboard"

  install_modules_dependencies(s)
end

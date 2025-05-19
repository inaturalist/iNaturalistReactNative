# frozen_string_literal: true

source "https://rubygems.org"
# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Cocoapods 1.15 introduced a bug which break the build. We will remove the upper
# bound in the template on Cocoapods with next React Native release.
gem "activesupport", ">= 6.1.7.5", "< 7.1.0"
gem "cocoapods", ">= 1.13", "< 1.15"
gem 'xcodeproj', '< 1.26.0'
gem 'concurrent-ruby', '<= 1.3.4'

gem "fastlane"
# Temporary workaround for https://github.com/fastlane/fastlane/issues/26682
gem "fastlane-sirp", git: "https://github.com/appbot/fastlane-sirp.git", ref: "sysrandom_fix"
gem "nokogiri"
gem "rubocop"

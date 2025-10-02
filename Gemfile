# frozen_string_literal: true

source "https://rubygems.org"
# You may use http://rbenv.org/ or https://rvm.io/ to install and use this version
ruby ">= 2.6.10"

# Exclude problematic versions of cocoapods and activesupport that causes build failures.
gem "activesupport", ">= 6.1.7.5", "!= 7.1.0"
gem "cocoapods", ">= 1.13", "!= 1.15.0", "!= 1.15.1"
gem "concurrent-ruby", "< 1.3.4"
gem "xcodeproj", "< 1.26.0"

# Ruby 3.4.0 has removed some libraries from the standard library.
gem "benchmark"
gem "bigdecimal"
gem "logger"
gem "mutex_m"

gem "fastlane"
# Temporary workaround for https://github.com/fastlane/fastlane/issues/26682
gem "fastlane-sirp", git: "https://github.com/appbot/fastlane-sirp.git", ref: "sysrandom_fix"
# Currently fastlane support for ruby 3.4.x is not finished, so we need to add
# this here because fastlane does not specifically add this dependency.
gem "abbrev"

gem "nokogiri"
gem "rubocop"

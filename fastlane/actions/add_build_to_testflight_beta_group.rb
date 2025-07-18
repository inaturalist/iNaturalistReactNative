# frozen_string_literal: true

module Fastlane
  module Actions
    class AddBuildToTestflightBetaGroupAction < Action
      def self.run( params )
        # This is not the login technique documented at
        # https://github.com/fastlane/fastlane/blob/master/spaceship/docs/AppStoreConnect.md#login,
        # but it seems to work
        Spaceship::Tunes.login
        ios_bundle_id = CredentialsManager::AppfileConfig.try_fetch_value( :app_identifier )
        app = Spaceship::ConnectAPI::App.find( ios_bundle_id )
        builds = app.get_builds
        target_build = builds.detect {| build | build.version == params[:version_code] }
        beta_group = app.get_beta_groups.detect {| group | group.name == params[:beta_group] }
        target_build.add_beta_groups( beta_groups: [beta_group] )
      end

      def self.description
        "Adds a build to an existing TestFlight beta group"
      end

      def self.details
        <<-DESC
          Adds an existing TestFlight build, identified by its version, to an
          existing TestFlight beta group, identified by its name
        DESC
      end

      def self.available_options
        [
          FastlaneCore::ConfigItem.new(
            key: :version_code,
            env_name: "FL_ADD_BUILD_TO_TESTFLIGHT_BETA_GROUP_VERSION",
            description: "Version of the build",
            verify_block: proc do | value |
              unless value && !value.empty?
                UI.user_error!( "No build version_code provided, pass using `version_code: '123'`" )
              end
            end
          ),
          FastlaneCore::ConfigItem.new(
            key: :beta_group,
            env_name: "FL_ADD_BUILD_TO_TESTFLIGHT_BETA_GROUP_BETA_GROUP",
            description: "Name of the beta group",
            verify_block: proc do | value |
              unless value && !value.empty?
                UI.user_error!(
                  "No beta group provided, pass using `beta_group: 'Your Beta Group Name'`"
                )
              end
            end
          )
        ]
      end

      def self.authors
        # So no one will ever forget your contribution to fastlane :) You are awesome btw!
        ["kueda"]
      end

      # rubocop:disable Naming/PredicatePrefix
      def self.is_supported?( platform )
        platform == :ios
      end
      # rubocop:enable Naming/PredicatePrefix
    end
  end
end

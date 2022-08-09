import { useFocusEffect } from "@react-navigation/native";
import { t } from "i18next";
import inatjs from "inaturalistjs";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View
} from "react-native";

import { textStyles, viewStyles } from "../../styles/settings/settings";
import { getAPIToken } from "../LoginSignUp/AuthenticationService";
import ViewWithFooter from "../SharedComponents/ViewWithFooter";
import useUserMe from "./hooks/useUserMe";
import SettingsAccount from "./SettingsAccount";
import SettingsApplications from "./SettingsApplications";
import SettingsContentDisplay from "./SettingsContentDisplay";
import {
  EMAIL_NOTIFICATIONS,
  SettingsNotifications
} from "./SettingsNotifications";
import SettingsProfile from "./SettingsProfile";
import SettingsRelationships from "./SettingsRelationships";

const TAB_TYPE_PROFILE = "profile";
const TAB_TYPE_ACCOUNT = "account";
const TAB_TYPE_NOTIFICATIONS = "notifications";
const TAB_TYPE_RELATIONSHIPS = "relationships";
const TAB_TYPE_CONTENT_DISPLAY = "content_display";
const TAB_TYPE_APPLICATIONS = "applications";

// List of all user settings that will be saved (when calling the API to update the settings).
// $FlowIgnore
const emailNotificationsValues: Array<string> = Object.values( EMAIL_NOTIFICATIONS );
const SETTINGS_PROPERTIES_LIST: Array<string> = [
  "login",
  "email",
  "name",
  "description",
  "prefers_receive_mentions",
  "prefers_redundant_identification_notifications",
  "prefers_no_email",
  "time_zone",
  "locale",
  "search_place_id",
  "prefers_no_tracking",
  "site_id",
  "preferred_project_addition_by",
  "prefers_common_names",
  "prefers_scientific_name_first",
  "place_id",
  "prefers_community_taxa",
  "preferred_observation_fields_by",
  "preferred_observation_license",
  "preferred_photo_license",
  "preferred_sound_license",
  "make_observation_licenses_same",
  "make_photo_licenses_same",
  "make_sound_licenses_same",
  ...emailNotificationsValues
];

type Props = {
  children: React.Node,
};

const SettingsTabs = ( { activeTab, onTabPress } ): React.Node => (
  <View style={[viewStyles.tabsRow, viewStyles.shadow]}>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_PROFILE )}
      accessibilityRole="link"
    >
      <Text
        style={activeTab === TAB_TYPE_PROFILE ? textStyles.activeTab : null}
      >
        {t( "Profile" )}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_ACCOUNT )}
      accessibilityRole="link"
    >
      <Text
        style={activeTab === TAB_TYPE_ACCOUNT ? textStyles.activeTab : null}
      >
        {t( "Account" )}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_NOTIFICATIONS )}
      accessibilityRole="link"
    >
      <Text
        style={
              activeTab === TAB_TYPE_NOTIFICATIONS ? textStyles.activeTab : null
            }
      >
        {t( "Notifications" )}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_RELATIONSHIPS )}
      accessibilityRole="link"
    >
      <Text
        style={
              activeTab === TAB_TYPE_RELATIONSHIPS ? textStyles.activeTab : null
            }
      >
        {t( "Relationships" )}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_CONTENT_DISPLAY )}
      accessibilityRole="link"
    >
      <Text
        style={
              activeTab === TAB_TYPE_CONTENT_DISPLAY
                ? textStyles.activeTab
                : null
            }
      >
        {t( "Content-Display" )}
      </Text>
    </Pressable>
    <Pressable
      onPress={() => onTabPress( TAB_TYPE_APPLICATIONS )}
      accessibilityRole="link"
    >
      <Text
        style={
              activeTab === TAB_TYPE_APPLICATIONS ? textStyles.activeTab : null
            }
      >
        {t( "Applications" )}
      </Text>
    </Pressable>
  </View>
);

const Settings = ( { children: _children }: Props ): Node => {
  const [activeTab, setActiveTab] = useState( TAB_TYPE_PROFILE );
  const [settings, setSettings] = useState( {} );
  const [accessToken, setAccessToken] = useState( null );
  const [isLoading, setIsLoading] = useState( true );
  const [isSaving, setIsSaving] = useState( false );
  const user = useUserMe( accessToken );

  const fetchProfile = useCallback( async () => {
    if ( user ) {
      console.log( "User object", user );
      setSettings( user );
      setIsLoading( false );
    }
  }, [user] );

  useEffect( () => {
    if ( accessToken !== null ) {
      fetchProfile();
    }
  }, [accessToken, fetchProfile] );

  const saveSettings = async () => {
    setIsSaving( true );
    const payload = {
      id: settings?.id
    };
    SETTINGS_PROPERTIES_LIST.forEach( ( v: string ) => {
      payload[`user[${v}]`] = settings[v];
    } );

    if ( settings.removeProfilePhoto ) {
      payload.icon_delete = true;
    }
    if ( settings.newProfilePhoto ) {
      payload["user[icon]"] = {
        type: "custom",
        value: {
          uri: settings.newProfilePhoto.uri,
          type: settings.newProfilePhoto.type,
          name: settings.newProfilePhoto.fileName
        }
      };
    }

    console.log( "Payload", payload );
    let response;
    try {
      response = await inatjs.users.update( payload, {
        api_token: accessToken
      } );
    } catch ( e ) {
      console.error( e );
      Alert.alert(
        "Error",
        "Couldn't save settings!",
        [{ text: "OK" }],
        {
          cancelable: true
        }
      );
      setIsSaving( false );
      return;
    }

    console.log( "Updated user", response );
    const userResponse = await inatjs.users.me( { api_token: accessToken, fields: "all" } );
    console.log( "User object", userResponse.results[0] );
    setSettings( userResponse.results[0] );
    setIsSaving( false );
  };

  useFocusEffect(
    React.useCallback( () => {
      // Reload the settings
      getAPIToken( true ).then( token => {
        setAccessToken( token );
      } );

      return () => {
        // De-focused - clean up the access token (this will force a refresh
        // later when we're re-focused)
        setAccessToken( null );
      };
    }, [] )
  );

  return (
    <ViewWithFooter>
      <SafeAreaView style={viewStyles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={viewStyles.headerRow}>
          <Text style={textStyles.header}>{t( "Settings" )}</Text>
          <Button
            title="Save"
            onPress={saveSettings}
            disabled={isLoading || isSaving}
          />
        </View>
        <SettingsTabs activeTab={activeTab} onTabPress={setActiveTab} />
        {isLoading ? (
          <ActivityIndicator size="large" />
        ) : (
          <ScrollView>
            {activeTab === TAB_TYPE_PROFILE && (
              <SettingsProfile
                settings={settings}
                onSettingsModified={setSettings}
              />
            )}
            {activeTab === TAB_TYPE_ACCOUNT && (
              <SettingsAccount
                settings={settings}
                onSettingsModified={setSettings}
              />
            )}
            {activeTab === TAB_TYPE_NOTIFICATIONS && (
              <SettingsNotifications
                settings={settings}
                onSettingsModified={setSettings}
              />
            )}
            {activeTab === TAB_TYPE_CONTENT_DISPLAY && (
              <SettingsContentDisplay
                settings={settings}
                onSettingsModified={setSettings}
              />
            )}
            {activeTab === TAB_TYPE_APPLICATIONS && (
              <SettingsApplications accessToken={accessToken} />
            )}
            {activeTab === TAB_TYPE_RELATIONSHIPS && (
              <SettingsRelationships
                settings={settings}
                accessToken={accessToken}
                onRefreshUser={fetchProfile}
              />
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </ViewWithFooter>
  );
};

export default Settings;

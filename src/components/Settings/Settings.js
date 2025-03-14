import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  signOut
} from "components/LoginSignUp/AuthenticationService.ts";
import {
  ActivityIndicator,
  Body2,
  Button,
  Heading4,
  RadioButtonRow,
  ScrollViewWrapper
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts.ts";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  StatusBar,
  View
} from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";
import QueueItem from "realmModels/QueueItem.ts";
import {
  useCurrentUser,
  useLayoutPrefs,
  useTranslation,
  useUserMe
} from "sharedHooks";

import LanguageSetting from "./LanguageSetting";
import TaxonNamesSetting from "./TaxonNamesSetting";

const { useRealm } = RealmContext;

const SETTINGS_URL = `${Config.OAUTH_API_URL}/users/edit?noh1=true`;
const FINISHED_WEB_SETTINGS = "finished-web-settings";

const Settings = ( ) => {
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation( );
  const { t } = useTranslation();
  const currentUser = useCurrentUser( );
  const {
    remoteUser, isLoading, refetchUserMe
  } = useUserMe( { updateRealm: false } );
  const {
    isDefaultMode,
    isAllAddObsOptionsMode,
    setIsDefaultMode,
    setIsAllAddObsOptionsMode,
    isAdvancedSuggestionsMode,
    setIsSuggestionsFlowMode
  } = useLayoutPrefs();
  const [settings, setSettings] = useState( {} );
  const [isSaving, setIsSaving] = useState( false );
  const [showingWebViewSettings, setShowingWebViewSettings] = useState( false );

  useFocusEffect(
    useCallback( () => {
      if ( showingWebViewSettings ) {
        // When we get back from the webview of settings - in case the user updated their profile
        // photo or other details
        refetchUserMe();
        setShowingWebViewSettings( false );
      }
    }, [showingWebViewSettings, refetchUserMe] )
  );

  const confirmInternetConnection = useCallback( ( ) => {
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return isConnected;
  }, [t, isConnected] );

  const queryClient = useQueryClient();

  useEffect( () => {
    if ( remoteUser ) {
      setSettings( remoteUser );
      setIsSaving( false );
    }
  }, [remoteUser, realm] );

  // Listen for the webview to finish so we can fetch the updates users/me
  // response
  useEffect( ( ) => {
    const listener = EventRegister.addEventListener(
      FINISHED_WEB_SETTINGS,
      refetchUserMe
    );
    return ( ) => {
      EventRegister?.removeEventListener( listener );
    };
  }, [refetchUserMe] );

  const renderLoggedIn = ( ) => (
    <View>
      {( isSaving || isLoading ) && (
        <View className="absolute z-10 bg-white/80
         w-full h-full flex items-center justify-center"
        >
          <ActivityIndicator size={50} />
        </View>
      )}
      <TaxonNamesSetting
        onChange={options => {
          QueueItem.enqueue(
            realm,
            JSON.stringify( {
              id: settings.id,
              user: {
                prefers_common_names: options.prefers_common_names,
                prefers_scientific_name_first: options.prefers_scientific_name_first
              }
            } ),
            "taxon-names-change"
          );
        }}
      />
      <LanguageSetting
        onChange={newLocale => {
          QueueItem.enqueue(
            realm,
            JSON.stringify( {
              id: settings.id,
              user: {
                locale: newLocale
              }
            } ),
            "locale-change"
          );
        }}
      />
      <View>
        <Heading4>{t( "INATURALIST-ACCOUNT-SETTINGS" )}</Heading4>
        <Body2 className="mt-2">{t( "Edit-your-profile-change-your-settings" )}</Body2>
        <Button
          className="mt-4"
          text={t( "ACCOUNT-SETTINGS" )}
          onPress={() => {
            confirmInternetConnection( );
            if ( !isConnected ) { return; }
            setShowingWebViewSettings( true );

            navigation.navigate( "FullPageWebView", {
              title: t( "ACCOUNT-SETTINGS" ),
              loggedIn: true,
              initialUrl: SETTINGS_URL,
              blurEvent: FINISHED_WEB_SETTINGS,
              clickablePathnames: ["/users/delete"],
              skipSetSourceInShouldStartLoadWithRequest: true,
              shouldLoadUrl: url => {
                async function signOutGoHome() {
                  Alert.alert(
                    t( "Account-Deleted" ),
                    t( "It-may-take-up-to-an-hour-to-remove-content" )
                  );
                  // sign out
                  await signOut( { realm, clearRealm: true, queryClient } );
                  // revert back to default mode
                  setIsDefaultMode( true );
                  // navigate to My Obs
                  navigation.navigate( "ObsList" );
                }
                // If the webview navigates to a URL that indicates the account
                // was deleted, sign the current user out of the app
                if ( url === `${Config.OAUTH_API_URL}/?account_deleted=true` ) {
                  signOutGoHome( );
                  return false;
                }
                return true;
              }
            } );
          }}
          accessibilityLabel={t( "INATURALIST-SETTINGS" )}
        />
      </View>
    </View>
  );

  return (
    <ScrollViewWrapper>
      <StatusBar barStyle="dark-content" />
      <View className="p-5">
        <View className="mb-9">
          <Heading4>{t( "INATURALIST-MODE" )}</Heading4>
          <View className="mt-[22px]">
            <RadioButtonRow
              smallLabel
              checked={isDefaultMode}
              onPress={( ) => {
                setIsDefaultMode( true );
                setIsAllAddObsOptionsMode( false );
              }}
              label={t( "Default--interface-mode" )}
            />
          </View>
          <View className="mt-4">
            <RadioButtonRow
              testID="advanced-interface-option"
              smallLabel
              checked={!isDefaultMode}
              onPress={( ) => {
                setIsDefaultMode( false );
                setIsAllAddObsOptionsMode( true );
              }}
              label={t( "Advanced--interface-mode-with-explainer" )}
            />
          </View>
        </View>
        {!isDefaultMode && (
          <View className="mb-9">
            <Heading4>{t( "OBSERVATION-BUTTON" )}</Heading4>
            <Body2 className="mt-3">{t( "When-tapping-the-green-observation-button" )}</Body2>
            <View className="mt-[22px] pr-5">
              <RadioButtonRow
                smallLabel
                checked={!isAllAddObsOptionsMode}
                onPress={() => setIsAllAddObsOptionsMode( false )}
                label={t( "iNaturalist-AI-Camera" )}
              />
            </View>
            <View className="mt-4 pr-5">
              <RadioButtonRow
                testID="all-observation-options"
                smallLabel
                checked={isAllAddObsOptionsMode}
                onPress={() => setIsAllAddObsOptionsMode( true )}
                label={t( "All-observation-options" )}
              />
            </View>
          </View>
        )}
        {!isDefaultMode && (
          <View className="mb-9">
            <Heading4>{t( "SUGGESTIONS" )}</Heading4>
            <Body2 className="mt-3">
              {t( "After-capturing-or-importing-photos-show" )}
            </Body2>
            <View className="mt-4 pr-5">
              <RadioButtonRow
                testID="suggestions-flow-mode"
                smallLabel
                checked={isAdvancedSuggestionsMode}
                onPress={() => setIsSuggestionsFlowMode( true )}
                label={t( "ID-Suggestions" )}
              />
            </View>
            <View className="mt-[22px] pr-5">
              <RadioButtonRow
                smallLabel
                checked={!isAdvancedSuggestionsMode}
                onPress={() => setIsSuggestionsFlowMode( false )}
                label={t( "Edit-Observation" )}
              />
            </View>
          </View>
        )}
        {currentUser && renderLoggedIn()}
      </View>
    </ScrollViewWrapper>
  );
};

export default Settings;

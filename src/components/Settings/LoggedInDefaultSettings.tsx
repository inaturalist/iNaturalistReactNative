import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import {
  signOut
} from "components/LoginSignUp/AuthenticationService";
import {
  ActivityIndicator,
  Body2,
  Button,
  Heading4
} from "components/SharedComponents";
import { RealmContext } from "providers/contexts";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  View
} from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";
import QueueItem from "realmModels/QueueItem";
import {
  useLayoutPrefs,
  useTranslation,
  useUserMe
} from "sharedHooks";

import LanguageSetting from "./LanguageSetting";
import TaxonNamesSetting from "./TaxonNamesSetting";

const { useRealm } = RealmContext;

const SETTINGS_URL = `${Config.OAUTH_API_URL}/users/edit?noh1=true`;
const FINISHED_WEB_SETTINGS = "finished-web-settings";

const LoggedInDefaultSettings = ( ) => {
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const {
    remoteUser, isLoading, refetchUserMe
  } = useUserMe( { updateRealm: false } );
  const {
    setIsDefaultMode
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
      // logger.info( remoteUser, "remote user fetched in Settings" );
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

  return (
    <View className="mt-[30px]">
      {( isSaving || isLoading ) && (
        <View className="absolute z-10 bg-white/80
       w-full h-full flex items-center justify-center"
        >
          <ActivityIndicator size={50} />
        </View>
      )}
      <TaxonNamesSetting
        onChange={options => {
        // logger.info( "Enqueuing taxon name change with options:", options );
        // logger.info( `Current user ID being updated: ${settings.id}` );

          const payload = JSON.stringify( {
            id: settings.id,
            user: {
              prefers_common_names: options.prefers_common_names,
              prefers_scientific_name_first: options.prefers_scientific_name_first
            }
          } );

          // log.info( `Payload to be enqueued: ${payload}` );
          QueueItem.enqueue(
            realm,
            payload,
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
};

export default LoggedInDefaultSettings;

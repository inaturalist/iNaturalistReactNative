import { useNetInfo } from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import type { TabStackScreenProps } from "navigation/types";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import Config from "react-native-config";
import { EventRegister } from "react-native-event-listeners";

import useLayoutPrefs from "./useLayoutPrefs";
import useTranslation from "./useTranslation";

const { useRealm } = RealmContext;

const SETTINGS_URL = `${Config.OAUTH_API_URL}/users/edit?noh1=true`;
const FINISHED_WEB_SETTINGS = "finished-web-settings";

interface Options {
  // Called when the user returns from the web settings view (e.g. to refetch
  // any profile data that may have changed)
  onFinish?: ( ) => void;
}

const useNavigateToAccountSettings = ( { onFinish }: Options = {} ) => {
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const navigation = useNavigation<
    TabStackScreenProps<"UserProfile" | "Settings">["navigation"]
  >( );
  const { t } = useTranslation( );
  const { setIsDefaultMode } = useLayoutPrefs( );
  const queryClient = useQueryClient( );
  const [showingWebViewSettings, setShowingWebViewSettings] = useState( false );

  useFocusEffect(
    useCallback( ( ) => {
      if ( showingWebViewSettings ) {
        // When we get back from the webview of settings - in case the user updated their profile
        // photo or other details
        onFinish?.( );
        setShowingWebViewSettings( false );
      }
    }, [showingWebViewSettings, onFinish] ),
  );

  // Listen for the webview to finish so callers can refresh their data
  useEffect( ( ) => {
    const listener = EventRegister.addEventListener(
      FINISHED_WEB_SETTINGS,
      ( ) => onFinish?.( ),
    );
    return ( ) => {
      EventRegister?.removeEventListener( listener as string );
    };
  }, [onFinish] );

  const navigateToAccountSettings = useCallback( ( ) => {
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" ),
      );
      return;
    }
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
            t( "It-may-take-up-to-an-hour-to-remove-content" ),
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
      },
    } );
  }, [isConnected, navigation, queryClient, realm, setIsDefaultMode, t] );

  return navigateToAccountSettings;
};

export default useNavigateToAccountSettings;

// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { focusManager } from "@tanstack/react-query";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import {
  AppState, Linking, LogBox
} from "react-native";
import DeviceInfo from "react-native-device-info";
import Orientation from "react-native-orientation-locker";
import { addARCameraFiles } from "sharedHelpers/cvModel";
import {
  useCurrentUser,
  useIconicTaxa,
  useObservationUpdatesWhenFocused,
  useShare,
  useTranslation,
  useUserMe
} from "sharedHooks";

import { log } from "../../react-native-logs.config";

// Ignore warnings about 3rd parties that haven't implemented the new
// NativeEventEmitter interface methods yet. As of 20230517, this is coming
// from react-native-share-menu.
// https://stackoverflow.com/questions/69538962
LogBox.ignoreLogs( ["new NativeEventEmitter"] );

const logger = log.extend( "App" );

const isTablet = DeviceInfo.isTablet();

const { useRealm } = RealmContext;

type Props = {
  children?: any,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const realm = useRealm( );
  logger.debug( "[App.js] Need to open Realm in another app?" );
  logger.debug( "[App.js] realm.path: ", realm?.path );
  const currentUser = useCurrentUser( );
  useIconicTaxa( { reload: true } );
  const { i18n } = useTranslation( );
  useShare( );

  // fetch current user from server and save to realm in useEffect
  // this is used for changing locale and also for showing UserCard
  const { remoteUser } = useUserMe( );

  useEffect( () => {
    if ( !isTablet ) {
      Orientation.lockToPortrait();
    }

    return ( ) => Orientation?.unlockAllOrientations( );
  }, [] );

  useObservationUpdatesWhenFocused();

  // When the app is coming back from the background, set the focusManager to focused
  // This will trigger react-query to refetch any queries that are stale
  const onAppStateChange = status => {
    focusManager.setFocused( status === "active" );
  };

  useEffect( () => {
    // subscribe to app state changes
    const subscription = AppState.addEventListener( "change", onAppStateChange );

    // unsubscribe on unmount
    return ( ) => subscription?.remove();
  }, [] );

  useEffect( () => {
    addARCameraFiles();
  }, [] );

  useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = await AsyncStorage.getItem( "alreadyLaunched" );
      if ( !alreadyLaunched ) {
        await AsyncStorage.setItem( "alreadyLaunched", "true" );
        if ( !currentUser ) {
          logger.debug(
            "Signing out and deleting Realm because no signed in user found in the database"
          );
          await signOut( { clearRealm: true } );
        }
      }
    };

    checkForSignedInUser( );
  }, [currentUser] );

  const changeLanguageToLocale = useCallback(
    locale => i18n.changeLanguage( locale ),
    [i18n]
  );

  // When we get the updated current user, update the record in the database
  useEffect( ( ) => {
    if ( remoteUser ) {
      realm?.write( ( ) => {
        realm?.create( "User", remoteUser, "modified" );
      } );

      // If the current user's locale has changed, change the language
      if ( remoteUser.locale !== i18n.language ) {
        changeLanguageToLocale( remoteUser.locale );
      }
    }
  }, [changeLanguageToLocale, i18n, realm, remoteUser] );

  // If the current user's locale is not set, change the language
  useEffect( ( ) => {
    if ( currentUser?.locale && currentUser?.locale !== i18n.language ) {
      changeLanguageToLocale( currentUser.locale );
    }
  }, [changeLanguageToLocale, currentUser?.locale, i18n] );

  const navigateConfirmedUser = useCallback( ( ) => {
    if ( currentUser ) { return; }
    navigation.navigate( "LoginNavigator", {
      screen: "Login",
      params: { emailConfirmed: true }
    } );
  }, [navigation, currentUser] );

  const newAccountConfirmedUrl = "https://www.inaturalist.org/users/sign_in?confirmed=true";
  const existingAccountConfirmedUrl = "https://www.inaturalist.org/home?confirmed=true";
  // const testUrl = "https://www.inaturalist.org/observations";

  useEffect( ( ) => {
    Linking.addEventListener( "url", async ( { url } ) => {
      if ( url === newAccountConfirmedUrl
        // || url.includes( testUrl )
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
    } );
  }, [navigateConfirmedUser] );

  useEffect( ( ) => {
    const fetchInitialUrl = async ( ) => {
      const url = await Linking.getInitialURL( );

      if ( url === newAccountConfirmedUrl
        // || url?.includes( testUrl )
        || url === existingAccountConfirmedUrl
      ) {
        navigateConfirmedUser( );
      }
    };
    fetchInitialUrl( );
  }, [navigateConfirmedUser] );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

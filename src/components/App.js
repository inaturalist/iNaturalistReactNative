// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import RootDrawerNavigator from "navigation/rootDrawerNavigation";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useUserMe from "sharedHooks/useUserMe";

import { log } from "../../react-native-logs.config";

const logger = log.extend( "App" );

const { useRealm } = RealmContext;

type Props = {
  children?: any,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const { i18n } = useTranslation( );

  // fetch current user from server and save to realm in useEffect
  // this is used for changing locale and also for showing UserCard
  const { remoteUser } = useUserMe( );

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

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

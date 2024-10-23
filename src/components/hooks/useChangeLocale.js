// @flow

import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import {
  useDebugMode,
  useTranslation,
  useUserMe
} from "sharedHooks";
import { zustandStorage } from "stores/useStore";

const useChangeLocale = ( currentUser: ?Object ) => {
  const { i18n } = useTranslation( );
  // fetch current user from server and save to realm in useEffect
  // this is used for changing locale and also for showing UserCard
  const { remoteUser } = useUserMe( { updateRealm: true } );
  const { isDebug } = useDebugMode( );
  const changeLanguageToLocale = useCallback(
    locale => {
      if ( isDebug ) i18n.changeLanguage( locale );
    },
    [i18n, isDebug]
  );

  // When we get the updated current user, update the record in the database
  useEffect( ( ) => {
    if ( !remoteUser ) { return; }
    zustandStorage.setItem( "currentLocale", remoteUser.locale );

    // If the current user's locale has changed, change the language
    if ( remoteUser?.locale !== i18n.language ) {
      changeLanguageToLocale( remoteUser.locale );
    }
  }, [changeLanguageToLocale, i18n, remoteUser] );

  const changeToUserOrSystemLocale = useCallback( ( ) => {
    const targetLocale = currentUser?.locale || getInatLocaleFromSystemLocale();
    if ( targetLocale !== i18n.language ) {
      changeLanguageToLocale( targetLocale );
    }
  }, [
    changeLanguageToLocale,
    currentUser,
    i18n.language
  ] );

  // If the user changes or the app comes back to the foreground, change the
  // app locale to the user's preferred locale or the system locale
  useEffect( ( ) => {
    changeToUserOrSystemLocale( );
    const subscription = AppState.addEventListener( "change", nextAppState => {
      if ( nextAppState !== "active" ) return;
      changeToUserOrSystemLocale( );
    } );
    return ( ) => {
      subscription.remove( );
    };
  }, [changeToUserOrSystemLocale] );
};

export default useChangeLocale;

// @flow

import { useCallback, useEffect } from "react";
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

  // If the current user's locale is not set, change the language
  useEffect( ( ) => {
    if ( currentUser?.locale && currentUser?.locale !== i18n.language ) {
      changeLanguageToLocale( currentUser.locale );
    }
  }, [changeLanguageToLocale, currentUser?.locale, i18n] );
};

export default useChangeLocale;

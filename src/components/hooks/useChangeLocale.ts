// @flow

import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import { useCallback, useEffect } from "react";
import { AppState } from "react-native";
import {
  useTranslation
} from "sharedHooks";
import { zustandStorage } from "stores/useStore";

const getInatNextLocale = ( ): string => {
  const currentLocale = zustandStorage.getItem( "currentLocale" );
  return currentLocale || getInatLocaleFromSystemLocale( );
};

const useChangeLocale = ( ) => {
  const { i18n } = useTranslation( );

  const changeLanguageToLocale = useCallback(
    locale => i18n.changeLanguage( locale ),
    [i18n]
  );

  const changeToUserOrSystemLocale = useCallback( ( ) => {
    const userLocale = getInatNextLocale();
    if ( userLocale !== i18n.language ) {
      changeLanguageToLocale( userLocale );
    }
  }, [
    changeLanguageToLocale,
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

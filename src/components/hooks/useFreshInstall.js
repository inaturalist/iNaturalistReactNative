// @flow

import { signOut } from "components/LoginSignUp/AuthenticationService.ts";
import { getInatLocaleFromSystemLocale } from "i18n/initI18next";
import { useCallback, useEffect } from "react";
import { MMKV } from "react-native-mmkv";
import {
  useTranslation
} from "sharedHooks";

// it's not recommended to have multiple instances of MMKV in an app, but
// we can't use the zustand one here since it hasn't been initialized yet,
// and I don't think we can move storage creation into App.js without creating
// a dependency cycle
const installStatus = new MMKV( {
  id: "install-status"
} );

const INSTALL_STATUS = "alreadyLaunched";

const useFreshInstall = ( currentUser: ?Object ) => {
  const { i18n } = useTranslation( );

  // only use system locale if this is a fresh install of the app;
  // otherwise, locale should be set by LanguageSettings with a
  // fallback to the web locale
  const changeToSystemLocale = useCallback( ( ) => {
    const systemLocale = getInatLocaleFromSystemLocale();
    i18n.changeLanguage( systemLocale );
  }, [
    i18n
  ] );

  useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = installStatus.getBoolean( INSTALL_STATUS );
      if ( !alreadyLaunched ) {
        installStatus.set( INSTALL_STATUS, true );
        changeToSystemLocale( );
        if ( !currentUser ) {
          await signOut( { clearRealm: true } );
        }
      }
    };

    checkForSignedInUser( );
  }, [currentUser, changeToSystemLocale] );
};

export default useFreshInstall;

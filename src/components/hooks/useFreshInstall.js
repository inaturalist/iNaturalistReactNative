// @flow

import { signOut } from "components/LoginSignUp/AuthenticationService.ts";
import { useEffect } from "react";
import { MMKV } from "react-native-mmkv";
import { log } from "sharedHelpers/logger";

const logger = log.extend( "useFreshInstall" );

// it's not recommended to have multiple instances of MMKV in an app, but
// we can't use the zustand one here since it hasn't been initialized yet,
// and I don't think we can move storage creation into App.js without creating
// a dependency cycle
const installStatus = new MMKV( {
  id: "install-status"
} );

const INSTALL_STATUS = "alreadyLaunched";

const useFreshInstall = ( currentUser: ?Object ) => {
  useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = installStatus.getBoolean( INSTALL_STATUS );
      if ( !alreadyLaunched ) {
        installStatus.set( INSTALL_STATUS, true );
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
};

export default useFreshInstall;

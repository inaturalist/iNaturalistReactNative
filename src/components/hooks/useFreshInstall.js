// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "components/LoginSignUp/AuthenticationService";
import { useEffect } from "react";

const useFreshInstall = ( currentUser: ?Object ) => {
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
          await signOut( { clearRealm: true } );
        }
      }
    };

    checkForSignedInUser( );
  }, [currentUser] );
};

export default useFreshInstall;

// @flow

import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchUserMe } from "api/users";
import { getUserId, signOut } from "components/LoginSignUp/AuthenticationService";
import i18next from "i18next";
import RootDrawerNavigator from "navigation/rootDrawerNavigation";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect } from "react";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

const { useRealm } = RealmContext;

const App = ( ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  // fetch current user from server and save to realm in useEffect
  // this is used for changing locale
  const {
    data: user
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth )
  );

  useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      const userId = await getUserId( );
      // check to see if this is a fresh install of the app
      // if it is, delete realm file when we sign the user out of the app
      // this handles the case where a user deletes the app, then reinstalls
      // and expects to be signed out with no previously saved data
      const alreadyLaunched = await AsyncStorage.getItem( "alreadyLaunched" );
      let deleteRealm = false;
      if ( !alreadyLaunched ) {
        deleteRealm = true;
        await AsyncStorage.setItem( "alreadyLaunched", "true" );
      }
      if ( !userId ) {
        await signOut( { deleteRealm } );
      }
    };

    checkForSignedInUser( );
  }, [] );

  useEffect( ( ) => {
    if ( user ) {
      realm?.write( ( ) => {
        realm?.create( "User", user, "modified" );
      } );
      if ( !user.locale ) { return; }
      i18next.changeLanguage( user.locale, err => {
        if ( err ) { throw new Error( err ); }
      } );
    }
  }, [user, realm, currentUser] );

  return (
    <RootDrawerNavigator />
  );
};

export default App;

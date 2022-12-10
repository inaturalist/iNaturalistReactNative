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

type Props = {
  children?: any
}

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  // fetch current user from server and save to realm in useEffect
  // this is used for changing locale and also for showing UserCard
  const {
    data: remoteUser
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth ),
    {},
    {
      enabled: !!currentUser
    }
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

  // When we get the updated current user, update the record in the database
  useEffect( ( ) => {
    if ( remoteUser ) {
      realm?.write( ( ) => {
        realm?.create( "User", remoteUser, "modified" );
      } );
    }
  }, [realm, remoteUser] );

  // If the current user's locale has changed, change the language
  useEffect( ( ) => {
    async function changeLanguageToLocale( locale ) {
      await i18next.changeLanguage( locale );
    }
    if ( currentUser?.locale ) {
      changeLanguageToLocale( currentUser.locale );
    }
  }, [currentUser?.locale] );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

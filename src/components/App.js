// @flow

import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import Realm from "realm";
import { addARCameraFiles } from "sharedHelpers/cvModel.ts";
import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  useIconicTaxa,
  useObservationUpdatesWhenFocused,
  useShare
} from "sharedHooks";

import useChangeLocale from "./hooks/useChangeLocale";
import useFreshInstall from "./hooks/useFreshInstall";
import useLinking from "./hooks/useLinking";
import useLockOrientation from "./hooks/useLockOrientation";
import useReactQueryRefetch from "./hooks/useReactQueryRefetch";

const { useRealm } = RealmContext;

const logger = log.extend( "App" );

Realm.setLogLevel( "warn" );

// Ignore warnings about 3rd parties that haven't implemented the new
// NativeEventEmitter interface methods yet. As of 20230517, this is coming
// from react-native-share-menu.
// https://stackoverflow.com/questions/69538962
LogBox.ignoreLogs( ["new NativeEventEmitter"] );

type Props = {
  // $FlowIgnore
  children?: unknown,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  useIconicTaxa( { reload: true } );
  useReactQueryRefetch( );
  useFreshInstall( currentUser );
  useLinking( currentUser );
  useChangeLocale( currentUser );

  useLockOrientation( );
  useShare( );
  useObservationUpdatesWhenFocused( );

  useEffect( ( ) => {
    addARCameraFiles( );
  }, [] );

  useEffect( ( ) => {
    if ( realm?.path ) {
      console.debug( "Need to open Realm in another app?" );
      console.debug( "realm.path: ", realm.path );
    }
  }, [realm?.path] );

  useEffect( ( ) => {
    logger.info( "pickup" );
  }, [] );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

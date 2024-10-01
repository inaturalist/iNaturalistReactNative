// @flow

import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import { RealmContext } from "providers/contexts.ts";
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
import useTaxonCommonNames from "./hooks/useTaxonCommonNames";

const { useRealm } = RealmContext;

const logger = log.extend( "App" );

Realm.setLogLevel( "warn" );

// Ignore warnings about 3rd parties that haven't implemented the new
// NativeEventEmitter interface methods yet. As of 20230517, this is coming
// from react-native-share-menu.
// https://stackoverflow.com/questions/69538962
LogBox.ignoreLogs( ["new NativeEventEmitter"] );

// better to ping our own website to check for site uptime
// with no rendering required, per issue #1770
NetInfo.configure( {
  reachabilityUrl: "https://www.inaturalist.org/ping"
} );

const geolocationConfig = {
  skipPermissionRequests: true
};

type Props = {
  // $FlowIgnore
  children?: unknown,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );

  // this ensures that React Query has the most accurate depiction of whether the
  // app is online or offline. since queries only run when the app is online, this
  // eventListener prevents both queries and retries (via reactQueryRetry)
  // from running unnecessarily when the app is offline
  // https://tanstack.com/query/latest/docs/framework/react/react-native#online-status-management
  onlineManager.setEventListener( setOnline => NetInfo.addEventListener( state => {
    setOnline( !!state.isConnected );
  } ) );

  useIconicTaxa( { reload: true } );
  useReactQueryRefetch( );
  useFreshInstall( currentUser );
  useLinking( currentUser );
  useChangeLocale( currentUser );

  useLockOrientation( );
  useShare( );
  useObservationUpdatesWhenFocused( );
  useTaxonCommonNames( );

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
    // don't remove this logger.info statement: it's used for internal metrics
    logger.info( "pickup" );
  }, [] );

  // skipping location permissions here since we're manually showing
  // permission gates and don't want to pop up the native notification
  Geolocation.setRNConfiguration( geolocationConfig );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

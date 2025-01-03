// @flow

import Geolocation from "@react-native-community/geolocation";
import NetInfo from "@react-native-community/netinfo";
import { onlineManager } from "@tanstack/react-query";
import useDeviceStorageFull from "components/Camera/hooks/useDeviceStorageFull";
import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { LogBox } from "react-native";
import Realm from "realm";
import clearCaches from "sharedHelpers/clearCaches.ts";
import { log } from "sharedHelpers/logger";
import { addARCameraFiles } from "sharedHelpers/mlModel.ts";
import { findAndLogSentinelFiles } from "sharedHelpers/sentinelFiles.ts";
import {
  useCurrentUser,
  useIconicTaxa,
  useObservationUpdatesWhenFocused,
  useShare
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

import useFreshInstall from "./hooks/useFreshInstall";
import useLinking from "./hooks/useLinking";
import useLockOrientation from "./hooks/useLockOrientation";
import useReactQueryRefetch from "./hooks/useReactQueryRefetch";
import useTaxonCommonNames from "./hooks/useTaxonCommonNames";
import useWorkQueue from "./hooks/useWorkQueue";

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
  const { deviceStorageFull, showStorageFullAlert } = useDeviceStorageFull();
  const [deviceStorageFullShown, setDeviceStorageFullShown] = useState( false );

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

  // This only runs when App updates... which is rarely. It works for Settings
  // b/c it generally updates currentUser
  useWorkQueue( );

  useLockOrientation( );
  useShare( );
  useObservationUpdatesWhenFocused( );
  useTaxonCommonNames( );

  useEffect( ( ) => {
    if ( deviceStorageFull && !deviceStorageFullShown ) {
      showStorageFullAlert();
      setDeviceStorageFullShown( true );
    }
  }, [deviceStorageFull, deviceStorageFullShown, showStorageFullAlert] );

  useEffect( ( ) => {
    addARCameraFiles( );
    findAndLogSentinelFiles( );
  }, [] );

  useEffect( ( ) => {
    if ( realm?.path ) {
      clearCaches( isDebugMode( ), realm );
      console.debug( "Need to open Realm in another app?" );
      console.debug( "realm.path: ", realm.path );
    }
  }, [realm] );

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

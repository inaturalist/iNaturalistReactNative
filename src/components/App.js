// @flow

import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import type { Node } from "react";
import React, { useEffect } from "react";
import { LogBox } from "react-native";
import Realm from "realm";
import { addARCameraFiles } from "sharedHelpers/cvModel";
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

Realm.setLogLevel( "warn" );

// Ignore warnings about 3rd parties that haven't implemented the new
// NativeEventEmitter interface methods yet. As of 20230517, this is coming
// from react-native-share-menu.
// https://stackoverflow.com/questions/69538962
LogBox.ignoreLogs( ["new NativeEventEmitter"] );

type Props = {
  children?: any,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  useIconicTaxa( { reload: true } );
  useReactQueryRefetch( );
  const currentUser = useCurrentUser( );
  useFreshInstall( currentUser );
  useLinking( currentUser );
  useChangeLocale( currentUser );

  useLockOrientation( );
  useShare( );
  useObservationUpdatesWhenFocused( );

  useEffect( ( ) => {
    addARCameraFiles( );
  }, [] );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return children || <RootDrawerNavigator />;
};

export default App;

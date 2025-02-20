// @flow

import RootDrawerNavigator from "navigation/rootDrawerNavigator";
import type { Node } from "react";
import React from "react";
import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  usePerformance,
  useShare
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

import AppStateListener from "./AppStateListener";
import useLinking from "./hooks/useLinking";
import NetworkService from "./NetworkService";
import StartupService from "./StartupService";

const logger = log.extend( "App" );

type Props = {
  // $FlowIgnore
  children?: unknown,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const { loadTime } = usePerformance( {
    screenName: "App"
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  const currentUser = useCurrentUser( );

  useLinking( currentUser );
  useShare( );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return (
    <>
      <StartupService />
      <NetworkService />
      <AppStateListener />
      {children || <RootDrawerNavigator />}
    </>
  );
};

export default App;

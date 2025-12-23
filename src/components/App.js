// @flow

import { useNavigation } from "@react-navigation/native";
import RootStackNavigator from "navigation/RootStackNavigator";
import type { Node } from "react";
import React, { useCallback } from "react";
import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  usePerformance,
  useShare,
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";

import AppStateListener from "./AppStateListener";
import useLinking from "./hooks/useLinking";
import NetworkService from "./NetworkService";
import StartupService from "./StartupService";

const logger = log.extend( "App" );

type SharedItem = {
  mimeType: string,
  data: string | Array<string>
};

const handleShare = ( navigation, item: ?SharedItem ) => {
  if ( !item ) {
    // user hasn't shared any items
    return;
  }

  const { mimeType, data } = item;

  if ( !mimeType && !data ) {
    // user hasn't shared any images
    return;
  }

  // show user a loading animation screen (like PhotoLibrary)
  // while observations are created
  navigation?.navigate( "NoBottomTabStackNavigator", {
    screen: "PhotoSharing",
    params: { item },
  } );
};

type Props = {
  // $FlowIgnore
  children?: unknown,
};

// this children prop is here for the sake of testing with jest
// normally we would never do this in code
const App = ( { children }: Props ): Node => {
  const navigation = useNavigation( );
  const { loadTime } = usePerformance( {
    screenName: "App",
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }

  // attempting to make sure that navigation is only called once
  // for performance reasons
  const onShare = useCallback(
    item => handleShare( navigation, item ),
    [navigation],
  );

  const currentUser = useCurrentUser( );

  useLinking( currentUser );
  useShare( onShare );

  // this children prop is here for the sake of testing with jest
  // normally we would never do this in code
  return (
    <>
      <StartupService />
      <NetworkService />
      <AppStateListener />
      {children || <RootStackNavigator />}
    </>
  );
};

export default App;

// @flow

// Explore when accessed from the bottom tabs, i.e. at the root of the stack

import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect } from "react";
import useStore from "stores/useStore";

import ExploreContainer from "./ExploreContainer";

const RootExploreContainer = ( ): Node => {
  const navigation = useNavigation( );
  const exploreView = useStore( state => state.rootExploreView );
  const setExploreView = useStore( state => state.setRootExploreView );
  const storedParams = useStore( state => state.rootStoredParams );
  const setStoredParams = useStore( state => state.setRootStoredParams );

  const {
    dispatch,
    state
  } = useExplore( );

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( storedParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: storedParams } );
      }
    } );
  }, [
    dispatch,
    navigation,
    setStoredParams,
    state,
    storedParams
  ] );

  return (
    <ExploreContainer
      exploreView={exploreView}
      hideBackButton
      setExploreView={setExploreView}
      setStoredParams={setStoredParams}
    />
  );
};

const WithContext = (): Node => (
  <ExploreProvider>
    <RootExploreContainer />
  </ExploreProvider>
);

export default WithContext;

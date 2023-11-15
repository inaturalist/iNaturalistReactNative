// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
// eslint-disable-next-line import/no-extraneous-dependencies
import { ReactNavigationPerformanceView } from "@shopify/react-native-performance-navigation";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations
} from "sharedHooks";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const { getItem, setItem } = useAsyncStorage( "myObservationsLayout" );
  const [layout, setLayout] = useState( null );
  const isOnline = useIsConnected( );

  const currentUser = useCurrentUser();
  const { isFetchingNextPage, fetchNextPage } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const writeItemToStorage = useCallback( async newValue => {
    await setItem( newValue );
    setLayout( newValue );
  }, [setItem] );

  useEffect( ( ) => {
    const readItemFromStorage = async ( ) => {
      const item = await getItem( );
      if ( !item ) {
        await writeItemToStorage( "list" );
      }
      setLayout( item || "list" );
    };

    readItemFromStorage( );
  }, [getItem, writeItemToStorage] );

  const toggleLayout = ( ) => {
    if ( layout === "grid" ) {
      writeItemToStorage( "list" );
    } else {
      writeItemToStorage( "grid" );
    }
  };

  if ( !layout ) { return null; }

  return (
    <ReactNavigationPerformanceView interactive={!!layout} screenName="ObsList">
      <MyObservations
        observations={observations}
        layout={layout}
        toggleLayout={toggleLayout}
        allObsToUpload={allObsToUpload}
        showLoginSheet={showLoginSheet}
        setShowLoginSheet={setShowLoginSheet}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={fetchNextPage}
        currentUser={currentUser}
        isOnline={isOnline}
      />
    </ReactNavigationPerformanceView>
  );
};

export default MyObservationsContainer;

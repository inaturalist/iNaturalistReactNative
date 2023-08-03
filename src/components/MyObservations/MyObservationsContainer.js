// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useLocalObservations,
  useObservationsUpdates
} from "sharedHooks";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const { getItem, setItem } = useAsyncStorage( "myObservationsLayout" );
  const [layout, setLayout] = useState( null );
  const currentUser = useCurrentUser();
  const { isFetchingNextPage, fetchNextPage } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  useObservationsUpdates( !!currentUser );

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
    <MyObservations
      observations={observations}
      layout={layout}
      toggleLayout={toggleLayout}
      isFetchingNextPage={isFetchingNextPage}
      allObsToUpload={allObsToUpload}
      currentUser={currentUser}
      showLoginSheet={showLoginSheet}
      setShowLoginSheet={setShowLoginSheet}
      onEndReached={fetchNextPage}
    />
  );
};

export default MyObservationsContainer;

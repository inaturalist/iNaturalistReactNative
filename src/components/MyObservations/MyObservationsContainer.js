// @flow

import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useObservationsUpdates from "sharedHooks/useObservationsUpdates";
import useUploadObservations from "sharedHooks/useUploadObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const uploadStatus = useUploadObservations( allObsToUpload );
  const { getItem, setItem } = useAsyncStorage( "myObservationsLayout" );
  const [layout, setLayout] = useState( null );
  const { isLoading, fetchNextPage } = useInfiniteScroll();
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const currentUser = useCurrentUser();
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
      isLoading={isLoading}
      uploadStatus={uploadStatus}
      currentUser={currentUser}
      showLoginSheet={showLoginSheet}
      setShowLoginSheet={setShowLoginSheet}
      onEndReached={fetchNextPage}
    />
  );
};

export default MyObservationsContainer;

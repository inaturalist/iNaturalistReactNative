// @flow

import { useNavigation } from "@react-navigation/native";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useInfiniteScroll from "sharedHooks/useInfiniteScroll";
import useLocalObservations from "sharedHooks/useLocalObservations";
import useUploadObservations from "sharedHooks/useUploadObservations";

import MyObservations from "./MyObservations";

const MyObservationsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const obsEditContext = useContext( ObsEditContext );
  const { observationList: observations, allObsToUpload } = useLocalObservations( );
  const uploadStatus = useUploadObservations( allObsToUpload );
  const [layout, setLayout] = useState( "list" );
  const [idBelow, setIdBelow] = useState( null );
  const isLoading = useInfiniteScroll( idBelow );
  const [showLoginSheet, setShowLoginSheet] = useState( false );
  const currentUser = useCurrentUser( );
  const loading = obsEditContext?.loading;
  const setLoading = obsEditContext?.setLoading;

  useEffect( ( ) => {
    if ( loading && !currentUser ) {
      setShowLoginSheet( true );
    }
  }, [loading, currentUser] );

  // reset loading state when a user closes the login sheet
  // so it can be displayed on the next upload/sync button press
  useEffect( ( ) => {
    if ( !showLoginSheet ) {
      setLoading( false );
    }
  }, [showLoginSheet, setLoading] );

  // clear upload status when leaving screen
  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        uploadStatus.stopUpload( );
        obsEditContext?.setUploadProgress( { } );
      } );
    },
    [navigation, uploadStatus, obsEditContext]
  );

  return (
    <MyObservations
      observations={observations}
      layout={layout}
      setLayout={setLayout}
      isLoading={isLoading}
      uploadStatus={uploadStatus}
      currentUser={currentUser}
      showLoginSheet={showLoginSheet}
      setShowLoginSheet={setShowLoginSheet}
      onEndReached={( ) => {
        // infinite scroll
        if ( !isLoading ) {
          setIdBelow( observations[observations.length - 1].id );
        }
      }}
    />
  );
};

export default MyObservationsContainer;

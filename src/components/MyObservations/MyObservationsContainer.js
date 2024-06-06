// @flow

import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback,
  useReducer, useState
} from "react";
import { Alert } from "react-native";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useIsConnected,
  useLocalObservations,
  useObservationsUpdates,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import {
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import useClearGalleryPhotos from "./hooks/useClearGalleryPhotos";
import useClearRotatedOriginalPhotos from "./hooks/useClearRotatedOriginalPhotos";
import useClearSyncedPhotosForUpload from "./hooks/useClearSyncedPhotosForUpload";
import useClearSyncedSoundsForUpload from "./hooks/useClearSyncedSoundsForUpload";
import useDeleteObservations from "./hooks/useDeleteObservations";
import useSyncRemoteObservations from "./hooks/useSyncRemoteObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";

export const INITIAL_STATE = {
  canBeginDeletions: true
};

const reducer = ( state: Object, action: Function ): Object => {
  switch ( action.type ) {
    case "SET_START_DELETIONS":
      return {
        ...state,
        canBeginDeletions: false
      };
    default:
      return state;
  }
};

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  // clear original, large-sized photos before a user returns to any of the Camera or AICamera flows
  useClearRotatedOriginalPhotos( );
  useClearGalleryPhotos( );
  useClearSyncedPhotosForUpload( );
  useClearSyncedSoundsForUpload( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const setTotalToolbarIncrements = useStore( state => state.setTotalToolbarIncrements );
  const [state, dispatch] = useReducer( reducer, INITIAL_STATE );
  const { observationList: observations, unsyncedUuids } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const canUpload = currentUser && isOnline;

  useDeleteObservations(
    currentUser?.id && state.canBeginDeletions,
    dispatch
  );

  const { syncObservations } = useSyncRemoteObservations( );

  useObservationsUpdates( !!currentUser );

  const {
    fetchNextPage,
    isFetchingNextPage,
    observations: data,
    status
  } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUser?.id
    }
  } );

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  const showInternetErrorAlert = useCallback( ( ) => {
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
  }, [t, isOnline] );

  const toggleLoginSheet = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
  }, [currentUser] );

  const startUpload = useCallback( ( ) => {
    toggleLoginSheet( );
    showInternetErrorAlert( );
    if ( canUpload ) {
      setUploadStatus( UPLOAD_IN_PROGRESS );
    } else {
      setUploadStatus( UPLOAD_PENDING );
    }
  }, [
    canUpload,
    setUploadStatus,
    showInternetErrorAlert,
    toggleLoginSheet
  ] );

  useUploadObservations( );

  const handleSyncButtonPress = useCallback( ( ) => {
    if ( numUnuploadedObservations > 0 ) {
      const uuidsQuery = unsyncedUuids.map( uploadUuid => `'${uploadUuid}'` ).join( ", " );
      const uploads = realm.objects( "Observation" )
        .filtered( `uuid IN { ${uuidsQuery} }` );
      setTotalToolbarIncrements( uploads );
      addToUploadQueue( unsyncedUuids );
      startUpload( );
    } else {
      syncObservations( );
    }
  }, [
    addToUploadQueue,
    startUpload,
    numUnuploadedObservations,
    realm,
    setTotalToolbarIncrements,
    syncObservations,
    unsyncedUuids
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    startUpload( );
  }, [
    addToUploadQueue,
    addTotalToolbarIncrements,
    startUpload,
    realm
  ] );

  if ( !layout ) { return null; }

  // remote data is available before data is synced locally; this check
  // prevents the empty list from rendering briefly when a user first logs in
  const observationListStatus = data?.length > observations?.length
    ? "loading"
    : status;

  return (
    <MyObservations
      currentUser={currentUser}
      isFetchingNextPage={isFetchingNextPage}
      isOnline={isOnline}
      handleIndividualUploadPress={handleIndividualUploadPress}
      handleSyncButtonPress={handleSyncButtonPress}
      layout={layout}
      observations={observations}
      onEndReached={fetchNextPage}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      status={observationListStatus}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;

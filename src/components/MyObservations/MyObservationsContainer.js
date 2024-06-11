// @flow

import { useNavigation } from "@react-navigation/native";
import { RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useCallback, useEffect,
  useState
} from "react";
import { Alert } from "react-native";
import { log } from "sharedHelpers/logger";
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
  UPLOAD_IN_PROGRESS
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import useClearGalleryPhotos from "./hooks/useClearGalleryPhotos";
import useClearRotatedOriginalPhotos from "./hooks/useClearRotatedOriginalPhotos";
import useClearSyncedPhotosForUpload from "./hooks/useClearSyncedPhotosForUpload";
import useClearSyncedSoundsForUpload from "./hooks/useClearSyncedSoundsForUpload";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";

const logger = log.extend( "MyObservationsContainer" );

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const navigation = useNavigation( );
  // clear original, large-sized photos before a user returns to any of the Camera or AICamera flows
  useClearRotatedOriginalPhotos( );
  useClearGalleryPhotos( );
  useClearSyncedPhotosForUpload( );
  useClearSyncedSoundsForUpload( );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const syncingStatus = useStore( state => state.syncingStatus );
  const resetSyncObservationsSlice
    = useStore( state => state.resetSyncObservationsSlice );
  const startManualSync = useStore( state => state.startManualSync );
  const startAutomaticSync = useStore( state => state.startAutomaticSync );

  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = currentUser && isOnline;

  const { uploadObservations } = useUploadObservations( canUpload );
  useSyncObservations(
    currentUserId,
    uploadObservations
  );

  useObservationsUpdates( !!currentUser );

  const {
    fetchNextPage,
    isFetchingNextPage,
    observations: data,
    status
  } = useInfiniteObservationsScroll( {
    upsert: true,
    params: {
      user_id: currentUserId
    }
  } );

  const [showLoginSheet, setShowLoginSheet] = useState( false );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  const confirmInternetConnection = useCallback( ( ) => {
    if ( !isOnline ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return isOnline;
  }, [t, isOnline] );

  const confirmLoggedIn = useCallback( ( ) => {
    if ( !currentUser ) {
      setShowLoginSheet( true );
    }
    return currentUser;
  }, [currentUser] );

  const handleSyncButtonPress = useCallback( ( ) => {
    logger.debug( "Manual sync starting: user tapped sync button" );
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }

    startManualSync( );
  }, [
    startManualSync,
    confirmInternetConnection,
    confirmLoggedIn
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    logger.debug( "Starting individual upload:", uuid );
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    setUploadStatus( UPLOAD_IN_PROGRESS );
  }, [
    confirmLoggedIn,
    confirmInternetConnection,
    realm,
    addTotalToolbarIncrements,
    addToUploadQueue,
    setUploadStatus
  ] );

  useEffect( ( ) => {
    // this is intended to have the automatic sync run once
    // every time a user lands on MyObservations. we will likely want
    // an abort controller to disable this process if a user
    // taps the sync button, but for now we're temporarily
    // disabling the sync button while automatic updates are in flight
    navigation.addListener( "focus", ( ) => {
      startAutomaticSync( );
    } );
    navigation.addListener( "blur", ( ) => {
      resetSyncObservationsSlice( );
    } );
  }, [
    navigation,
    startAutomaticSync,
    syncingStatus,
    resetSyncObservationsSlice
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

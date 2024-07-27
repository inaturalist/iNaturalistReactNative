// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
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
import useClearSyncedMediaForUpload from "./hooks/useClearSyncedMediaForUpload";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";

const logger = log.extend( "MyObservationsContainer" );

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const navigation = useNavigation( );
  const [isFocused, setIsFocused] = useState( true );
  // clear original, large-sized photos before a user returns to any of the Camera or AICamera flows
  useClearRotatedOriginalPhotos( );
  useClearGalleryPhotos( );
  useClearSyncedMediaForUpload( isFocused );
  const { t } = useTranslation( );
  const realm = useRealm( );
  const setUploadStatus = useStore( state => state.setUploadStatus );
  const uploadQueue = useStore( state => state.uploadQueue );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const syncingStatus = useStore( state => state.syncingStatus );
  const resetSyncObservationsSlice
    = useStore( state => state.resetSyncObservationsSlice );
  const startManualSync = useStore( state => state.startManualSync );
  const startAutomaticSync = useStore( state => state.startAutomaticSync );

  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = currentUser && isConnected;

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
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" )
      );
    }
    return isConnected;
  }, [t, isConnected] );

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
    const uploadExists = uploadQueue.includes( uuid );
    if ( uploadExists ) {
      return;
    }
    logger.debug( "Starting individual upload:", uuid );
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    setUploadStatus( UPLOAD_IN_PROGRESS );
  }, [
    confirmLoggedIn,
    uploadQueue,
    confirmInternetConnection,
    realm,
    addTotalToolbarIncrements,
    addToUploadQueue,
    setUploadStatus
  ] );

  useEffect( ( ) => {
    // this is intended to have the automatic sync run once
    // the very first time a user lands on MyObservations
    startAutomaticSync( );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [] );

  useEffect( ( ) => {
    // this is intended to have the automatic sync run once
    // every time a user lands on MyObservations from a different tab screen.
    // ideally, we wouldn't need both this and the useEffect hook above
    navigation.addListener( "focus", ( ) => {
      setIsFocused( true );
      startAutomaticSync( );
    } );
    navigation.addListener( "blur", ( ) => {
      setIsFocused( false );
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
      isConnected={isConnected}
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

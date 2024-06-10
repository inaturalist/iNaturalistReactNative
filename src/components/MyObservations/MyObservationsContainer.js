// @flow

import { useNavigation } from "@react-navigation/native";
import { activateKeepAwake } from "@sayem314/react-native-keep-awake";
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
  HANDLING_LOCAL_DELETIONS,
  SYNC_PENDING,
  SYNCING_REMOTE_DELETIONS,
  USER_TAPPED_BUTTON
} from "stores/createDeleteAndSyncObservationsSlice.ts";
import {
  UPLOAD_IN_PROGRESS,
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import useClearGalleryPhotos from "./hooks/useClearGalleryPhotos";
import useClearRotatedOriginalPhotos from "./hooks/useClearRotatedOriginalPhotos";
import useClearSyncedPhotosForUpload from "./hooks/useClearSyncedPhotosForUpload";
import useClearSyncedSoundsForUpload from "./hooks/useClearSyncedSoundsForUpload";
import useDeleteLocalObservations from "./hooks/useDeleteLocalObservations";
import useSyncRemoteDeletions from "./hooks/useSyncRemoteDeletions";
import useSyncRemoteObservations from "./hooks/useSyncRemoteObservations";
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
  const setSyncType = useStore( state => state.setSyncType );
  const preUploadStatus = useStore( state => state.preUploadStatus );
  const setPreUploadStatus = useStore( state => state.setPreUploadStatus );
  const resetDeleteAndSyncObservationsSlice
    = useStore( state => state.resetDeleteAndSyncObservationsSlice );
  const [hasAutomaticallySynced, setHasAutomaticallySynced] = useState( false );

  const { observationList: observations } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = currentUser && isOnline;

  useSyncRemoteDeletions( currentUserId );
  useDeleteLocalObservations( );
  useSyncRemoteObservations( currentUserId );
  useUploadObservations( canUpload );

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

  const handleSyncButtonPress = useCallback( ( ) => {
    logger.info( "User tapped sync button" );
    resetDeleteAndSyncObservationsSlice( );
    toggleLoginSheet( );
    showInternetErrorAlert( );
    setSyncType( USER_TAPPED_BUTTON );
    activateKeepAwake( );
    setPreUploadStatus( SYNCING_REMOTE_DELETIONS );
  }, [
    resetDeleteAndSyncObservationsSlice,
    setPreUploadStatus,
    setSyncType,
    showInternetErrorAlert,
    toggleLoginSheet
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    addTotalToolbarIncrements( observation );
    logger.info( "beginning individual upload:", uuid );
    addToUploadQueue( uuid );
    startUpload( );
  }, [
    addToUploadQueue,
    addTotalToolbarIncrements,
    startUpload,
    realm
  ] );

  const startAutomaticSync = useCallback( ( ) => {
    if ( preUploadStatus !== SYNC_PENDING || hasAutomaticallySynced ) { return; }
    setHasAutomaticallySynced( true );
    activateKeepAwake( );
    if ( currentUserId ) {
      setPreUploadStatus( SYNCING_REMOTE_DELETIONS );
    } else {
      setPreUploadStatus( HANDLING_LOCAL_DELETIONS );
    }
  }, [
    currentUserId,
    hasAutomaticallySynced,
    preUploadStatus,
    setPreUploadStatus
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
      resetDeleteAndSyncObservationsSlice( );
      setHasAutomaticallySynced( false );
    } );
  }, [navigation, startAutomaticSync, resetDeleteAndSyncObservationsSlice] );

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

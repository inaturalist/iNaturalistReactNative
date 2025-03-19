// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { RealmContext } from "providers/contexts.ts";
import type { Node } from "react";
import React, {
  useCallback,
  useRef,
  useState
} from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useLayoutPrefs,
  useLocalObservations,
  useNavigateToObsEdit,
  useObservationsUpdates,
  usePerformance,
  useStoredLayout,
  useTranslation
} from "sharedHooks";
import { isDebugMode } from "sharedHooks/useDebugMode";
import {
  UPLOAD_PENDING
} from "stores/createUploadObservationsSlice.ts";
import useStore from "stores/useStore";

import FullScreenActivityIndicator from "./FullScreenActivityIndicator";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservations from "./MyObservations";
import MyObservationsEmptySimple from "./MyObservationsEmptySimple";
import MyObservationsSimpleContainer from "./MyObservationsSimpleContainer";

const logger = log.extend( "MyObservationsContainer" );

const { useRealm } = RealmContext;

const MyObservationsContainer = ( ): Node => {
  const { loadTime } = usePerformance( {
    screenName: "MyObservations"
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }
  const { isDefaultMode, loggedInWhileInDefaultMode } = useLayoutPrefs();
  const { t } = useTranslation( );
  const realm = useRealm( );
  const listRef = useRef( );
  const navigateToObsEdit = useNavigateToObsEdit( );

  // Get navigation params
  const { params } = useRoute( );
  const { justFinishedSignup } = params || {};

  const setStartUploadObservations = useStore( state => state.setStartUploadObservations );
  const uploadQueue = useStore( state => state.uploadQueue );
  const addToUploadQueue = useStore( state => state.addToUploadQueue );
  const addTotalToolbarIncrements = useStore( state => state.addTotalToolbarIncrements );
  const startManualSync = useStore( state => state.startManualSync );
  const startAutomaticSync = useStore( state => state.startAutomaticSync );
  const setNumUnuploadedObservations = useStore( state => state.setNumUnuploadedObservations );
  const numUnuploadedObservations = useStore( state => state.numUnuploadedObservations );
  const myObsOffsetToRestore = useStore( state => state.myObsOffsetToRestore );
  const setMyObsOffset = useStore( state => state.setMyObsOffset );
  const uploadStatus = useStore( state => state.uploadStatus );

  const {
    observationList: observations,
    totalResults: totalResultsLocal
  } = useLocalObservations( );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = currentUser && isConnected;

  const { startUploadObservations } = useUploadObservations( canUpload );
  const { syncManually } = useSyncObservations(
    currentUserId,
    startUploadObservations
  );

  useObservationsUpdates( !!currentUser );

  const {
    fetchNextPage,
    isFetchingNextPage,
    status,
    totalResults: totalResultsRemote
  } = useInfiniteObservationsScroll( {
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

  const handleSyncButtonPress = useCallback( options => {
    const { unuploadedObsMissingBasicsIDs } = options || { };
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }

    startManualSync( );
    syncManually( { skipSomeUploads: unuploadedObsMissingBasicsIDs } );
  }, [
    startManualSync,
    syncManually,
    confirmInternetConnection,
    confirmLoggedIn
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const uploadExists = uploadQueue.includes( uuid );
    if ( uploadExists ) return;
    const observation = realm.objectForPrimaryKey( "Observation", uuid );
    if ( isDefaultMode && observation.missingBasics( ) ) {
      navigateToObsEdit( observation );
      return;
    }
    if ( !confirmLoggedIn( ) ) return;
    if ( !confirmInternetConnection( ) ) return;
    addTotalToolbarIncrements( observation );
    addToUploadQueue( uuid );
    if ( uploadStatus === UPLOAD_PENDING ) {
      setStartUploadObservations( );
    }
  }, [
    addTotalToolbarIncrements,
    addToUploadQueue,
    confirmInternetConnection,
    confirmLoggedIn,
    isDefaultMode,
    navigateToObsEdit,
    realm,
    setStartUploadObservations,
    uploadQueue,
    uploadStatus
  ] );

  // 20241107 amanda - this seems to be a culprit for the tab bar being less
  // tappable sometimes, because automatic sync is still in progress and gets restarted
  // if a user toggles between tabs too quickly. using the isActive boolean should help
  useFocusEffect(
    // need to reset the state on a FocusEffect, not a blur listener, because
    // tab bar screens don't seem to blur
    useCallback( ( ) => {
      let isActive = true;
      const unsynced = Observation.filterUnsyncedObservations( realm );
      setNumUnuploadedObservations( unsynced.length );
      if ( isActive ) {
        startAutomaticSync( );
      }
      return () => {
        isActive = false;
      };
    }, [
      startAutomaticSync,
      setNumUnuploadedObservations,
      realm
    ] )
  );

  const handlePullToRefresh = useCallback( async ( ) => {
    await syncManually( { skipUploads: true } );
  }, [syncManually] );

  // Scroll the list to the offset we need to restore, e.g. when you are
  // scrolled way down, edit an observation, and return. Entering ObsEdit
  // takes you into a parallel stack navigator, which will destroy MyObs, so
  // we need to keep track of the scroll offset manually
  const restoreScrollOffset = useCallback( ( ) => {
    if ( listRef.current && myObsOffsetToRestore ) {
      listRef.current.scrollToOffset( { offset: myObsOffsetToRestore } );
    }
  }, [
    myObsOffsetToRestore
  ] );

  if ( !layout ) { return null; }

  // API call fetching obs has completed but results are not yet stored in realm
  // for display here
  const showLoading = totalResultsRemote > 0 && observations.length === 0;

  // show empty screen instead of loading wheel...
  const showNoResults = !showLoading && (
    // ...if the user is not signed in, or...
    !currentUser
    // ...if the signed in user is offline and has no observations, or...
    || ( !isConnected && observations?.length === 0 )
    // ...if signed in, online user requested their own obs for the first time
    //    and has 0 obs
    || status !== "pending"
  );

  // Keep track of the scroll offset so we can restore it when we mount
  // this component again after returning from ObsEdit
  const onScroll = scrollEvent => setMyObsOffset( scrollEvent.nativeEvent.contentOffset.y );

  if ( observations.length === 0 ) {
    return showNoResults
      ? (
        <MyObservationsEmptySimple
          currentUser={currentUser}
          isConnected={isConnected}
        />
      )
      : (
        <FullScreenActivityIndicator />
      );
  }

  if ( isDefaultMode ) {
    return (
      <MyObservationsSimpleContainer
        currentUser={currentUser}
        isFetchingNextPage={isFetchingNextPage}
        isConnected={isConnected}
        handleIndividualUploadPress={handleIndividualUploadPress}
        handleSyncButtonPress={handleSyncButtonPress}
        handlePullToRefresh={handlePullToRefresh}
        layout={layout}
        listRef={listRef}
        numUnuploadedObservations={numUnuploadedObservations}
        numTotalObservations={totalResultsRemote || totalResultsLocal}
        observations={observations}
        onEndReached={fetchNextPage}
        onListLayout={restoreScrollOffset}
        onScroll={onScroll}
        setShowLoginSheet={setShowLoginSheet}
        showLoginSheet={showLoginSheet}
        showNoResults={showNoResults}
        toggleLayout={toggleLayout}
        justFinishedSignup={justFinishedSignup}
        loggedInWhileInDefaultMode={loggedInWhileInDefaultMode}
      />
    );
  }

  return (
    <MyObservations
      currentUser={currentUser}
      isFetchingNextPage={isFetchingNextPage}
      isConnected={isConnected}
      handleIndividualUploadPress={handleIndividualUploadPress}
      handleSyncButtonPress={handleSyncButtonPress}
      handlePullToRefresh={handlePullToRefresh}
      layout={layout}
      listRef={listRef}
      numUnuploadedObservations={numUnuploadedObservations}
      observations={observations}
      onEndReached={fetchNextPage}
      onListLayout={restoreScrollOffset}
      onScroll={onScroll}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      showNoResults={showNoResults}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;

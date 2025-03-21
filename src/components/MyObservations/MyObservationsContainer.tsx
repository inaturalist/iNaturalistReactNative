import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { fetchSpeciesCounts } from "api/observations";
import { RealmContext } from "providers/contexts.ts";
import React, {
  useCallback,
  useEffect, useRef,
  useState
} from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import Taxon from "realmModels/Taxon";
import type { RealmObservation, RealmTaxon } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useInfiniteScroll,
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
import useStore, { zustandStorage } from "stores/useStore";

import FullScreenActivityIndicator from "./FullScreenActivityIndicator";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservationsEmptySimple from "./MyObservationsEmptySimple";
import MyObservationsSimple, {
  OBSERVATIONS_TAB,
  TAXA_TAB
} from "./MyObservationsSimple";

const logger = log.extend( "MyObservationsContainer" );

const { useRealm } = RealmContext;

interface SpeciesCount {
  count: number,
  taxon: RealmTaxon
}

interface RouteParams {
  justFinishedSignup?: boolean;
}

interface SyncOptions {
  unuploadedObsMissingBasicsIDs?: string[];
  skipUploads?: boolean;
  skipSomeUploads?: string[];
}

const MyObservationsContainer = ( ): React.FC => {
  const { loadTime } = usePerformance( {
    screenName: "MyObservations"
  } );
  if ( isDebugMode( ) ) {
    logger.info( loadTime );
  }
  const { isDefaultMode, loggedInWhileInDefaultMode } = useLayoutPrefs();
  const { t } = useTranslation( );
  const realm = useRealm( );
  const listRef = useRef( null );
  const navigateToObsEdit = useNavigateToObsEdit( );

  // Get navigation params
  const { params } = useRoute( );
  const { justFinishedSignup } = ( params as RouteParams ) || {};

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
  const canUpload = !!currentUser && !!isConnected;

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

  const handleSyncButtonPress = useCallback( ( options?: SyncOptions ) => {
    const { unuploadedObsMissingBasicsIDs } = options || { };
    if ( !confirmLoggedIn( ) ) { return; }
    if ( !confirmInternetConnection( ) ) { return; }

    startManualSync( );
    const syncOptions = isDefaultMode
      ? { skipSomeUploads: unuploadedObsMissingBasicsIDs }
      : { };
    syncManually( syncOptions );
  }, [
    startManualSync,
    syncManually,
    confirmInternetConnection,
    confirmLoggedIn,
    isDefaultMode
  ] );

  const handleIndividualUploadPress = useCallback( uuid => {
    const uploadExists = uploadQueue.includes( uuid );
    if ( uploadExists ) return;
    const observation = realm.objectForPrimaryKey<RealmObservation>( "Observation", uuid );
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

  // API call fetching obs has completed but results are not yet stored in realm
  // for display here
  const showLoading = ( totalResultsRemote || 0 ) > 0 && observations.length === 0;

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
  const onScroll = ( scrollEvent: {
    nativeEvent: {
      contentOffset: {
        y: number
      }
    }
  } ) => setMyObsOffset( scrollEvent.nativeEvent.contentOffset.y );

  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  const numOfUserSpecies = zustandStorage.getItem( "numOfUserSpecies" );
  const [activeTab, setActiveTab] = useState( OBSERVATIONS_TAB );

  let numTotalTaxaLocal: number | undefined;
  const localObservedSpeciesCount: Array<SpeciesCount> = [];
  if ( !currentUser ) {
    // Calculate obs and leaf taxa counts from local observations
    const distinctTaxonObs = realm.objects<RealmObservation>( "Observation" )
      .filtered( "taxon != null DISTINCT(taxon.id)" );
    const taxonIds: number[] = distinctTaxonObs
      .map( o => o.taxon?.id || 0 )
      .filter( Boolean );
    const ancestorIds = distinctTaxonObs.map( o => {
      // We're filtering b/c for taxa above species level, the taxon's own
      // ID is included in ancestor ids for some reason (this is a bug...
      // somewhere)
      const taxonAncestorIds = (
        o.taxon?.ancestor_ids || []
      ).filter( id => Number( id ) !== Number( o.taxon?.id ) );
      return taxonAncestorIds;
    } ).flat( );
    const leafTaxonIds = taxonIds.filter( taxonId => !ancestorIds.includes( taxonId ) );
    numTotalTaxaLocal = leafTaxonIds.length;

    // Get leaf taxa if we're viewing the species tab
    if ( activeTab === TAXA_TAB ) {
      const localObs = realm.objects<RealmObservation>( "Observation" )
        .filtered( "taxon.id IN $0", leafTaxonIds );
      leafTaxonIds.forEach( id => {
        const obs = localObs.filter( o => o.taxon.id === id );
        localObservedSpeciesCount.push( { count: obs.length, taxon: obs[0].taxon } );
      } );
    }
  }

  const {
    data: remoteObservedTaxaCounts,
    isFetchingNextPage: isFetchingTaxa,
    fetchNextPage: fetchMoreTaxa,
    totalResults: numTotalTaxaRemote,
    refetch: refetchTaxa
  } = useInfiniteScroll(
    "MyObsSimple-fetchSpeciesCounts",
    fetchSpeciesCounts,
    {
      user_id: currentUser?.id,
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS
      }
    },
    {
      enabled: !!currentUser
    }
  );

  const numTotalTaxa = typeof ( numTotalTaxaRemote ) === "number"
    ? numTotalTaxaRemote
    : numTotalTaxaLocal;

  const numTotalObservations = totalResultsRemote || totalResultsLocal;

  useEffect( ( ) => {
    // persist this number in zustand so a user can see their latest observations count
    // even if they're offline
    if ( numTotalObservations > numOfUserObservations ) {
      zustandStorage.setItem( "numOfUserObservations", numTotalObservations );
    }
  }, [numTotalObservations, numOfUserObservations] );

  useEffect( ( ) => {
    // persist this number in zustand so a user can see their latest species count
    // even if they're offline
    if ( numTotalTaxa > numOfUserSpecies ) {
      zustandStorage.setItem( "numOfUserSpecies", numTotalTaxa );
    }
  }, [numTotalTaxa, numOfUserSpecies] );

  if ( !layout ) { return null; }

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

  const taxa = currentUser
    ? remoteObservedTaxaCounts
    : localObservedSpeciesCount;

  return (
    <MyObservationsSimple
      activeTab={activeTab}
      currentUser={currentUser}
      fetchMoreTaxa={fetchMoreTaxa}
      handleIndividualUploadPress={handleIndividualUploadPress}
      handlePullToRefresh={handlePullToRefresh}
      handleSyncButtonPress={handleSyncButtonPress}
      isConnected={isConnected}
      isFetchingNextPage={isFetchingNextPage}
      isFetchingTaxa={isFetchingTaxa}
      justFinishedSignup={justFinishedSignup}
      layout={layout}
      listRef={listRef}
      loggedInWhileInDefaultMode={loggedInWhileInDefaultMode}
      numTotalObservations={numOfUserObservations}
      numTotalTaxa={numOfUserSpecies}
      numUnuploadedObservations={numUnuploadedObservations}
      observations={observations}
      onEndReached={fetchNextPage}
      onListLayout={restoreScrollOffset}
      onScroll={onScroll}
      refetchTaxa={refetchTaxa}
      setActiveTab={setActiveTab}
      setShowLoginSheet={setShowLoginSheet}
      showLoginSheet={showLoginSheet}
      showNoResults={showNoResults}
      taxa={taxa}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;

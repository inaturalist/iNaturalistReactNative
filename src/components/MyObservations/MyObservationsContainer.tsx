import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { FlashListRef } from "@shopify/flash-list";
import { fetchSpeciesCounts } from "api/observations";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert } from "react-native";
import Observation from "realmModels/Observation";
import Taxon from "realmModels/Taxon";
import type { RealmObservation } from "realmModels/types";
import {
  mapSpeciesSortToAPIParams,
  sortSpeciesCounts,
} from "sharedHelpers/sortingHelpers";
import {
  useCurrentUser,
  useInfiniteObservationsScroll,
  useInfiniteScroll,
  useLayoutPrefs,
  useLocalObservations,
  useNavigateToObsEdit,
  useObservationsUpdates,
  useStoredLayout,
  useTranslation,
} from "sharedHooks";
import {
  UPLOAD_PENDING,
} from "stores/createUploadObservationsSlice";
import useStore, { zustandStorage } from "stores/useStore";
import type { SpeciesCount } from "types/sorting";

import { SPECIES_SORT_BY } from "../../types/sorting";
import FullScreenActivityIndicator from "./FullScreenActivityIndicator";
import useSyncObservations from "./hooks/useSyncObservations";
import useUploadObservations from "./hooks/useUploadObservations";
import MyObservationsEmptySimple from "./MyObservationsEmptySimple";
import MyObservationsSimple, {
  OBSERVATIONS_TAB,
  TAXA_TAB,
} from "./MyObservationsSimple";

const { useRealm } = RealmContext;

export enum ACTIVE_SHEET {
  NONE = "NONE",
  LOGIN = "LOGIN",
  SORT = "SORT",
}

interface SyncOptions {
  unuploadedObsMissingBasicsIDs?: string[];
  skipUploads?: boolean;
  skipSomeUploads?: string[];
}

const MyObservationsContainer = ( ): React.FC => {
  const { isDefaultMode, loggedInWhileInDefaultMode } = useLayoutPrefs();
  const { t } = useTranslation( );
  const realm = useRealm( );
  const navigation = useNavigation( );
  const listRef = useRef<FlashListRef<RealmObservation>>( null );
  const taxaListRef = useRef<FlashListRef<SpeciesCount>>( null );
  const navigateToObsEdit = useNavigateToObsEdit( );

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
  const justFinishedSignup: boolean = useStore( state => state.layout.justFinishedSignup );
  // As soon as we leave this screen, the user is no longer considered as just finished signup
  const setJustFinishedSignup = useStore( state => state.layout.setJustFinishedSignup );
  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      setJustFinishedSignup( false );
    } );
    return unsubscribe;
  }, [navigation, setJustFinishedSignup] );

  const {
    observationList: observations,
    totalResults: totalResultsLocal,
  } = useLocalObservations( );
  const prevObservationsLength = useRef( observations.length );
  const { layout, writeLayoutToStorage } = useStoredLayout( "myObservationsLayout" );

  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const currentUserId = currentUser?.id;
  const canUpload = !!currentUser && !!isConnected;

  const { startUploadObservations } = useUploadObservations( canUpload );
  const { syncManually } = useSyncObservations(
    currentUserId,
    startUploadObservations,
  );

  useObservationsUpdates( !!currentUser );

  const {
    fetchFromLastObservation,
    fetchNextPage,
    isFetchingNextPage,
    status,
    totalResults: totalResultsRemote,
  } = useInfiniteObservationsScroll( {
    params: {
      user_id: currentUserId,
    },
  } );

  const [openSheet, setOpenSheet] = useState<ACTIVE_SHEET>( ACTIVE_SHEET.NONE );

  const [speciesSortOptionId, setSpeciesSortOptionId]
    = useState<SPECIES_SORT_BY>( SPECIES_SORT_BY.COUNT_DESC );

  const toggleLayout = ( ) => {
    writeLayoutToStorage( layout === "grid"
      ? "list"
      : "grid" );
  };

  const confirmInternetConnection = useCallback( ( ) => {
    if ( !isConnected ) {
      Alert.alert(
        t( "Internet-Connection-Required" ),
        t( "Please-try-again-when-you-are-connected-to-the-internet" ),
      );
    }
    return isConnected;
  }, [t, isConnected] );

  const confirmLoggedIn = useCallback( ( ) => {
    if ( !currentUser ) {
      setOpenSheet( ACTIVE_SHEET.LOGIN );
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
    isDefaultMode,
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
    uploadStatus,
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
      realm,
    ] ),
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
    myObsOffsetToRestore,
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
        y: number;
      };
    };
  } ) => setMyObsOffset( scrollEvent.nativeEvent.contentOffset.y );

  const numOfUserObservations = zustandStorage.getItem( "numOfUserObservations" );
  const numOfUserSpecies = zustandStorage.getItem( "numOfUserSpecies" );
  const [activeTab, setActiveTab] = useState( OBSERVATIONS_TAB );

  const { leafTaxonIds, numTotalTaxaLocal } = useMemo<{
    leafTaxonIds: number[];
    numTotalTaxaLocal: number | undefined;
  }>( () => {
    if ( currentUser ) {
      return { leafTaxonIds: [], numTotalTaxaLocal: undefined };
    }

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

    return {
      leafTaxonIds,
      numTotalTaxaLocal: leafTaxonIds.length,
    };
  }, [currentUser, realm] );

  const localObservedSpeciesCount = useMemo( () => {
    if ( currentUser || activeTab !== TAXA_TAB || !leafTaxonIds.length ) {
      return [];
    }

    const localObs = realm.objects<RealmObservation>( "Observation" )
      .filtered( "taxon.id IN $0", leafTaxonIds );

    return leafTaxonIds.map( id => {
      const obs = localObs.filter( o => o.taxon.id === id );
      return { count: obs.length, taxon: obs[0].taxon };
    } );
  }, [currentUser, activeTab, realm, leafTaxonIds] );

  // Map the selected sort option to API params
  const sortAPIParams = useMemo(
    () => mapSpeciesSortToAPIParams( speciesSortOptionId ),
    [speciesSortOptionId],
  );

  const {
    data: remoteObservedTaxaCounts,
    isFetchingNextPage: isFetchingTaxa,
    fetchNextPage: fetchMoreTaxa,
    totalResults: numTotalTaxaRemote,
    refetch: refetchTaxa,
  } = useInfiniteScroll(
    `MyObsSimple-fetchSpeciesCounts-${currentUser?.id}-${speciesSortOptionId}`,
    fetchSpeciesCounts,
    {
      user_id: currentUser?.id,
      ...( sortAPIParams || {} ),
      fields: {
        taxon: Taxon.LIMITED_TAXON_FIELDS,
      },
    },
    {
      enabled: !!currentUser,
    },
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

  useEffect( () => {
    const newObservationCount = observations.length - prevObservationsLength.current;

    if ( newObservationCount > 0 && listRef?.current ) {
      if ( listRef.current.notifyDataFetched ) {
        listRef.current.notifyDataFetched( newObservationCount );
      } else {
        console.warn( "notifyDataFetched method not found on listRef" );
      }
    }

    prevObservationsLength.current = observations.length;
  }, [observations.length, listRef] );

  const taxa = useMemo( () => {
    const unsortedTaxa = currentUser
      ? remoteObservedTaxaCounts
      : localObservedSpeciesCount;

    // For logged-in users: we get data sorted from the API
    if ( currentUser && isConnected ) {
      return unsortedTaxa || [];
    }

    // For logged-out users: apply client-side sorting to local data
    return sortSpeciesCounts( unsortedTaxa || [], speciesSortOptionId );
  }, [
    currentUser,
    isConnected,
    remoteObservedTaxaCounts,
    localObservedSpeciesCount,
    speciesSortOptionId,
  ] );

  if ( !layout ) { return null; }

  if ( observations.length === 0 ) {
    return showNoResults
      ? (
        <MyObservationsEmptySimple
          currentUser={currentUser}
          isConnected={isConnected}
          justFinishedSignup={justFinishedSignup}
        />
      )
      : (
        <FullScreenActivityIndicator />
      );
  }

  return (
    <MyObservationsSimple
      activeTab={activeTab}
      currentUser={currentUser}
      fetchMoreTaxa={fetchMoreTaxa}
      fetchFromLastObservation={fetchFromLastObservation}
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
      taxaListRef={taxaListRef}
      numTotalObservations={numOfUserObservations}
      numTotalTaxa={numOfUserSpecies}
      numUnuploadedObservations={numUnuploadedObservations}
      observations={observations}
      onEndReached={fetchNextPage}
      onListLayout={restoreScrollOffset}
      onScroll={onScroll}
      openSheet={openSheet}
      refetchTaxa={refetchTaxa}
      setActiveTab={setActiveTab}
      setOpenSheet={setOpenSheet}
      setSpeciesSortOptionId={setSpeciesSortOptionId}
      showNoResults={showNoResults}
      speciesSortOptionId={speciesSortOptionId}
      taxa={taxa}
      toggleLayout={toggleLayout}
    />
  );
};

export default MyObservationsContainer;

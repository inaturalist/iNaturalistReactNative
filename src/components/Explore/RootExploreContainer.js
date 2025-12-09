// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  PLACE_MODE,
  useExplore
} from "providers/ExploreContext";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { useCurrentUser, useDebugMode } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission";
import useStore from "stores/useStore";

import Explore from "./Explore";
import ExploreV2 from "./ExploreV2";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useExploreHeaderCount from "./hooks/useExploreHeaderCount";

const RootExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const currentUser = useCurrentUser( );
  const { isDebug } = useDebugMode();
  const rootExploreView = useStore( state => state.rootExploreView );
  const setRootExploreView = useStore( state => state.setRootExploreView );
  const rootStoredParams = useStore( state => state.rootStoredParams );
  const setRootStoredParams = useStore( state => state.setRootStoredParams );

  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions,
    hasBlockedPermissions: hasBlockedLocationPermissions,
    checkPermissions
  } = useLocationPermission( );
  const previousHasLocationPermissions = useRef();

  const {
    state, dispatch, makeSnapshot, defaultExploreLocation
  } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  const [canFetch, setCanFetch] = useState( false );

  useEffect( () => {
    async function locationPermissionsChanged() {
      if ( hasLocationPermissions && !previousHasLocationPermissions.current
        && state.placeMode === PLACE_MODE.NEARBY && !state.lat ) {
        const exploreLocation = await defaultExploreLocation();
        dispatch( {
          type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
          exploreLocation
        } );
      }

      previousHasLocationPermissions.current = hasLocationPermissions;
    }

    locationPermissionsChanged();
  }, [defaultExploreLocation, dispatch, hasLocationPermissions, state] );

  useEffect( () => {
    if ( state.placeMode === PLACE_MODE.NEARBY ) {
      checkPermissions();
    }
  }, [checkPermissions, state] );

  const updateLocation = useCallback( async ( place: Object ) => {
    checkPermissions();
    if ( place === "worldwide" ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null
      } );
    } else if ( place === "nearby" ) {
      const exploreLocation = await defaultExploreLocation( );
      // exploreLocation has a placeMode already
      // dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_NEARBY } );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation
      } );
    } else {
      navigation.setParams( { place } );
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place,
        placeId: place?.id,
        placeGuess: place?.display_name
      } );
    }
  }, [checkPermissions, defaultExploreLocation, dispatch, navigation] );

  // Object | null
  const updateUser = ( user: Object, exclude ) => {
    if ( exclude ) {
      dispatch( {
        type: EXPLORE_ACTION.EXCLUDE_USER,
        excludeUser: user
      } );
    } else {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user,
        userId: user?.id
      } );
    }
  };

  const updateProject = ( project: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_PROJECT,
      project,
      projectId: project?.id
    } );
  };

  const filteredParams = mapParamsToAPI(
    state,
    currentUser
  );

  const queryParams = {
    ...filteredParams,
    per_page: 20
  };

  // need this hook to be top-level enough that ExploreHeaderCount rerenders
  const {
    count,
    isFetching: isFetchingHeaderCount,
    handleUpdateCount,
    setIsFetching: setIsFetchingHeaderCount
  } = useExploreHeaderCount( );

  const closeFiltersModal = ( ) => {
    checkPermissions();
    setShowFiltersModal( false );
  };

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( rootStoredParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: rootStoredParams } );
      }
    } );

    return unsubscribe;
  }, [navigation, dispatch, rootStoredParams] );

  useEffect( ( ) => {
    const unsubscribe = navigation.addListener( "blur", ( ) => {
      setRootStoredParams( state );
    } );

    return unsubscribe;
  }, [navigation, setRootStoredParams, state] );

  useEffect( () => {
    if ( state.placeMode === PLACE_MODE.NEARBY
        && hasLocationPermissions
        && state.lat === undefined ) {
      updateLocation( "nearby" );
    }
  }, [
    updateLocation,
    hasLocationPermissions,
    state.placeMode,
    state.lat] );

  useEffect( () => {
    if ( hasBlockedLocationPermissions && state.placeMode === PLACE_MODE.NEARBY ) {
      updateLocation( "worldwide" );
    }
  }, [hasBlockedLocationPermissions, state.placeMode, updateLocation] );

  // Subviews need the ability to imperatively start fetching, e.g. when the
  // user switches from species to obs view
  const startFetching = useCallback( ( ) => {
    if ( hasLocationPermissions || state?.placeMode !== PLACE_MODE.NEARBY ) {
      setIsFetchingHeaderCount( true );
      setCanFetch( true );
    }
  }, [
    hasLocationPermissions,
    setIsFetchingHeaderCount,
    state?.placeMode
  ] );

  useEffect( ( ) => {
    startFetching( );
  }, [startFetching] );

  return (
    <>
      {!isDebug
        ? (
          <Explore
            canFetch={canFetch}
            closeFiltersModal={closeFiltersModal}
            count={count}
            hideBackButton
            filterByIconicTaxonUnknown={
              () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
            }
            currentExploreView={rootExploreView}
            setCurrentExploreView={setRootExploreView}
            isConnected={isConnected}
            isFetchingHeaderCount={isFetchingHeaderCount}
            handleUpdateCount={handleUpdateCount}
            openFiltersModal={openFiltersModal}
            queryParams={queryParams}
            showFiltersModal={showFiltersModal}
            updateTaxon={taxon => dispatch( { type: EXPLORE_ACTION.CHANGE_TAXON, taxon } )}
            updateLocation={updateLocation}
            updateUser={updateUser}
            updateProject={updateProject}
            placeMode={state.placeMode}
            hasLocationPermissions={hasLocationPermissions}
            requestLocationPermissions={requestLocationPermissions}
            startFetching={startFetching}
            renderLocationPermissionsGate={renderPermissionsGate}
          />
        )
        : (
          <ExploreV2
            canFetch={canFetch}
            currentExploreView={rootExploreView}
            handleUpdateCount={handleUpdateCount}
            hasLocationPermissions={hasLocationPermissions}
            isConnected={isConnected}
            placeMode={state.placeMode}
            queryParams={queryParams}
            renderLocationPermissionsGate={renderPermissionsGate}
            requestLocationPermissions={requestLocationPermissions}
          />
        )}
      {renderPermissionsGate( {
        onPermissionGranted: async ( ) => {
          await updateLocation( "nearby" );
          startFetching( );
        }
      } )}
    </>
  );
};

const RootExploreContainer = (): Node => (
  <ExploreProvider>
    <RootExploreContainerWithContext />
  </ExploreProvider>
);

export default RootExploreContainer;

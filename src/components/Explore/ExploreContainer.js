// @flow

import {
  useNetInfo
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import useStore from "stores/useStore";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useExploreHeaderCount from "./hooks/useExploreHeaderCount";
import useParams from "./hooks/useParams";

const ExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const setStoredParams = useStore( state => state.setStoredParams );
  const exploreView = useStore( state => state.exploreView );
  const setExploreView = useStore( state => state.setExploreView );

  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions
  } = useLocationPermission( );

  const currentUser = useCurrentUser();

  const { state, dispatch, makeSnapshot } = useExplore();

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  useParams( );

  const updateLocation = ( place: Object ) => {
    if ( place === "worldwide" ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null
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
  };

  const updateUser = ( user: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_USER,
      user,
      userId: user?.id
    } );
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
    count, fetchingStatus, handleUpdateCount, setFetchingStatus
  } = useExploreHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  useEffect( ( ) => {
    navigation.addListener( "blur", ( ) => {
      setStoredParams( state );
    } );
  }, [navigation, setStoredParams, state] );

  const startFetching = useCallback( ( ) => {
    const nearby = state?.placeMode === "NEARBY";
    if ( hasLocationPermissions && nearby ) {
      setFetchingStatus( true );
    } else if ( !nearby ) {
      setFetchingStatus( true );
    }
  }, [hasLocationPermissions, setFetchingStatus, state?.placeMode] );

  useEffect( ( ) => {
    startFetching( );
  }, [startFetching] );

  return (
    <>
      <Explore
        closeFiltersModal={closeFiltersModal}
        count={count}
        currentExploreView={exploreView}
        setCurrentExploreView={setExploreView}
        handleUpdateCount={handleUpdateCount}
        hideBackButton={false}
        filterByIconicTaxonUnknown={
          () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
        }
        isConnected={isConnected}
        fetchingStatus={fetchingStatus}
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
      />
      {renderPermissionsGate( {
        onPermissionGranted: () => {
          setFetchingStatus( true );
        }
      } ) }
    </>
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;

// @flow

import {
  useNetInfo,
} from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  PLACE_MODE,
  useExplore,
} from "providers/ExploreContext";
import type { Node } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { useCurrentUser, useDebugMode } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission";
import useStore from "stores/useStore";

import Explore from "./Explore";
import ExploreV2 from "./ExploreV2";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useExploreHeaderCount from "./hooks/useExploreHeaderCount";
import useParams from "./hooks/useParams";

const ExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { isConnected } = useNetInfo( );
  const { isDebug } = useDebugMode();

  const exploreView = useStore( state => state.exploreView );
  const setExploreView = useStore( state => state.setExploreView );

  const {
    hasPermissions: hasLocationPermissions,
    renderPermissionsGate,
    requestPermissions: requestLocationPermissions,
  } = useLocationPermission( );

  const currentUser = useCurrentUser();

  const { state, dispatch, makeSnapshot } = useExplore();

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  // Whether or not we can fetch results, *not* whether or not we *are*
  // fetching results. This will be set when we know what data the user wants
  // to view and whether we have the permissions we need to show it, e.g.
  // location permissions to show nearby obs
  const [canFetch, setCanFetch] = useState( false );

  useParams( );

  const updateLocation = ( place: Object ) => {
    if ( place === "worldwide" ) {
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_WORLDWIDE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
      } );
    } else {
      navigation.setParams( { place } );
      dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_PLACE } );
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        place,
        placeId: place?.id,
        placeGuess: place?.display_name,
      } );
    }
  };

  const updateUser = ( user: Object, exclude = false ) => {
    if ( exclude ) {
      dispatch( {
        type: EXPLORE_ACTION.EXCLUDE_USER,
        excludeUser: user,
      } );
    } else {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user,
        userId: user?.id,
      } );
    }
  };

  const updateProject = ( project: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.SET_PROJECT,
      project,
      projectId: project?.id,
    } );
  };

  const filteredParams = mapParamsToAPI(
    state,
    currentUser,
  );

  const queryParams = {
    ...filteredParams,
    per_page: 20,
  };

  // need this hook to be top-level enough that ExploreHeaderCount rerenders
  const {
    count,
    isFetching: isFetchingHeaderCount,
    handleUpdateCount,
    setIsFetching: setIsFetchingHeaderCount,
  } = useExploreHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

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
    state?.placeMode,
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
            currentExploreView={exploreView}
            setCurrentExploreView={setExploreView}
            handleUpdateCount={handleUpdateCount}
            hideBackButton={false}
            filterByIconicTaxonUnknown={
              () => dispatch( { type: EXPLORE_ACTION.FILTER_BY_ICONIC_TAXON_UNKNOWN } )
            }
            isConnected={isConnected}
            isFetchingHeaderCount={isFetchingHeaderCount}
            openFiltersModal={openFiltersModal}
            queryParams={queryParams}
            showFiltersModal={showFiltersModal}
            updateTaxon={taxon => dispatch( { type: EXPLORE_ACTION.CHANGE_TAXON, taxon } )}
            updateLocation={updateLocation}
            updateUser={updateUser}
            updateProject={updateProject}
            placeMode={state.placeMode}
            hasLocationPermissions={hasLocationPermissions}
            renderLocationPermissionsGate={renderPermissionsGate}
            requestLocationPermissions={requestLocationPermissions}
            startFetching={startFetching}
          />
        )
        : (
          <ExploreV2
            canFetch={canFetch}
            currentExploreView={exploreView}
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
        onPermissionGranted: startFetching,
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

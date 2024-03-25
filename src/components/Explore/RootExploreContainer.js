// @flow

import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useState } from "react";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import { useCurrentUser, useIsConnected, useTranslation } from "sharedHooks";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useHeaderCount from "./hooks/useHeaderCount";

const RootExploreContainerWithContext = ( ): Node => {
  const { t } = useTranslation( );
  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );

  const { state, dispatch, makeSnapshot } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );
  const [exploreView, setExploreView] = useState( "species" );

  const changeExploreView = newView => {
    setExploreView( newView );
  };

  const updateTaxon = ( taxon: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.CHANGE_TAXON,
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
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
  if ( exploreView === "observers" ) {
    queryParams.order_by = "observation_count";
  }

  // need this hook to be top-level enough that HeaderCount rerenders
  const { count, loadingStatus, updateCount } = useHeaderCount( );

  const closeFiltersModal = ( ) => setShowFiltersModal( false );

  const openFiltersModal = ( ) => {
    setShowFiltersModal( true );
    makeSnapshot( );
  };

  const onPermissionGranted = async ( ) => {
    if ( state.place_guess ) { return; }
    const location = await fetchUserLocation( );
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeName: t( "Nearby" ),
      lat: location?.latitude,
      lng: location?.longitude,
      radius: 50
    } );
  };

  const onPermissionDenied = ( ) => {
    if ( state.place_guess ) { return; }
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeName: t( "Worldwide" )
    } );
  };

  const onPermissionBlocked = ( ) => {
    if ( state.place_guess ) { return; }
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeName: t( "Worldwide" )
    } );
  };

  return (
    <>
      <Explore
        changeExploreView={changeExploreView}
        closeFiltersModal={closeFiltersModal}
        count={count}
        exploreView={exploreView}
        hideBackButton
        isOnline={isOnline}
        loadingStatus={loadingStatus}
        openFiltersModal={openFiltersModal}
        queryParams={queryParams}
        showFiltersModal={showFiltersModal}
        updateCount={updateCount}
        updateTaxon={updateTaxon}
      />
      <LocationPermissionGate
        permissionNeeded
        onPermissionGranted={onPermissionGranted}
        onPermissionDenied={onPermissionDenied}
        onPermissionBlocked={onPermissionBlocked}
        withoutNavigation
      />
    </>
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <RootExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;

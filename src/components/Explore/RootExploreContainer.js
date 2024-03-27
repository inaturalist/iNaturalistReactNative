// @flow

import { useNavigation } from "@react-navigation/native";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import fetchUserLocation from "sharedHelpers/fetchUserLocation";
import { useCurrentUser, useIsConnected, useTranslation } from "sharedHooks";
import useStore from "stores/useStore";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useHeaderCount from "./hooks/useHeaderCount";

const RootExploreContainerWithContext = ( ): Node => {
  const navigation = useNavigation( );
  const { t } = useTranslation( );
  const isOnline = useIsConnected( );
  const currentUser = useCurrentUser( );
  const rootExploreParams = useStore( state => state.rootExploreParams );
  const setRootExploreParams = useStore( state => state.setRootExploreParams );

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
    if ( !location || !location.latitude ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeName: t( "Worldwide" )
      } );
    } else {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeName: t( "Nearby" ),
        lat: location?.latitude,
        lng: location?.longitude,
        radius: 50
      } );
    }
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

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( rootExploreParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: rootExploreParams } );
      }
    } );

    navigation.addListener( "blur", ( ) => {
      setRootExploreParams( state );
    } );
  }, [navigation, setRootExploreParams, state, dispatch, rootExploreParams] );

  console.log( state, "state in root" );

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

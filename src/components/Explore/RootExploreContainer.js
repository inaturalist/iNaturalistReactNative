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
  const storedParams = useStore( state => state.storedParams );
  const setStoredParams = useStore( state => state.setStoredParams );

  const {
    state, dispatch, makeSnapshot, setExploreLocation
  } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );
  const [exploreView, setExploreView] = useState( "species" );

  const changeExploreView = newView => {
    setExploreView( newView );
  };

  const updateTaxon = ( taxon: object ) => {
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
    const exploreLocation = await setExploreLocation( );
    dispatch( {
      type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
      exploreLocation
    } );
  };

  const onPermissionDenied = ( ) => {
    if ( state.place_guess ) { return; }
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeGuess: t( "Worldwide" )
    } );
  };

  const onPermissionBlocked = ( ) => {
    if ( state.place_guess ) { return; }
    dispatch( {
      type: EXPLORE_ACTION.SET_PLACE,
      placeGuess: t( "Worldwide" )
    } );
  };

  useEffect( ( ) => {
    navigation.addListener( "focus", ( ) => {
      const storedState = Object.keys( storedParams ).length > 0 || false;

      if ( storedState ) {
        dispatch( { type: EXPLORE_ACTION.USE_STORED_STATE, storedState: storedParams } );
      }
    } );

    navigation.addListener( "blur", ( ) => {
      setStoredParams( state );
    } );
  }, [navigation, setStoredParams, state, dispatch, storedParams] );

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

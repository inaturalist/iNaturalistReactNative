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
  const setExploreView = useStore( state => state.setExploreView );

  const worldwidePlaceText = t( "Worldwide" );

  const {
    state, dispatch, makeSnapshot, setExploreLocation
  } = useExplore( );

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  useEffect( ( ) => {
    setExploreView( "species" );
  }, [setExploreView] );

  const updateTaxon = ( taxon: Object ) => {
    dispatch( {
      type: EXPLORE_ACTION.CHANGE_TAXON,
      taxon,
      taxonId: taxon?.id,
      taxonName: taxon?.preferred_common_name || taxon?.name
    } );
  };

  const updateLocation = ( place: Object ) => {
    if ( place === "worldwide" ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
        placeGuess: worldwidePlaceText
      } );
    } else {
      navigation.setParams( { place } );
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
        closeFiltersModal={closeFiltersModal}
        count={count}
        hideBackButton
        isOnline={isOnline}
        loadingStatus={loadingStatus}
        openFiltersModal={openFiltersModal}
        queryParams={queryParams}
        showFiltersModal={showFiltersModal}
        updateCount={updateCount}
        updateTaxon={updateTaxon}
        updateLocation={updateLocation}
        updateUser={updateUser}
        updateProject={updateProject}
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

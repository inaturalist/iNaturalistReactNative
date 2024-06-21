// @flow

import { useNavigation } from "@react-navigation/native";
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
import useParams from "./hooks/useParams";

const ExploreContainerWithContext = ( ): Node => {
  const { t } = useTranslation( );
  const navigation = useNavigation( );
  const isOnline = useIsConnected( );
  const setStoredParams = useStore( state => state.setStoredParams );

  const currentUser = useCurrentUser();

  const { state, dispatch, makeSnapshot } = useExplore();

  const [showFiltersModal, setShowFiltersModal] = useState( false );

  const worldwidePlaceText = t( "Worldwide" );

  useParams( );

  const updateTaxon = ( taxon: Object ) => {
    if ( !taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON_NONE,
        taxon: null
      } );
    } else {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        taxon,
        taxonId: taxon?.id,
        taxonName: taxon?.preferred_common_name || taxon?.name
      } );
    }
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

  useEffect( ( ) => {
    navigation.addListener( "blur", ( ) => {
      setStoredParams( state );
    } );
  }, [navigation, setStoredParams, state] );

  return (
    <Explore
      closeFiltersModal={closeFiltersModal}
      count={count}
      hideBackButton={false}
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
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;

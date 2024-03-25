// @flow

import { useRoute } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  ExploreProvider,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useCurrentUser, useIsConnected, useTranslation } from "sharedHooks";

import Explore from "./Explore";
import mapParamsToAPI from "./helpers/mapParamsToAPI";
import useHeaderCount from "./hooks/useHeaderCount";

const ExploreContainerWithContext = ( ): Node => {
  const { t } = useTranslation( );
  const { params } = useRoute( );
  const isOnline = useIsConnected( );

  const hideBackButton = false;

  const currentUser = useCurrentUser();

  const { state, dispatch, makeSnapshot } = useExplore();

  const [showFiltersModal, setShowFiltersModal] = useState( false );
  const [exploreView, setExploreView] = useState( "observations" );

  useEffect( ( ) => {
    if ( params?.viewSpecies ) {
      setExploreView( "species" );
    }
    if ( params?.worldwide ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: null,
        placeName: t( "Worldwide" )
      } );
    }
    if ( params?.taxon ) {
      dispatch( {
        type: EXPLORE_ACTION.CHANGE_TAXON,
        taxon: params.taxon,
        taxonId: params.taxon?.id,
        taxonName: params.taxon?.preferred_common_name || params.taxon?.name
      } );
    }
    if ( params?.place ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PLACE,
        placeId: params.place?.id,
        placeName: params.place?.display_name
      } );
    }
    if ( params?.user && params?.user.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_USER,
        user: params.user,
        userId: params.user.id
      } );
    }
    if ( params?.project && params?.project.id ) {
      dispatch( {
        type: EXPLORE_ACTION.SET_PROJECT,
        project: params.project,
        projectId: params.project.id
      } );
    }
  }, [params, dispatch, t] );

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

  return (
    <Explore
      changeExploreView={changeExploreView}
      closeFiltersModal={closeFiltersModal}
      count={count}
      exploreView={exploreView}
      hideBackButton={hideBackButton}
      isOnline={isOnline}
      loadingStatus={loadingStatus}
      openFiltersModal={openFiltersModal}
      queryParams={queryParams}
      showFiltersModal={showFiltersModal}
      updateCount={updateCount}
      updateTaxon={updateTaxon}
    />
  );
};

const ExploreContainer = (): Node => (
  <ExploreProvider>
    <ExploreContainerWithContext />
  </ExploreProvider>
);

export default ExploreContainer;

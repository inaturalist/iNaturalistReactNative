// @flow

import { useFocusEffect } from "@react-navigation/native";
import {
  EXPLORE_ACTION,
  useExplore
} from "providers/ExploreContext.tsx";
import type { Node } from "react";
import React, { useCallback, useState } from "react";
import { useTranslation } from "sharedHooks";

import MapView from "./MapView";

type Props = {
  queryParams: Object,
  region: Object,
  observations: Array<Object>
}

const MapViewContainer = ( {
  queryParams,
  region,
  observations
}: Props ): Node => {
  const [mapBoundaries, setMapBoundaries] = useState( {} );
  const [showMapBoundaryButton, setShowMapBoundaryButton] = useState( false );
  const { dispatch } = useExplore( );
  const { t } = useTranslation( );

  const onPanDrag = ( ) => setShowMapBoundaryButton( true );

  const updateMapBoundaries = async boundaries => {
    const boundaryAPIParams = {
      swlat: boundaries.southWest.latitude,
      swlng: boundaries.southWest.longitude,
      nelat: boundaries.northEast.latitude,
      nelng: boundaries.northEast.longitude,
      place_guess: t( "Map-Area" )
    };

    setMapBoundaries( boundaryAPIParams );
  };

  const redoSearchInMapArea = ( ) => {
    setShowMapBoundaryButton( false );
    dispatch( { type: EXPLORE_ACTION.SET_MAP_BOUNDARIES, mapBoundaries } );
  };

  useFocusEffect(
    useCallback( ( ) => {
      setShowMapBoundaryButton( false );
    }, [] )
  );

  return (
    <MapView
      observations={observations}
      onPanDrag={onPanDrag}
      redoSearchInMapArea={redoSearchInMapArea}
      region={region}
      showMapBoundaryButton={showMapBoundaryButton}
      tileMapParams={queryParams}
      updateMapBoundaries={updateMapBoundaries}
    />
  );
};

export default MapViewContainer;

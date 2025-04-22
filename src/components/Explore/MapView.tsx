import {
  ActivityIndicator,
  Button,
  Map
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import { View } from "components/styledComponents";
import { MapBoundaries, PLACE_MODE, useExplore } from "providers/ExploreContext.tsx";
import React, { useEffect } from "react";
import { Region } from "react-native-maps";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import useMapLocation from "./hooks/useMapLocation";

const DELTA = 0.02;

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6
} );

interface Props {
  // Bounding box of the observations retrieved for the query params
  observationBounds?: MapBoundaries,
  queryParams: {
    taxon_id?: number;
    return_bounds?: boolean;
    order?: string;
    orderBy?: string;
  };
  currentMapRegion: Region;
  setCurrentMapRegion: ( Region ) => void;
  isLoading: boolean
}

const MapView = ( {
  observationBounds,
  queryParams,
  currentMapRegion,
  isLoading,
  setCurrentMapRegion
}: Props ) => {
  const { t } = useTranslation( );
  const { state: exploreState } = useExplore( );

  const {
    onPanDrag,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    updateMapBoundaries
  } = useMapLocation( currentMapRegion, setCurrentMapRegion );

  // TODO this should really be a part of the explore reducer
  useEffect( ( ) => {
    if (
      observationBounds
      && [
        PLACE_MODE.WORLDWIDE,
        PLACE_MODE.PLACE,
        PLACE_MODE.NEARBY
      ].indexOf( exploreState.placeMode ) >= 0
    ) {
      updateMapBoundaries( getMapRegion( observationBounds ) );
    }
  }, [observationBounds, updateMapBoundaries, exploreState.placeMode] );

  const tileMapParams = {
    ...queryParams
  };
  // Tile queries never need these params
  delete tileMapParams.return_bounds;
  delete tileMapParams.order;
  delete tileMapParams.orderBy;

  const initialRegion = {
    ...region,
    longitudeDelta: DELTA,
    latitudeDelta: DELTA
  };

  console.log( region, "region in Explore MapView", initialRegion );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <View className="z-10">
        {showMapBoundaryButton && (
          <View
            className="mx-auto"
            style={DROP_SHADOW}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-[60px] absolute self-center"
              onPress={redoSearchInMapArea}
            />
          </View>
        )}
      </View>
      {isLoading
        ? <View className="h-full flex justify-center"><ActivityIndicator size={50} /></View>
        : (
          <Map
            currentLocationButtonClassName="left-5 bottom-20"
            onPanDrag={onPanDrag}
            onRegionChangeComplete={updateMapBoundaries}
            initialRegion={initialRegion}
            showCurrentLocationButton
            showSwitchMapTypeButton
            showsCompass={false}
            switchMapTypeButtonClassName="left-20 bottom-20"
            showsUserLocation
            tileMapParams={tileMapParams}
            withPressableObsTiles={tileMapParams !== null}
          />
        )}
    </View>
  );
};

export default MapView;

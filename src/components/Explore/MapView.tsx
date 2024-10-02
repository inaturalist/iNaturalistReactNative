import {
  Button,
  Map
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers.ts";
import { View } from "components/styledComponents";
import { MapBoundaries, PLACE_MODE, useExplore } from "providers/ExploreContext.tsx";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { useTranslation } from "sharedHooks";
import { getShadow } from "styles/global";

import useMapLocation from "./hooks/useMapLocation";

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
}

const MapView = ( {
  observationBounds,
  queryParams
}: Props ) => {
  const { t } = useTranslation( );
  const { state: exploreState } = useExplore( );

  const {
    onPanDrag,
    redoSearchInMapArea,
    region,
    showMapBoundaryButton,
    updateMapBoundaries
  } = useMapLocation( );

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
      <Map
        currentLocationButtonClassName="left-5 bottom-20"
        onPanDrag={onPanDrag}
        onRegionChangeComplete={async ( newRegion, boundaries ) => {
          // Seems to be a bug in react-native-maps where
          // onRegionChangeComplete fires once on initial load before the
          // region actually changes, so we're just ignoring that update
          // here
          if ( Platform.OS === "android" && Math.round( newRegion.latitude ) === 0 ) {
            return;
          }
          await updateMapBoundaries( newRegion, boundaries );
        }}
        region={region}
        showCurrentLocationButton
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-20"
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
      />
    </View>
  );
};

export default MapView;

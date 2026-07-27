import type { ApiTotalBounds } from "api/types";
import type {
  ExploreV2QueryParams,
  NearbyCoords,
} from "components/Explore/ExploreV2/helpers/buildQueryParams";
import ActivityIndicator from "components/SharedComponents/ActivityIndicator";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import Map from "components/SharedComponents/Map/Map";
import { View } from "components/styledComponents";
import { EXPLORE_V2_PLACE_MODE } from "providers/ExploreV2Context";
import React, { useMemo } from "react";
import type { Region } from "react-native-maps";

// matching v1 explore
const NEARBY_DELTA = 0.02;

const WORLDWIDE_REGION: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 180,
  longitudeDelta: 180,
};

const activityIndicatorSize = 50;

interface Props {
  isLoading: boolean;
  nearbyCoords?: NearbyCoords;
  placeMode: EXPLORE_V2_PLACE_MODE;
  queryParams: ExploreV2QueryParams;
  totalBounds?: ApiTotalBounds;
}

const ExploreV2MapView = ( {
  isLoading,
  nearbyCoords,
  placeMode,
  queryParams,
  totalBounds,
}: Props ) => {
  const {
    swlat, swlng, nelat, nelng,
  } = totalBounds || {};

  // The region the camera should be showing for the current context
  const targetRegion = useMemo( ( ): Region | undefined => {
    if ( placeMode === EXPLORE_V2_PLACE_MODE.NEARBY ) {
      return nearbyCoords
        ? {
          latitude: nearbyCoords.lat,
          longitude: nearbyCoords.lng,
          latitudeDelta: NEARBY_DELTA,
          longitudeDelta: NEARBY_DELTA,
        }
        : undefined;
    }
    // Every other mode supplies bounds, but we can fall back to worldwide
    // the corncers being undefined here represents a loading state
    const hasBounds = swlat !== undefined
      && swlng !== undefined
      && nelat !== undefined
      && nelng !== undefined;
    return hasBounds
      ? getMapRegion( {
        swlat, swlng, nelat, nelng,
      } )
      : WORLDWIDE_REGION;
  }, [placeMode, nearbyCoords, swlat, swlng, nelat, nelng] );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <Map
        initialRegion={targetRegion || WORLDWIDE_REGION}
        isLoading={isLoading}
        regionToAnimate={targetRegion}
        showCurrentLocationButton
        showsCompass={false}
        showSwitchMapTypeButton
        showsUserLocation
        switchMapTypeButtonClassName="right-5 bottom-20"
        tileMapParams={queryParams}
        withPressableObsTiles
      />
      {isLoading && (
        <View
          className="absolute top-0 bottom-0 left-0 right-0 items-center justify-center"
          testID="ExploreV2MapView.loading"
        >
          <ActivityIndicator size={activityIndicatorSize} />
        </View>
      )}
    </View>
  );
};

export default ExploreV2MapView;

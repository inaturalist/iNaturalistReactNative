import { ActivityIndicator, Map } from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import { View } from "components/styledComponents";
import React, { useMemo } from "react";
import type { Region } from "react-native-maps";

import useMyObservationsMapBounds from "./hooks/useMyObservationsMapBounds";

interface Props {
  userId?: number;
}

// default shown before the user's observation bounds have loaded, just a placeholder
// until `regionToAnimate` below moves the camera to fit the user's observations.
const WORLDWIDE_REGION: Region = {
  latitude: 0,
  longitude: 0,
  latitudeDelta: 180,
  longitudeDelta: 180,
};

const activityIndicatorSize = 50;

const MyObservationsMapView = ( { userId }: Props ) => {
  const { totalBounds, isLoading } = useMyObservationsMapBounds( userId, true );

  const regionToAnimate = useMemo(
    ( ) => ( totalBounds
      ? getMapRegion( totalBounds )
      : undefined ),
    [totalBounds],
  );

  return (
    <View className="flex-1 overflow-hidden h-full">
      <Map
        currentLocationButtonClassName="left-5 bottom-20"
        initialRegion={WORLDWIDE_REGION}
        isLoading={isLoading}
        regionToAnimate={regionToAnimate}
        showCurrentLocationButton
        showSwitchMapTypeButton
        showsUserLocation
        switchMapTypeButtonClassName="left-20 bottom-20"
        tileMapParams={{ user_id: userId }}
        withPressableObsTiles
      />
      {isLoading && (
        <View
          className="absolute inset-0 items-center justify-center"
          testID="MyObservationsMapView.loading"
        >
          <ActivityIndicator size={activityIndicatorSize} />
        </View>
      )}
    </View>
  );
};

export default MyObservationsMapView;

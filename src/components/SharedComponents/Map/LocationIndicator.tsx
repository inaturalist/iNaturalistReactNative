import LocationIndicatorIcon from "images/svg/location_indicator.svg";
import React from "react";
import {
  Circle,
  Marker,
} from "react-native-maps";
import colors from "styles/tailwindColors";

interface Props {
  latitude: number;
  longitude: number;
  positionalAccuracy?: number;
}

const LocationIndicator = ( {
  latitude,
  longitude,
  positionalAccuracy,
}: Props ) => (
  <>
    {!!positionalAccuracy && (
      <Circle
        center={{ latitude, longitude }}
        radius={positionalAccuracy}
        strokeWidth={2}
        strokeColor={colors.inatGreen}
        fillColor="rgba( 116, 172, 0, 0.2 )"
      />
    )}
    <Marker
      coordinate={{ latitude, longitude }}
    >
      <LocationIndicatorIcon
        testID="Map.LocationIndicator"
        width={25}
        height={32}
      />
    </Marker>
  </>
);

export default LocationIndicator;

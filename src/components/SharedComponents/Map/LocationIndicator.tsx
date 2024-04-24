import LocationIndicatorIcon from "images/svg/location_indicator.svg";
import type { Node } from "react";
import React from "react";
import {
  Circle,
  Marker
} from "react-native-maps";
import { useTheme } from "react-native-paper";

interface Props {
  obsLatitude: number,
  obsLongitude: number,
  positionalAccuracy?: number,
  showLocationIndicator?: boolean,
}

const LocationIndicator = ( {
  obsLatitude,
  obsLongitude,
  positionalAccuracy,
  showLocationIndicator
}: Props ): Node => {
  const theme = useTheme( );

  const locationIndicator = ( ) => (
    <LocationIndicatorIcon
      testID="Map.LocationIndicator"
      width={25}
      height={32}
    />
  );

  return showLocationIndicator && (
    <>
      <Circle
        center={{
          latitude: obsLatitude,
          longitude: obsLongitude
        }}
        radius={positionalAccuracy}
        strokeWidth={2}
        strokeColor={theme.colors.inatGreen}
        fillColor="rgba( 116, 172, 0, 0.2 )"
      />
      <Marker
        coordinate={{
          latitude: obsLatitude,
          longitude: obsLongitude
        }}
      >
        {locationIndicator( )}
      </Marker>
    </>
  );
};

export default LocationIndicator;

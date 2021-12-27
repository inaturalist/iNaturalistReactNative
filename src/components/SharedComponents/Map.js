// @flow

import * as React from "react";
import { View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

import { viewStyles } from "../../styles/sharedComponents/map";
import { useUserLocation } from "./hooks/useUserLocation";

type Props = {
  obsLatitude?: number,
  obsLongitude?: number,
  mapHeight?: number,
  taxonId?: number
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( { obsLatitude, obsLongitude, mapHeight, taxonId }: Props ): React.Node => {
  const latLng = useUserLocation( );

  const initialLatitude = latLng && latLng.latitude;
  const initialLongitude = latLng && latLng.longitude;

  const urlTemplate = taxonId && `https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}&color=%2377B300&verifiable=true`;

  if ( !latLng || !latLng.latitude ) {
    // TODO: add fallbacks (maybe Cupertino and MountainView) for initial region
    // when user has no location permissions or no geolocation
    return null;
  }

  return (
    <View
      style={[viewStyles.mapContainer, mapHeight ? { height: mapHeight } : null]}
      testID="MapView"
    >
      <MapView
        style={viewStyles.map}
        initialRegion={{
          latitude: initialLatitude,
          longitude: initialLongitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421
        }}
      >
        {taxonId && (
          <UrlTile
            tileSize={512}
            urlTemplate={urlTemplate}
          />
        )}
      </MapView>
    </View>
  );
};

export default Map;

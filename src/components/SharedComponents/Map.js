// @flow

import * as React from "react";
import { View } from "react-native";
import MapView, { UrlTile } from "react-native-maps";

import { viewStyles } from "../../styles/sharedComponents/map";
import useFetchUserLocation from "./hooks/fetchUserLocation";

type Props = {
  obsLatitude?: number,
  obsLongitude?: number,
  mapHeight?: number,
  taxonId?: number
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( { obsLatitude, obsLongitude, mapHeight, taxonId }: Props ): React.Node => {
  // TODO: get location permissions working in iOS
  const latLng = useFetchUserLocation( );
  // TODO: fallback to MountainView latlng for Android devices?
  // const cupertinoLatitude = 37.3229978;
  // const cupertinoLongitude = -122.0321823;

  // const initialLatitude = latLng ? latLng.latitude : cupertinoLatitude;
  // const initialLongitude = latLng ? latLng.longitude : cupertinoLongitude;

  const initialLatitude = latLng && latLng.latitude;
  const initialLongitude = latLng && latLng.longitude;

  const urlTemplate = taxonId && `https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}&color=%2377B300&verifiable=true`;

  console.log( latLng && latLng.latitude, "user latitude" );

  if ( !latLng || !latLng.latitude ) {
    return null;
  }

  return (
    <View style={[viewStyles.mapContainer, mapHeight ? { height: mapHeight } : null]}>
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

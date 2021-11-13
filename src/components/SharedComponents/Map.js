// @flow

import * as React from "react";
import { View } from "react-native";
import MapView from "react-native-maps";
import { viewStyles } from "../../styles/sharedComponents/map";

type Props = {
  latitude: number,
  longitude: number
}

// this component will need a fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( { latitude, longitude }: Props ): React.Node => (
  <View style={viewStyles.mapContainer}>
    <MapView
      style={viewStyles.map}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421
      }}
    />
  </View>
);

export default Map;

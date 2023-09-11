// @flow

import { useNavigation } from "@react-navigation/native";
import { Image, View } from "components/styledComponents";
import * as React from "react";
import MapView, { Marker } from "react-native-maps";
import useUserLocation from "sharedHooks/useUserLocation";

type Props = {
  obsLatitude?: number,
  obsLongitude?: number,
  mapHeight?: number,
  updateCoords?: Function,
  region?: Object,
  showLocationIndicator?: boolean,
  hideMap?: boolean,
  observations?: Array<Object>
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude, obsLongitude, mapHeight, updateCoords, region,
  showLocationIndicator, hideMap, observations
}: Props ): React.Node => {
  const navigation = useNavigation( );
  const { latLng: viewerLatLng } = useUserLocation( { skipPlaceGuess: true } );

  const initialLatitude = obsLatitude || ( viewerLatLng?.latitude );
  const initialLongitude = obsLongitude || ( viewerLatLng?.longitude );

  // const urlTemplate = taxonId && `https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}&color=%2377B300&verifiable=true`;

  const initialRegion = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2
  };

  const displayLocation = ( ) => (
    <Marker
      coordinate={{
        latitude: obsLatitude,
        longitude: obsLongitude
      }}
    >
      <Image
        source={require( "images/location_indicator.png" )}
        className="w-[25px] h-[32px]"
        accessibilityIgnoresInvertColors
      />
    </Marker>
  );

  return (
    <View
      style={[
        mapHeight
          ? { height: mapHeight }
          : null
      ]}
      testID="MapView"
      className="flex-1"
    >
      {!hideMap && (
        <MapView
          className="flex-1"
          region={( region?.latitude )
            ? region
            : initialRegion}
          onRegionChange={updateCoords}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
        >
          {observations?.map( observation => (
            <Marker
              key={`ExploreMap.TaxonMarker.${observation.uuid}`}
              coordinate={{
                latitude: observation.latitude,
                longitude: observation.longitude
              }}
              onPress={( ) => navigation.navigate( "ObsDetails", { uuid: observation.uuid } )}
            >
              <Image
                source={require( "images/location_indicator.png" )}
                className="w-[25px] h-[32px]"
                accessibilityIgnoresInvertColors
              />
            </Marker>
          ) ) }
          {showLocationIndicator && displayLocation( )}
        </MapView>
      )}
    </View>
  );
};

export default Map;

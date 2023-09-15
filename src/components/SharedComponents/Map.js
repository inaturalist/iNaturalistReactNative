// @flow

import LocationIndicator from "images/svg/location_indicator.svg";
import ObscuredLocationIndicator from "images/svg/obscured_location_indicator.svg";
import * as React from "react";
import { View } from "react-native";
import MapView, {
  Circle,
  Marker, Polygon, UrlTile
} from "react-native-maps";
import useUserLocation from "sharedHooks/useUserLocation";
import { viewStyles } from "styles/sharedComponents/map";

const OBSCURATION_VALUE = 0.2;

type Props = {
  obsLatitude: number,
  obsLongitude: number,
  mapHeight?: number|string, // allows for height to be defined as px or percentage
  taxonId?: number,
  updateCoords?: Function,
  region?: Object,
  showMarker?: boolean,
  hideMap?: boolean,
  openMapDetails?: Function,
  children?: any,
  mapType?: string,
  positionalAccuracy?: number,
  mapViewRef?: any,
  obscured?: boolean
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude, obsLongitude, mapHeight, taxonId, updateCoords, region, showMarker, hideMap,
  openMapDetails, children, mapType, positionalAccuracy, mapViewRef, obscured
}: Props ): React.Node => {
  const { latLng: viewerLatLng } = useUserLocation( { skipPlaceGuess: true } );

  const initialLatitude = obsLatitude || ( viewerLatLng?.latitude );
  const initialLongitude = obsLongitude || ( viewerLatLng?.longitude );

  const urlTemplate = taxonId && `https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}&color=%2377B300&verifiable=true`;

  const initialRegion = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4
  };

  const locationIndicator = () => (
    // $FlowIgnore
    <LocationIndicator width={25} height={32} />
  );

  const obscuredlLocationIndicator = () => (
    // $FlowIgnore
    <ObscuredLocationIndicator width={31} height={31} />
  );

  return (
    <View
      style={[
        viewStyles.mapContainer,
        mapHeight
          ? { height: mapHeight }
          : null
      ]}
      testID="MapView"
    >
      {!hideMap && (
        <MapView
          ref={mapViewRef}
          style={viewStyles.map}
          onPress={() => { if ( openMapDetails ) openMapDetails( ); }}
          region={( region?.latitude )
            ? region
            : initialRegion}
          onRegionChange={updateCoords}
          showsUserLocation
          showsMyLocationButton
          loadingEnabled
          mapType={mapType || "standard"}
        >
          {taxonId && (
            <UrlTile
              tileSize={512}
              urlTemplate={urlTemplate}
            />
          )}
          {( showMarker && !obscured ) && (
            <>
              <Circle
                center={{
                  latitude: obsLatitude,
                  longitude: obsLongitude
                }}
                radius={positionalAccuracy}
                strokeWidth={2}
                strokeColor="#74AC00"
                fillColor="rgba( 116, 172, 0, 0.2 )"
              />
              <Marker
                coordinate={{
                  latitude: obsLatitude,
                  longitude: obsLongitude
                }}
              >
                {locationIndicator()}
              </Marker>
            </>
          )}
          {( showMarker && obscured )
          && (
            <>
              <Polygon
                coordinates={[
                  {
                    latitude: obsLatitude + OBSCURATION_VALUE,
                    longitude: obsLongitude + OBSCURATION_VALUE
                  },
                  {
                    latitude: obsLatitude + OBSCURATION_VALUE,
                    longitude: obsLongitude - OBSCURATION_VALUE
                  },
                  {
                    latitude: obsLatitude - OBSCURATION_VALUE,
                    longitude: obsLongitude - OBSCURATION_VALUE
                  },
                  {
                    latitude: obsLatitude - OBSCURATION_VALUE,
                    longitude: obsLongitude + OBSCURATION_VALUE
                  }
                ]}
                strokeWidth={2}
                strokeColor="#74AC00"
                fillColor="rgba( 116, 172, 0, 0.2 )"
              />
              <Marker
                coordinate={{
                  latitude: obsLatitude,
                  longitude: obsLongitude
                }}
              >
                {obscuredlLocationIndicator()}
              </Marker>
            </>
          )}
        </MapView>
      )}
      {children}
    </View>
  );
};

export default Map;

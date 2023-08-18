// @flow

import { Image } from "components/styledComponents";
import * as React from "react";
import { useMemo } from "react";
import { View } from "react-native";
import MapView, {
  Circle, Marker, Polygon, UrlTile
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
  privacy?: string,
  openMapDetails?: Function,
  children?: any,
  mapType?: string,
  positionalAccuracy?: number
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude, obsLongitude, mapHeight, taxonId, updateCoords, region, privacy, showMarker,
  openMapDetails, children, mapType, positionalAccuracy
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

  const returnRandomArbitraryCoordinates = () => {
    const latMin = obsLatitude - OBSCURATION_VALUE;
    const latMax = obsLatitude + OBSCURATION_VALUE;
    const longMin = obsLongitude - OBSCURATION_VALUE;
    const longMax = obsLongitude + OBSCURATION_VALUE;
    return {
      latitude: Math.random() * ( latMax - latMin ) + latMin,
      longitude: Math.random() * ( longMax - longMin ) + longMin
    };
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const obscuredCoordinates = useMemo( () => returnRandomArbitraryCoordinates(), [] );
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
      <MapView
        style={viewStyles.map}
        onPress={() => { if ( openMapDetails ) openMapDetails(); }}
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
        {( showMarker && privacy !== "obscured" ) && (
          <>
            <Circle
              center={{
                latitude: obsLatitude,
                longitude: obsLongitude
              }}
              radius={positionalAccuracy}
              strokeWidth={1}
              strokeColor="#74AC00"
              fillColor="rgba( 116, 172, 0, 0.2 )"
            />
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
          </>
        )}
        {( showMarker && privacy === "obscured" )
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
                strokeWidth={1}
                strokeColor="#74AC00"
                fillColor="rgba( 116, 172, 0, 0.2 )"
              />
              <Marker
                coordinate={{
                  latitude: obscuredCoordinates.latitude,
                  longitude: obscuredCoordinates.longitude
                }}
              >
                <Image
                  source={require( "images/obscuredlocation-indicator.png" )}
                  className="w-[31px] h-[31px]"
                  accessibilityIgnoresInvertColors
                />
              </Marker>
            </>
          )}
      </MapView>
      {children}
    </View>
  );
};

export default Map;

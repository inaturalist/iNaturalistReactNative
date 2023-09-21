// @flow

import { useNavigation } from "@react-navigation/native";
import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import MapView, { Marker, UrlTile } from "react-native-maps";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";
import { useDeviceOrientation, useUserLocation } from "sharedHooks";

const calculateZoom = ( width, delta ) => Math.round(
  Math.log2( 360 * ( width / 256 / delta ) ) + 1
);

const tilesUrl = "https://tiles.inaturalist.org/v1/points";
const baseUrl = "https://api.inaturalist.org/v2";

type Props = {
  obsLatitude?: number,
  obsLongitude?: number,
  mapHeight?: number,
  updateCoords?: Function,
  region?: Object,
  showLocationIndicator?: boolean,
  hideMap?: boolean,
  tileMapParams?: Object
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude, obsLongitude, mapHeight, updateCoords, region,
  showLocationIndicator, hideMap, tileMapParams
}: Props ): Node => {
  const { screenWidth } = useDeviceOrientation( );
  const [currentZoom, setCurrentZoom] = useState(
    region
      ? calculateZoom( screenWidth, region.longitudeDelta )
      : 5
  );
  const navigation = useNavigation( );
  const { latLng: viewerLatLng } = useUserLocation( { skipPlaceGuess: true } );

  const initialLatitude = obsLatitude || ( viewerLatLng?.latitude );
  const initialLongitude = obsLongitude || ( viewerLatLng?.longitude );

  const initialRegion = {
    latitude: initialLatitude,
    longitude: initialLongitude,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2
  };

  const params = {
    ...tileMapParams,
    color: "%2374ac00",
    verifiable: "true"
  };

  const queryString = Object.keys( params ).map( key => `${key}=${params[key]}` ).join( "&" );

  const url = currentZoom > 13
    ? `${baseUrl}/points/{z}/{x}/{y}.png`
    : `${baseUrl}/grid/{z}/{x}/{y}.png`;
  const urlTemplate = `${url}?${queryString}`;

  const onMapPress = async latLng => {
    const UTFPosition = createUTFPosition( currentZoom, latLng.latitude, latLng.longitude );
    const {
      mTilePositionX,
      mTilePositionY,
      mPixelPositionX,
      mPixelPositionY
    } = UTFPosition;
    const tilesParams = {
      ...params,
      style: "geotilegrid"
    };
    const gridQuery = Object.keys( tilesParams )
      .map( key => `${key}=${tilesParams[key]}` ).join( "&" );

    const gridUrl = `${tilesUrl}/${currentZoom}/${mTilePositionX}/${mTilePositionY}.grid.json`;
    const gridUrlTemplate = `${gridUrl}?${gridQuery}`;

    const options = {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    };

    const response = await fetch( gridUrlTemplate, options );
    const json = await response.json( );

    const observation = getDataForPixel( mPixelPositionX, mPixelPositionY, json );
    const uuid = observation?.uuid;

    if ( uuid ) {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  };

  const displayLocation = ( ) => (
    <Marker
      coordinate={{
        latitude: obsLatitude,
        longitude: obsLongitude
      }}
    >
      <Image
        testID="Map.LocationMarkerImage"
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
          onRegionChangeComplete={async r => {
            setCurrentZoom( calculateZoom( screenWidth, r.longitudeDelta ) );
          }}
          onPress={e => onMapPress( e.nativeEvent.coordinate )}
        >
          {urlTemplate && (
            <UrlTile
              tileSize={512}
              urlTemplate={urlTemplate}
            />
          )}
          {showLocationIndicator && displayLocation( )}
        </MapView>
      )}
    </View>
  );
};

export default Map;

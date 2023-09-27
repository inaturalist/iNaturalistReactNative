// @flow

import { useNavigation } from "@react-navigation/native";
import { View } from "components/styledComponents";
import LocationIndicator from "images/svg/location_indicator.svg";
import ObscuredLocationIndicator from "images/svg/obscured_location_indicator.svg";
import type { Node } from "react";
import React, { useState } from "react";
import MapView, {
  Circle, Marker, Polygon, UrlTile
} from "react-native-maps";
import createUTFPosition from "sharedHelpers/createUTFPosition";
import getDataForPixel from "sharedHelpers/fetchUTFGridData";
import { useDeviceOrientation, useUserLocation } from "sharedHooks";

const calculateZoom = ( width, delta ) => Math.round(
  Math.log2( 360 * ( width / 256 / delta ) ) + 1
);

const tilesUrl = "https://tiles.inaturalist.org/v1/points";
const baseUrl = "https://api.inaturalist.org/v2";

const OBSCURATION_VALUE = 0.2;

type Props = {
  obsLatitude: number,
  obsLongitude: number,
  mapHeight?: number|string, // allows for height to be defined as px or percentage
  updateCoords?: Function,
  region?: Object,
  showLocationIndicator?: boolean,
  hideMap?: boolean,
  tileMapParams?: Object,
  children?: any,
  mapType?: string,
  positionalAccuracy?: number,
  mapViewRef?: any,
  obscured?: boolean,
  showExplore?: boolean,
  openMapScreen?: Function
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude, obsLongitude, mapHeight, updateCoords, region, showLocationIndicator,
  hideMap, tileMapParams, children, mapType, positionalAccuracy, mapViewRef, obscured, showExplore,
  openMapScreen
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
    latitudeDelta: 0.4,
    longitudeDelta: 0.4
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

  const exploreNavigateToDetails = async latLng => {
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

  const onMapPress = coordinate => {
    if ( showExplore ) {
      exploreNavigateToDetails( coordinate );
    } else if ( openMapScreen ) {
      openMapScreen();
    }
  };

  const locationIndicator = () => (
    // $FlowIgnore
    <LocationIndicator
      testID="Map.LocationIndicator"
      width={25}
      height={32}
    />
  );

  const obscuredlLocationIndicator = () => (
    // $FlowIgnore
    <ObscuredLocationIndicator
      testID="Map.ObscuredLocationIndicator"
      width={31}
      height={31}
    />
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
          ref={mapViewRef}
          testID="Map.MapView"
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
          mapType={mapType || "standard"}
        >
          {( urlTemplate && showExplore ) && (
            <UrlTile
              testID="Map.UrlTile"
              tileSize={512}
              urlTemplate={urlTemplate}
            />
          )}
          {( showLocationIndicator && ( !obscured ) ) && (
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
          {( showLocationIndicator && obscured )
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

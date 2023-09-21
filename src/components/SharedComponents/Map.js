// @flow

import { INatIconButton } from "components/SharedComponents";
import LocationPermissionGate from "components/SharedComponents/LocationPermissionGate";
import { Image } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { useTheme } from "react-native-paper";
import useTranslation from "sharedHooks/useTranslation";
import useUserLocation from "sharedHooks/useUserLocation";
import { getShadowStyle } from "styles/global";
import { viewStyles } from "styles/sharedComponents/map";

type Props = {
  obsLatitude?: number,
  obsLongitude?: number,
  mapHeight?: number,
  taxonId?: number,
  updateCoords?: Function,
  region?: Object,
  showMarker?: boolean,
  hideMap?: boolean,
  showCurrentLocationButton?: boolean
}

const getShadow = shadowColor => getShadowStyle( {
  shadowColor,
  offsetWidth: 0,
  offsetHeight: 2,
  shadowOpacity: 0.25,
  shadowRadius: 2,
  elevation: 5
} );

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  obsLatitude,
  obsLongitude,
  mapHeight,
  taxonId,
  updateCoords,
  region,
  showMarker,
  hideMap,
  showCurrentLocationButton
}: Props ): Node => {
  const { latLng: viewerLatLng } = useUserLocation( { skipPlaceGuess: true } );
  const theme = useTheme( );
  const [permissionRequested, setPermissionRequested] = useState( false );
  const [showsUserLocation, setShowsUserLocation] = useState( false );
  const [userLocation, setUserLocation] = useState( null );
  const { t } = useTranslation( );
  const mapRef = useRef( );

  const initialLatitude = obsLatitude || ( viewerLatLng?.latitude );
  const initialLongitude = obsLongitude || ( viewerLatLng?.longitude );

  const urlTemplate = taxonId && `https://api.inaturalist.org/v2/grid/{z}/{x}/{y}.png?taxon_id=${taxonId}&color=%2377B300&verifiable=true`;

  const initialRegion = {
    latitude: initialLatitude || 0,
    longitude: initialLongitude || 0,
    latitudeDelta: initialLatitude
      ? 0.2
      : 100,
    longitudeDelta: initialLatitude
      ? 0.2
      : 100
  };

  const panToUserLocation = useCallback( ( ) => {
    if ( !userLocation ) return;

    mapRef?.current?.animateCamera( {
      center: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }
    } );
  }, [mapRef, userLocation] );

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
        <>
          <MapView
            style={viewStyles.map}
            region={( region?.latitude )
              ? region
              : initialRegion}
            onRegionChange={updateCoords}
            onUserLocationChange={locationChangeEvent => {
              setUserLocation( locationChangeEvent?.nativeEvent?.coordinate );
            }}
            showsUserLocation={showsUserLocation}
            loadingEnabled
            ref={mapRef}
          >
            {taxonId && (
              <UrlTile
                tileSize={512}
                urlTemplate={urlTemplate}
              />
            )}
            {showMarker && (
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
            )}
          </MapView>
          { showCurrentLocationButton && (
            <INatIconButton
              icon="location-crosshairs"
              className="absolute bottom-5 right-5 bg-white rounded-full"
              style={getShadow( theme.colors.primary )}
              accessibilityLabel={t( "User-location" )}
              onPress={( ) => setPermissionRequested( true )}
            />
          )}
        </>
      )}
      <LocationPermissionGate
        permissionNeeded={permissionRequested}
        onPermissionGranted={( ) => {
          setPermissionRequested( false );
          setShowsUserLocation( true );
          panToUserLocation( );
        }}
        onPermissionBlocked={( ) => {
          setPermissionRequested( false );
          setShowsUserLocation( false );
        }}
        onPermissionDenied={( ) => {
          setPermissionRequested( false );
          setShowsUserLocation( false );
        }}
        withoutNavigation
      />
    </View>
  );
};

export default Map;

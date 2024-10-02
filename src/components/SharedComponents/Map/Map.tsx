import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { DimensionValue, ViewStyle } from "react-native";
import MapView, {
  BoundingBox, LatLng, MapType, Region
} from "react-native-maps";
import { useDebugMode, useDeviceOrientation } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";

import CurrentLocationButton from "./CurrentLocationButton";
import {
  calculateZoom,
  fetchObservationUUID,
  metersToLatitudeDelta,
  OBSCURATION_CELL_SIZE,
  obscurationCellForLatLng,
  zoomToDeltas
} from "./helpers/mapHelpers";
import LocationIndicator from "./LocationIndicator";
import ObscuredLocationIndicator from "./ObscuredLocationIndicator";
import ObsUrlTile from "./ObsUrlTile";
import SwitchMapTypeButton from "./SwitchMapTypeButton";

const CURRENT_LOCATION_ZOOM_LEVEL = 15; // target zoom level when user hits current location btn
const MIN_ZOOM_LEVEL = 0; // default in react-native-maps, for Google Maps only
const MIN_CENTER_COORDINATE_DISTANCE = 5;

interface Props {
  children?: React.ReactNode;
  className?: string;
  currentLocationButtonClassName?: string;
  initialRegion?: boolean;
  mapHeight?: DimensionValue; // allows for height to be defined as px or percentage
  mapType?: MapType;
  mapViewClassName?: string;
  obscured?: boolean;
  obsLatitude?: number;
  obsLongitude?: number;
  onCurrentLocationPress?: () => void;
  onMapReady?: () => void;
  onPanDrag?: () => void;
  onRegionChangeComplete?: ( _r: Region, _b: BoundingBox | undefined ) => void;
  openMapScreen?: () => void;
  positionalAccuracy?: number;
  region?: Region;
  regionToAnimate?: Object;
  scrollEnabled?: boolean;
  showCurrentLocationButton?: boolean;
  showLocationIndicator?: boolean;
  showsCompass?: boolean;
  showSwitchMapTypeButton?: boolean;
  style?: ViewStyle;
  switchMapTypeButtonClassName?: string;
  testID?: string;
  tileMapParams?: Object | null;
  withObsTiles?: boolean;
  withPressableObsTiles?: boolean;
  zoomEnabled?: boolean;
  zoomTapEnabled?: boolean;
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = ( {
  children,
  className = "flex-1",
  currentLocationButtonClassName,
  initialRegion,
  mapHeight,
  mapType,
  mapViewClassName,
  obscured,
  obsLatitude,
  obsLongitude,
  onCurrentLocationPress,
  onMapReady = ( ) => undefined,
  onPanDrag = ( ) => undefined,
  onRegionChangeComplete,
  openMapScreen,
  positionalAccuracy,
  region,
  regionToAnimate,
  scrollEnabled = true,
  showCurrentLocationButton,
  showLocationIndicator,
  showsCompass,
  showSwitchMapTypeButton,
  style,
  switchMapTypeButtonClassName,
  testID,
  tileMapParams,
  withObsTiles,
  withPressableObsTiles,
  zoomEnabled = true,
  zoomTapEnabled = true
}: Props ) => {
  const { isDebug } = useDebugMode( );
  const { screenWidth, screenHeight } = useDeviceOrientation( );
  const [currentZoom, setCurrentZoom] = useState( 0 );
  const navigation = useNavigation( );
  const { hasPermissions, renderPermissionsGate, requestPermissions } = useLocationPermission( );
  const [userLocation, setUserLocation] = useState<{
    accuracy: number;
    latitude: number;
    longitude: number;
  } | undefined | null>( null );
  const mapViewRef = useRef<MapView>();
  const [currentMapType, setCurrentMapType] = useState( mapType || "standard" );

  const initialLatitude = obsLatitude;
  const initialLongitude = obsLongitude;

  let defaultInitialRegion: Region = {
    latitude: initialLatitude || 25, // Default to something US centric
    longitude: initialLongitude || -85, // Default to something US centric
    latitudeDelta: initialLatitude
      ? 0.2
      : 100,
    longitudeDelta: initialLatitude
      ? 0.2
      : 100
  };

  console.log( userLocation?.latitude, "userLocation" );

  useEffect( ( ) => {
    // in LocationPicker we're setting initialRegion to eliminate jitteriness
    // when scrolling, which means we also must use this method to reset the map
    // when searching for a location by typing a place name and selecting place coordinates
    if ( !regionToAnimate ) { return; }
    mapViewRef.current?.animateToRegion( {
      latitude: regionToAnimate.latitude,
      longitude: regionToAnimate.longitude
    } );
  }, [
    regionToAnimate
  ] );

  const params = useMemo( ( ) => {
    const newTileParams = { ...tileMapParams };
    delete newTileParams.order;
    delete newTileParams.order_by;
    delete newTileParams.per_page;
    return newTileParams;
  }, [tileMapParams] );

  const obscurationCell = obscurationCellForLatLng( obsLatitude, obsLongitude );
  if ( obscured ) {
    defaultInitialRegion = {
      latitude: obscurationCell.minLat + ( OBSCURATION_CELL_SIZE / 2 ),
      longitude: obscurationCell.minLng + ( OBSCURATION_CELL_SIZE / 2 ),
      latitudeDelta: 0.3,
      longitudeDelta: 0.3
    };
  }

  const onMapPressForObsLyr = useCallback( async ( latLng: LatLng ) => {
    const uuid = await fetchObservationUUID( currentZoom, latLng, params );
    if ( uuid ) {
      navigation.push( "ObsDetails", { uuid } );
    }
  }, [params, currentZoom, navigation] );

  const onPermissionGranted = ( ) => console.log( "permission granted" );

  const renderCurrentLocationPermissionsGate = () => renderPermissionsGate( {
    onPermissionGranted
  } );

  const setRegion = ( ) => {
    if ( initialRegion ) {
      return null;
    }
    if ( region?.latitude ) {
      return region;
    }
    return defaultInitialRegion;
  };

  const handleCurrentLocationPress = ( ) => {
    if ( onCurrentLocationPress ) { onCurrentLocationPress( ); }
    if ( userLocation && mapViewRef?.current ) {
      // Zoom level based on location accuracy.
      let latitudeDelta = metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude );
      // Intentional use of latitudeDelta here because longitudeDelta is harder to calculate
      let longitudeDelta = metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude );
      // If this map redefines the level we want to zoom into when the user
      // wants to see their current location, choose which ever is more
      // zoomed out, the configured zoom level or the zoom level based on the
      // coordinate accuracy
      const [configuredLatitudeDelta, configuredLongitudeDelta] = zoomToDeltas(
        CURRENT_LOCATION_ZOOM_LEVEL,
        screenWidth,
        screenHeight
      );
      latitudeDelta = Math.max( latitudeDelta, configuredLatitudeDelta );
      longitudeDelta = Math.max( longitudeDelta, configuredLongitudeDelta );

      mapViewRef.current?.animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta
      } );
    }
  };

  const mapContainerStyle = [
    mapHeight
      ? { height: mapHeight }
      : null
  ];

  const mapContainerClass = classnames(
    "flex-1 h-full",
    mapViewClassName
  );

  const cameraZoomRange = {
    minCenterCoordinateDistance: MIN_CENTER_COORDINATE_DISTANCE
  };

  const handleUserLocationChange = async locationChangeEvent => {
    const coordinate = locationChangeEvent?.nativeEvent?.coordinate;
    setUserLocation( coordinate );
  };

  const handleRegionChangeComplete = async newRegion => {
    if ( onRegionChangeComplete ) {
      const boundaries = await mapViewRef?.current?.getMapBoundaries( );
      onRegionChangeComplete( newRegion, boundaries );
    }
    setCurrentZoom( calculateZoom( screenWidth, newRegion.longitudeDelta ) );
  };

  const handleMapPress = e => {
    if ( withPressableObsTiles ) onMapPressForObsLyr( e.nativeEvent.coordinate );
    else if ( openMapScreen ) {
      openMapScreen( );
    }
  };

  const mapRegion = setRegion( );
  console.log( mapRegion?.latitude, "latitude", mapRegion?.longitude );

  const renderDebugZoomLevel = ( ) => {
    if ( isDebug ) {
      return (
        <View
          className={classnames(
            "absolute",
            "left-5",
            "bottom-[140px]",
            "bg-deeppink",
            "p-1",
            "z-10"
          )}
        >
          <Body1 className="text-white">
            {`Zoom: ${currentZoom}`}
          </Body1>
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={mapContainerStyle}
      testID="MapView"
      className={mapContainerClass}
    >
      {renderDebugZoomLevel( )}
      <MapView
        cameraZoomRange={cameraZoomRange}
        className={className}
        initialRegion={initialRegion}
        loadingEnabled
        mapType={currentMapType}
        minZoomLevel={MIN_ZOOM_LEVEL}
        onMapReady={onMapReady}
        onPanDrag={onPanDrag}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        onUserLocationChange={handleUserLocationChange}
        pitchEnabled={false}
        ref={mapViewRef}
        region={mapRegion}
        rotateEnabled={false}
        scrollEnabled={scrollEnabled}
        showsCompass={showsCompass}
        showsMyLocationButton={false}
        showsUserLocation={hasPermissions}
        style={style}
        testID={testID || "Map.MapView"}
        zoomEnabled={zoomEnabled}
        zoomTapEnabled={zoomTapEnabled}
      >
        <ObsUrlTile
          params={params}
          showPointTiles={currentZoom > 13}
          withObsTiles={withObsTiles}
          withPressableObsTiles={withPressableObsTiles}
        />
        <LocationIndicator
          obsLatitude={obsLatitude}
          obsLongitude={obsLongitude}
          positionalAccuracy={positionalAccuracy}
          showLocationIndicator={showLocationIndicator && !obscured}
        />
        <ObscuredLocationIndicator
          obscurationCell={obscurationCell}
          showLocationIndicator={showLocationIndicator && obscured}
        />
      </MapView>
      <CurrentLocationButton
        showCurrentLocationButton={showCurrentLocationButton}
        currentLocationButtonClassName={currentLocationButtonClassName}
        hasPermissions={hasPermissions}
        renderPermissionsGate={renderCurrentLocationPermissionsGate}
        requestPermissions={requestPermissions}
        onPermissionGranted={onPermissionGranted}
        handlePress={handleCurrentLocationPress}
      />
      <SwitchMapTypeButton
        currentMapType={currentMapType}
        mapType={mapType}
        setCurrentMapType={setCurrentMapType}
        showSwitchMapTypeButton={showSwitchMapTypeButton}
        switchMapTypeButtonClassName={switchMapTypeButtonClassName}
      />
      {children}
    </View>
  );
};

export default Map;

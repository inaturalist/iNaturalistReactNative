import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
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
import { useDeviceOrientation } from "sharedHooks";
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

const NEARBY_DIM_M = 50_000;

interface Props {
  children?: React.ReactNode;
  className?: string;
  currentLocationButtonClassName?: string;
  currentLocationZoomLevel?: number;
  mapHeight?: DimensionValue; // allows for height to be defined as px or percentage
  mapType?: MapType;
  mapViewClassName?: string;
  minZoomLevel?: number;
  obscured?: boolean;
  obsLatitude: number;
  obsLongitude: number;
  onCurrentLocationPress?: () => void;
  onMapReady?: () => void;
  onPanDrag?: () => void;
  onRegionChangeComplete?: ( _r: Region, _b: BoundingBox | undefined ) => void;
  onZoomChange?: ( _z: number ) => void;
  onZoomToNearby?: Function;
  openMapScreen?: () => void;
  positionalAccuracy?: number;
  region?: Region;
  scrollEnabled?: boolean;
  showCurrentLocationButton?: boolean;
  showLocationIndicator?: boolean;
  showsCompass?: boolean;
  showSwitchMapTypeButton?: boolean;
  startAtNearby?: boolean;
  startAtUserLocation?: boolean;
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
  currentLocationZoomLevel, // target zoom level when user hits current location btn
  mapHeight,
  mapType,
  mapViewClassName,
  minZoomLevel = 0, // default in react-native-maps
  obscured,
  obsLatitude,
  obsLongitude,
  onCurrentLocationPress,
  onMapReady = ( ) => undefined,
  onPanDrag = ( ) => undefined,
  onRegionChangeComplete,
  onZoomChange,
  onZoomToNearby,
  openMapScreen,
  positionalAccuracy,
  region,
  scrollEnabled = true,
  showCurrentLocationButton,
  showLocationIndicator,
  showsCompass,
  showSwitchMapTypeButton,
  startAtNearby = false,
  startAtUserLocation = false,
  style,
  switchMapTypeButtonClassName,
  testID,
  tileMapParams,
  withObsTiles,
  withPressableObsTiles,
  zoomEnabled = true,
  zoomTapEnabled = true
}: Props ) => {
  const { screenWidth, screenHeight } = useDeviceOrientation( );
  const [currentZoom, setCurrentZoom] = useState(
    region
      ? calculateZoom( screenWidth, region.longitudeDelta )
      : 5
  );
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

  let initialRegion: Region = {
    latitude: initialLatitude || 25, // Default to something US centric
    longitude: initialLongitude || -85, // Default to something US centric
    latitudeDelta: initialLatitude
      ? 0.2
      : 100,
    longitudeDelta: initialLatitude
      ? 0.2
      : 100
  };

  // Kind of obtuse, but the more obvious approach of making a function that
  // pans the map results in a function that gets recreated every time the
  // userLocation changes
  const [zoomToUserLocationRequested, setZoomToUserLocationRequested] = useState(
    startAtUserLocation
  );

  const [zoomToNearbyRequested, setZoomToNearbyRequested] = useState(
    startAtNearby
  );

  useEffect( ( ) => {
    if ( startAtNearby && zoomToNearbyRequested === null ) {
      setZoomToNearbyRequested( true );
    }
  }, [startAtNearby, zoomToNearbyRequested] );

  useEffect( ( ) => {
    if ( userLocation && zoomToUserLocationRequested && mapViewRef?.current ) {
      // Zoom level based on location accuracy.
      let latitudeDelta = metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude );
      // Intentional use of latitudeDelta here because longitudeDelta is harder to calculate
      let longitudeDelta = metersToLatitudeDelta( userLocation.accuracy, userLocation.latitude );
      // If this map redefines the level we want to zoom into when the user
      // wants to see their current location, choose which ever is more
      // zoomed out, the configured zoom level or the zoom level based on the
      // coordinate accuracy
      if ( currentLocationZoomLevel ) {
        const [configuredLatitudeDelta, configuredLongitudeDelta] = zoomToDeltas(
          currentLocationZoomLevel,
          screenWidth,
          screenHeight
        );
        latitudeDelta = Math.max( latitudeDelta, configuredLatitudeDelta );
        longitudeDelta = Math.max( longitudeDelta, configuredLongitudeDelta );
      }
      mapViewRef.current?.animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta
      } );
      setZoomToUserLocationRequested( false );
    }
  }, [
    currentLocationZoomLevel,
    screenHeight,
    screenWidth,
    userLocation,
    zoomToUserLocationRequested
  ] );

  // Zoom to nearby region if requested. Note that if you want to do something
  // after the map zooms, you need to use onRegionChangeComplete
  useEffect( ( ) => {
    if ( userLocation && zoomToNearbyRequested && mapViewRef?.current ) {
      mapViewRef.current?.animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, userLocation.latitude ),
        longitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, userLocation.latitude )
      } );
      setZoomToNearbyRequested( false );
    }
  }, [
    onZoomToNearby,
    userLocation,
    zoomToNearbyRequested
  ] );

  // TODO: Johannes: I don't know if this is necessary anymore
  const onPermissionGranted = useCallback( ( ) => {
    console.log( "startAtNearby", startAtNearby );
    if ( startAtNearby ) {
      setZoomToNearbyRequested( true );
    }
  }, [
    setZoomToNearbyRequested,
    startAtNearby
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
    initialRegion = {
      latitude: obscurationCell.minLat + ( OBSCURATION_CELL_SIZE / 2 ),
      longitude: obscurationCell.minLng + ( OBSCURATION_CELL_SIZE / 2 ),
      latitudeDelta: 0.3,
      longitudeDelta: 0.3
    };
  }

  const onMapPressForObsLyr = useCallback( async ( latLng: LatLng ) => {
    const uuid = await fetchObservationUUID( currentZoom, latLng, params );
    if ( uuid ) {
      navigation.navigate( "ObsDetails", { uuid } );
    }
  }, [params, currentZoom, navigation] );

  useEffect( ( ) => {
    if ( typeof ( onZoomChange ) === "function" ) {
      onZoomChange( currentZoom );
    }
  }, [currentZoom, onZoomChange] );

  const renderCurrentLocationPermissionsGate = () => renderPermissionsGate( {
    onPermissionGranted
  } );

  return (
    <View
      style={[
        mapHeight
          ? { height: mapHeight }
          : null
      ]}
      testID="MapView"
      className={classnames(
        "flex-1 h-full",
        mapViewClassName
      )}
    >
      <MapView
        ref={mapViewRef}
        testID={testID || "Map.MapView"}
        className={className}
        region={( region?.latitude )
          ? region
          : initialRegion}
        onUserLocationChange={async locationChangeEvent => {
          const coordinate = locationChangeEvent?.nativeEvent?.coordinate;
          setUserLocation( coordinate );
        }}
        showsUserLocation={hasPermissions}
        showsMyLocationButton={false}
        loadingEnabled
        onRegionChangeComplete={async newRegion => {
          if ( onRegionChangeComplete ) {
            const boundaries = await mapViewRef?.current?.getMapBoundaries( );
            onRegionChangeComplete( newRegion, boundaries );
          }
          setCurrentZoom( calculateZoom( screenWidth, newRegion.longitudeDelta ) );
        }}
        onPress={e => {
          if ( withPressableObsTiles ) onMapPressForObsLyr( e.nativeEvent.coordinate );
          else if ( openMapScreen ) {
            openMapScreen( );
          }
        }}
        showsCompass={showsCompass}
        mapType={currentMapType}
        onMapReady={onMapReady}
        style={style}
        onPanDrag={onPanDrag}
        minZoomLevel={minZoomLevel}
        rotateEnabled={false}
        pitchEnabled={false}
        scrollEnabled={scrollEnabled}
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
        handlePress={( ) => {
          if ( onCurrentLocationPress ) { onCurrentLocationPress( ); }
          setZoomToUserLocationRequested( true );
        }}
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

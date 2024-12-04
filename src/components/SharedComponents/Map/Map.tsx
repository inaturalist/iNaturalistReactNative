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
import { DimensionValue, Platform, ViewStyle } from "react-native";
import MapView, {
  BoundingBox, LatLng, MapType, Region
} from "react-native-maps";
import Observation from "realmModels/Observation";
import fetchUserLocation from "sharedHelpers/fetchUserLocation.ts";
import { useDebugMode, useDeviceOrientation } from "sharedHooks";
import useLocationPermission from "sharedHooks/useLocationPermission.tsx";
import colors from "styles/tailwindColors";

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
const CURRENT_LOCATION_ZOOM_LEVEL = 15; // target zoom level when user hits current location btn
const MIN_ZOOM_LEVEL = 0; // default in react-native-maps, for Google Maps only
const MIN_CENTER_COORDINATE_DISTANCE = 5;

const getDefaultRegion = ( initialLatitude, initialLongitude ) => ( {
  latitude: initialLatitude || 25, // Default to something US centric
  longitude: initialLongitude || -85, // Default to something US centric
  latitudeDelta: initialLatitude
    ? 0.2
    : 100,
  longitudeDelta: initialLatitude
    ? 0.2
    : 100
} );

interface Props {
  children?: React.ReactNode;
  className?: string;
  currentLocationButtonClassName?: string;
  initialRegion?: boolean;
  mapHeight?: DimensionValue; // allows for height to be defined as px or percentage
  mapType?: MapType;
  mapViewClassName?: string;
  observation?: Observation;
  onCurrentLocationPress?: () => void;
  onMapReady?: () => void;
  onPanDrag?: () => void;
  onRegionChangeComplete?: ( _r: Region, _b: BoundingBox | undefined ) => void;
  openMapScreen?: () => void;
  region?: Region;
  regionToAnimate?: Object;
  scrollEnabled?: boolean;
  showCurrentLocationButton?: boolean;
  showsCompass?: boolean;
  showSwitchMapTypeButton?: boolean;
  showsUserLocation?: boolean;
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
  observation,
  onCurrentLocationPress,
  onMapReady = ( ) => undefined,
  onPanDrag = ( ) => undefined,
  onRegionChangeComplete,
  openMapScreen,
  region,
  regionToAnimate,
  scrollEnabled = true,
  showCurrentLocationButton,
  showsCompass,
  showSwitchMapTypeButton,
  showsUserLocation: showsUserLocationProp,
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
  const [showsUserLocation, setShowsUserLocation] = useState( showsUserLocationProp );

  let defaultInitialRegion = null;

  if ( observation ) {
    if ( observation.obscured && !observation.privateLatitude ) {
      const obscurationCell = obscurationCellForLatLng(
        observation.latitude,
        observation.longitude
      );
      defaultInitialRegion = {
        latitude: obscurationCell.minLat + ( OBSCURATION_CELL_SIZE / 2 ),
        longitude: obscurationCell.minLng + ( OBSCURATION_CELL_SIZE / 2 ),
        latitudeDelta: 0.3,
        longitudeDelta: 0.3
      };
    } else {
      defaultInitialRegion = getDefaultRegion(
        observation.privateLatitude || observation.latitude,
        observation.privateLongitude || observation.longitude
      );
    }
  }

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

  const onMapPressForObsLyr = useCallback( async ( latLng: LatLng ) => {
    const uuid = await fetchObservationUUID( currentZoom, latLng, params );
    if ( uuid ) {
      navigation.push( "ObsDetails", { uuid } );
    }
  }, [params, currentZoom, navigation] );

  const onPermissionGranted = async ( ) => {
    const currentLocation = await fetchUserLocation( );
    if ( currentLocation && mapViewRef?.current ) {
      mapViewRef.current?.animateToRegion( {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, currentLocation.latitude ),
        longitudeDelta: metersToLatitudeDelta( NEARBY_DIM_M, currentLocation.latitude )
      } );
    }
  };

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

  const handleCurrentLocationPress = useCallback( ( ) => {
    // If we aren't showing the user's location, we won't have a location to
    // zoom to yet, so first we need to turn that on, and we'll re-call this
    // function in an effect when we have a location
    if ( !showsUserLocation ) {
      setShowsUserLocation( true );
      requestPermissions( );
      return;
    }
    // If we're supposed to be showing user location but we don't have it, ask
    // for permission again, which should result in fetching the location if
    // we can
    if ( !userLocation ) {
      requestPermissions( );
      return;
    }
    if ( onCurrentLocationPress ) {
      onCurrentLocationPress( );
    }
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
  }, [
    onCurrentLocationPress,
    requestPermissions,
    screenHeight,
    screenWidth,
    showsUserLocation,
    userLocation
  ] );

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

  const handleRegionChangeComplete = async ( newRegion, gesture ) => {
    // We are only interested in region changes due to user interaction.
    // In Android, onRegionChangeComplete also fires for other map region
    // changes and gesture.isGesture is available to test for user interaction.
    if ( Platform.OS === "android" && !gesture.isGesture ) {
      return;
    }
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

  const currentUserCanViewCoords = observation && !!(
    !observation.obscured || observation.privateLatitude
  );

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
        loadingIndicatorColor={colors.inatGreen}
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
        showsUserLocation={showsUserLocation && hasPermissions}
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
        { observation && ( currentUserCanViewCoords
          ? (
            <LocationIndicator
              latitude={observation.privateLatitude || observation.latitude}
              longitude={observation.privateLongitude || observation.longitude}
              positionalAccuracy={observation.positionalAccuracy}
            />
          )
          : (
            <ObscuredLocationIndicator
              latitude={observation.privateLatitude || observation.latitude}
              longitude={observation.privateLongitude || observation.longitude}
            />
          )
        ) }
      </MapView>
      <CurrentLocationButton
        showCurrentLocationButton={showCurrentLocationButton}
        currentLocationButtonClassName={currentLocationButtonClassName}
        hasPermissions={hasPermissions}
        renderPermissionsGate={renderCurrentLocationPermissionsGate}
        requestPermissions={requestPermissions}
        onPermissionGranted={onPermissionGranted}
        onPress={handleCurrentLocationPress}
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

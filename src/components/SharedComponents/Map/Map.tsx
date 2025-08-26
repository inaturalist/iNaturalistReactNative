import { useNavigation } from "@react-navigation/native";
import classnames from "classnames";
import { Body1 } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { DimensionValue, Platform, ViewStyle } from "react-native";
import MapView, {
  BoundingBox, LatLng, MapType, Region, UrlTile
} from "react-native-maps";
import Observation from "realmModels/Observation";
import fetchCoarseUserLocation from "sharedHelpers/fetchCoarseUserLocation.ts";
import mapTracker from "sharedHelpers/mapPerformanceTracker.ts";
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
  TILE_URL,
  zoomToDeltas
} from "./helpers/mapHelpers";
import LocationIndicator from "./LocationIndicator";
import ObscuredLocationIndicator from "./ObscuredLocationIndicator";
import SwitchMapTypeButton from "./SwitchMapTypeButton";

const NEARBY_DIM_M = 50_000;
const CURRENT_LOCATION_ZOOM_LEVEL = 20; // target zoom level when user hits current location btn
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
  initialRegion?: Region;
  isLoading?: boolean;
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
  regionToAnimate?: Region;
  scrollEnabled?: boolean;
  showCurrentLocationButton?: boolean;
  showsCompass?: boolean;
  showSwitchMapTypeButton?: boolean;
  showsUserLocation?: boolean;
  style?: ViewStyle;
  switchMapTypeButtonClassName?: string;
  testID?: string;
  tileMapParams?: object | null;
  withObsTiles?: boolean;
  withPressableObsTiles?: boolean;
  zoomEnabled?: boolean;
  zoomTapEnabled?: boolean;
}

// TODO: fallback to another map library
// for people who don't use GMaps (i.e. users in China)
const Map = forwardRef( ( {
  children,
  className = "flex-1",
  currentLocationButtonClassName,
  initialRegion,
  isLoading = true,
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
}: Props, ref ) => {
  const tilesMarkedVisible = useRef( false );
  const [performanceMetrics, setPerformanceMetrics] = useState( {
    mapReadyTime: 0,
    tilesVisibleTime: 0
  } );
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
  const mapViewRef = useRef<MapView>( undefined );
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

  // In Android, we maintain a state for defaultInitialRegion and initialRegion
  // that is updated on gestures like pan and zoom. This state is always null in iOS.
  const [androidLocalRegion, setAndroidLocalRegion] = useState<Region|null>(
    Platform.OS === "android"
      ? initialRegion || defaultInitialRegion
      : null
  );

  // In Android, onMapReady does not fire when we pass parameter region instead
  // of parameter initialRegion. This state allows us to fire onMapReady and
  // fire it only once. This state is always false in iOS.
  const [onMapReadyHasFiredAndroid, setOnMapReadyHasFiredAndroid] = useState( false );

  // In Android, animateToRegion animates to the given region but the map then
  // immediately returns to the previous region. We fake a gesture to the
  // desired region to make it stick. This state stores the region for this
  // gesture. This state is always null in iOS.
  const [androidAnimateRegion, setAndroidAnimateRegion] = useState<Region|null>( null );

  const animateToRegion = ( newRegion: Region ) => {
    mapViewRef.current?.animateToRegion( newRegion );
    if ( Platform.OS === "android" ) {
      setAndroidAnimateRegion( newRegion );
    }
  };

  useEffect( ( ) => {
    // in LocationPicker we're setting initialRegion to eliminate jitteriness
    // when scrolling, which means we also must use this method to reset the map
    // when searching for a location by typing a place name and selecting place coordinates
    if ( !regionToAnimate || !mapViewRef.current ) { return; }
    animateToRegion( {
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
    const currentLocation = await fetchCoarseUserLocation( );
    if ( currentLocation && mapViewRef?.current ) {
      animateToRegion( {
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

  // In Android, we always return a state, either region or androidLocalRegion.
  const setRegion = ( ) => {
    if ( Platform.OS !== "android" && initialRegion ) {
      return null;
    }
    if ( region?.latitude ) {
      return region;
    }
    return Platform.OS === "android"
      ? androidLocalRegion
      : defaultInitialRegion;
  };

  const handleCurrentLocationPress = useCallback( ( ) => {
    if ( !hasPermissions ) {
      requestPermissions( );
    }
    // If we aren't showing the user's location, we won't have a location to
    // zoom to yet, so first we need to turn that on, and we'll re-call this
    // function in an effect when we have a location
    if ( !showsUserLocation ) {
      setShowsUserLocation( true );
      return;
    }
    // If we're supposed to be showing user location but we don't have it, ask
    // for permission again, which should result in fetching the location if
    // we can
    // skipping onCurrentLocationPress here because the handlers
    // are handling the permissions request outside of this component (example: Explore MapView)
    if ( !userLocation && onCurrentLocationPress === undefined ) {
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

      animateToRegion( {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta,
        longitudeDelta
      } );
    }
  }, [
    onCurrentLocationPress,
    hasPermissions,
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

  const queryString = Object.keys( params ).map( key => `${key}=${params[key]}` ).join( "&" );

  const showPointTiles = currentZoom > 13;

  // We want green points and (default) orange grid
  const tileUrlTemplate = showPointTiles
    ? `${TILE_URL}/points/{z}/{x}/{y}.png?${queryString}&color=%2374ac00`
    : `${TILE_URL}/grid/{z}/{x}/{y}.png?${queryString}`;

  // In Android, MapView does not reliably process tileUrlTemplate changes.
  // Thus, we do not change tileUrlTemplate on Android anymore but first shut
  // down the currently active obs tiles and then restart them with the new
  // obs tile url. This is done by detecting changes to tileUrlTemplate and
  // rendering <MapView> once without <UrlTile>.

  const [previousTileUrl, setPreviousTileUrl] = useState( tileUrlTemplate );

  const handleRegionChangeComplete = useCallback( async ( newRegion, gesture ) => {
    // We are only interested in region changes due to user interaction.
    // In Android, onRegionChangeComplete also fires for other map region
    // changes and gesture.isGesture is available to test for user interaction.
    let shouldSkipRegionUpdate = false;
    if ( Platform.OS === "android" && !gesture.isGesture ) {
      if ( previousTileUrl !== tileUrlTemplate ) {
        setPreviousTileUrl( tileUrlTemplate );
      }
      if ( !onMapReadyHasFiredAndroid && onMapReady ) {
        setOnMapReadyHasFiredAndroid( true );
        onMapReady();
      }
      shouldSkipRegionUpdate = true;
    }
    if ( !shouldSkipRegionUpdate ) {
      if ( onRegionChangeComplete ) {
        const boundaries = await mapViewRef?.current?.getMapBoundaries( );
        onRegionChangeComplete( newRegion, boundaries );
      }
      if ( androidLocalRegion ) {
        setAndroidLocalRegion( newRegion );
      }
    }
    setCurrentZoom( calculateZoom( screenWidth, newRegion.longitudeDelta ) );
  }, [
    previousTileUrl,
    tileUrlTemplate,
    onMapReadyHasFiredAndroid,
    onMapReady,
    onRegionChangeComplete,
    androidLocalRegion,
    screenWidth
  ] );

  // In Android, animateToRegion animates to the given region but the map then
  // immediately returns to the previous region. We fake a gesture to the
  // desired region to make it stick.
  useEffect(
    ( ) => {
      if ( Platform.OS === "android" && androidAnimateRegion ) {
        const curRegion = androidLocalRegion || region;
        const newRegion = {
          ...curRegion, // provides defaults for latitudeDelta and longitudeDelta
          ...androidAnimateRegion
        };
        setTimeout(
          ( ) => handleRegionChangeComplete( newRegion, { isGesture: true } )
        );
        setAndroidAnimateRegion( null );
      }
    },
    [
      androidAnimateRegion,
      androidLocalRegion,
      region,
      handleRegionChangeComplete
    ]
  );

  const handleMapPress = e => {
    if ( withPressableObsTiles ) onMapPressForObsLyr( e.nativeEvent.coordinate );
    else if ( openMapScreen ) {
      openMapScreen( );
    }
  };

  const shouldOverlayObsTiles = ( withPressableObsTiles || withObsTiles )
    && (
      Platform.OS !== "android"
      || previousTileUrl === tileUrlTemplate
    );

  // In Android, when we render a single frame of <MapView> without <UrlTile>
  // we use a tiny region increase of 0.001% to get onRegionChangeComplete to
  // fire and update the obs tile url. This change is too small to be visible.
  const fuzzRegion = curRegion => (
    {
      ...curRegion,
      latitudeDelta: 1.00001 * curRegion.latitudeDelta,
      longitudeDelta: 1.00001 * curRegion.longitudeDelta
    } );
  const shouldFuzzRegion = curRegion => (
    Platform.OS === "android"
    && curRegion
    && previousTileUrl !== tileUrlTemplate
  );
  const unfuzzedMapRegion = setRegion( );
  const mapRegion = shouldFuzzRegion( unfuzzedMapRegion )
    ? fuzzRegion( unfuzzedMapRegion )
    : unfuzzedMapRegion;

  // In Android, we maintain initialRegion as state localRegion and
  // pass undefined to parameter initialRegion.
  const mapInitialRegion = Platform.OS === "android"
    ? undefined
    : initialRegion;

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

  const latitude = observation?.privateLatitude || observation?.latitude;
  const longitude = observation?.privateLongitude || observation?.longitude;
  const hasCoordinates = latitude && longitude;

  const setRefs = instance => {
    // Update our internal ref
    mapViewRef.current = instance;

    // Forward to the parent ref
    if ( typeof ref === "function" ) {
      ref( instance );
    } else if ( ref ) {
      ref.current = instance;
    }
  };

  const handleMapReady = ( ) => {
    mapTracker.markMapReady( );

    if ( onMapReady ) {
      onMapReady( );
    }
  };

  useEffect( ( ) => {
    // debug mode only: display performance metrics
    // eslint-disable-next-line no-undef
    if ( isDebug ) {
      mapTracker.reset( );

      const updateInterval = setInterval( ( ) => {
        const metrics = mapTracker.getSummary( );
        setPerformanceMetrics( metrics );
      }, 500 );

      return ( ) => {
        clearInterval( updateInterval );
      };
    }
    return () => undefined;
  }, [isDebug] );

  useEffect( ( ) => {
    // Detect when tiles are likely to be visible based on key conditions,
    // since we can't get this info directly from UrlTile
    if ( isDebug
        && currentZoom > 0
        && shouldOverlayObsTiles
        && !isLoading
        && !tilesMarkedVisible.current ) {
      // Add a small delay to ensure tiles have had time to render --
      // I wouldn't call this super accurate but it was helpful enough for a ballpark
      // and to get an idea of the average time it takes to load tiles
      setTimeout( ( ) => {
        mapTracker.markTilesVisible( );
        tilesMarkedVisible.current = true;
      }, 300 );
    }
  }, [currentZoom, shouldOverlayObsTiles, isLoading, isDebug] );

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
        initialRegion={mapInitialRegion}
        loadingEnabled
        loadingIndicatorColor={colors.inatGreen}
        mapType={currentMapType}
        minZoomLevel={MIN_ZOOM_LEVEL}
        onMapReady={handleMapReady}
        onPanDrag={onPanDrag}
        onPress={handleMapPress}
        onRegionChangeComplete={handleRegionChangeComplete}
        onUserLocationChange={handleUserLocationChange}
        pitchEnabled={false}
        ref={setRefs}
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
        { shouldOverlayObsTiles
        && (
          <UrlTile
            testID="Map.UrlTile"
            tileSize={512}
            urlTemplate={tileUrlTemplate}
            opacity={
              showPointTiles
                ? 1
                : 0.7
            }
          />
        )}
        { observation && hasCoordinates && ( currentUserCanViewCoords
          ? (
            <LocationIndicator
              latitude={latitude}
              longitude={longitude}
              positionalAccuracy={observation.positionalAccuracy}
            />
          )
          : (
            <ObscuredLocationIndicator
              latitude={latitude}
              longitude={longitude}
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
      {isDebug && (
        <View
          className={classnames(
            "absolute",
            "left-5",
            "bottom-[280px]",
            "bg-deeppink",
            "p-1",
            "z-10"
          )}
        >
          <Body1 className="text-white">
            {`Map Ready: ${performanceMetrics.mapReadyTime}ms`}
          </Body1>
          <Body1 className="text-white">
            {`Tiles Visible: ${performanceMetrics.tilesVisibleTime > 0
              ? `${performanceMetrics.tilesVisibleTime}ms`
              : "Not yet visible"}`}
          </Body1>
        </View>
      )}
    </View>
  );
} );

export default Map;

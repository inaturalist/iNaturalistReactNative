import {
  ActivityIndicator,
  Button,
  INatIcon,
  INatIconButton,
  Map,
} from "components/SharedComponents";
import { getMapRegion } from "components/SharedComponents/Map/helpers/mapHelpers";
import { View } from "components/styledComponents";
import type { MapBoundaries } from "providers/ExploreContext";
import {
  EXPLORE_ACTION, PLACE_MODE, useExplore,
} from "providers/ExploreContext";
import React, {
  useEffect, useMemo, useRef, useState,
} from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Animated, StyleSheet } from "react-native";
import type { Region } from "react-native-maps";
import type RNMapView from "react-native-maps";
import NativeMapView from "react-native-maps";
import { Circle, Svg } from "react-native-svg";
import { useTranslation } from "sharedHooks";
import type { RenderLocationPermissionsGateFunction } from "sharedHooks/useLocationPermission";
import { getShadow } from "styles/global";
import colors from "styles/tailwindColors";

const NEARBY_DELTA = 0.02;

const WORLDWIDE_DELTA = 180;
const WORLDWIDE_LAT_LNG = 0.0;

const worldwideRegion = {
  latitude: WORLDWIDE_LAT_LNG,
  longitude: WORLDWIDE_LAT_LNG,
  latitudeDelta: WORLDWIDE_DELTA,
  longitudeDelta: WORLDWIDE_DELTA,
};

const DROP_SHADOW = getShadow( {
  offsetHeight: 4,
  elevation: 6,
} );

const activityIndicatorSize = 50;
const centeredLoadingWheel: StyleProp<ViewStyle> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [
    { translateX: -( activityIndicatorSize / 2 ) },
    { translateY: -( activityIndicatorSize / 2 ) },
  ],
  backgroundColor: "rgba(0,0,0,0)",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 20,
};

// Arc progress ring constants
const ARC_SIZE = 52;
const ARC_STROKE = 3;
const ARC_RADIUS = ( ARC_SIZE - ARC_STROKE ) / 2;
const ARC_CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;

// Animated SVG circle so strokeDashoffset can be driven by Animated.Value
const AnimatedCircle = Animated.createAnimatedComponent( Circle );

const styles = StyleSheet.create( {
  centeredContent: { alignItems: "center", justifyContent: "center" },
  positionAbsolute: { position: "absolute" },
  hiddenMapView: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  saveButton: { bottom: 80, left: 140 },
  viewSavedMapsButton: { bottom: 20, right: 83 },
  compositeIcon: { position: "relative", alignItems: "center", justifyContent: "center" },
  compositeIconBase: { marginTop: -4 },
  compositeIconBadge: { position: "absolute", bottom: -7, right: -5 },
} );

interface Props {
  // Bounding box of the observations retrieved for the query params
  observationBounds?: MapBoundaries;
  queryParams: {
    taxon_id?: number;
    return_bounds?: boolean;
    order?: string;
    orderBy?: string;
    [key: string]: unknown;
  };
  isLoading: boolean;
  hasLocationPermissions?: boolean;
  renderLocationPermissionsGate: RenderLocationPermissionsGateFunction;
  requestLocationPermissions: ( ) => void;
  isSavingOffline?: boolean;
  saveProgress?: number;
  onSaveOffline?: (
    appleMapRef: React.RefObject<RNMapView>,
    appleMapSatelliteRef: React.RefObject<RNMapView>,
    region: Region,
  ) => void;
  onViewSavedMaps?: ( ) => void;
}

const MapView = ( {
  observationBounds,
  queryParams,
  isLoading,
  hasLocationPermissions,
  renderLocationPermissionsGate,
  requestLocationPermissions,
  isSavingOffline = false,
  saveProgress = 0,
  onSaveOffline,
  onViewSavedMaps,
}: Props ) => {
  const { t } = useTranslation( );
  const { state: exploreState, dispatch, defaultExploreLocation } = useExplore( );
  const [showRedoSearchButton, setShowRedoSearchButton] = useState( false );
  const [regionToAnimate, setRegionToAnimate] = useState<Region | null>( null );
  const isFirstRender = useRef( true );
  const currentRegion = useRef<Region>( worldwideRegion );

  const mapRef = useRef<RNMapView | null>( null );
  // Hidden Apple Maps views — MKMapSnapshotter takes snapshots offscreen, no Metal issue
  const appleMapRef = useRef<RNMapView | null>( null );
  const appleMapSatelliteRef = useRef<RNMapView | null>( null );

  // --- Progress ring animation ---
  // progressAnim: 0→1 drives strokeDashoffset (useNativeDriver:false required for SVG props)
  // arcFadeAnim: 1→0 drives opacity on completion (useNativeDriver:true)
  const progressAnim = useRef( new Animated.Value( 0 ) ).current;
  const arcFadeAnim = useRef( new Animated.Value( 1 ) ).current;
  const [completionPhase, setCompletionPhase] = useState<"idle" | "completed" | "fading">( "idle" );
  const wasSavingRef = useRef( false );
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>( null );

  // Smoothly animate the arc toward each new saveProgress value while saving
  useEffect( ( ) => {
    if ( !isSavingOffline ) { return; }
    Animated.timing( progressAnim, {
      toValue: saveProgress,
      duration: 400,
      useNativeDriver: false,
    } ).start( );
  }, [saveProgress, isSavingOffline, progressAnim] );

  // Detect saving→done transition; fill to 100%, show checkmark, then fade out
  useEffect( ( ) => {
    if ( wasSavingRef.current && !isSavingOffline ) {
      // First animate arc to full, then hold with checkmark, then fade
      Animated.timing( progressAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      } ).start( ( ) => {
        setCompletionPhase( "completed" );
        arcFadeAnim.setValue( 1 );
        completionTimerRef.current = setTimeout( ( ) => {
          setCompletionPhase( "fading" );
          Animated.timing( arcFadeAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          } ).start( ( ) => {
            setCompletionPhase( "idle" );
            arcFadeAnim.setValue( 1 );
            progressAnim.setValue( 0 );
          } );
        }, 500 );
      } );
    }
    wasSavingRef.current = isSavingOffline;
    return ( ) => {
      if ( completionTimerRef.current ) { clearTimeout( completionTimerRef.current ); }
    };
  }, [isSavingOffline, progressAnim, arcFadeAnim] );

  // strokeDashoffset: full circumference = empty, 0 = full circle
  const animatedDashOffset = progressAnim.interpolate( {
    inputRange: [0, 1],
    outputRange: [ARC_CIRCUMFERENCE, 0],
  } );

  const handleSaveOffline = ( ) => {
    onSaveOffline?.( appleMapRef, appleMapSatelliteRef, currentRegion.current );
  };

  const nearbyRegion = useMemo( () => ( {
    latitude: exploreState.lat,
    longitude: exploreState.lng,
    latitudeDelta: NEARBY_DELTA,
    longitudeDelta: NEARBY_DELTA,
  } ), [exploreState.lat, exploreState.lng] );

  const regionFromCoordinates = useMemo( ( ) => {
    if ( exploreState.place?.point_geojson?.coordinates ) {
      const [longitude, latitude] = exploreState.place.point_geojson.coordinates;
      return {
        latitude,
        longitude,
        latitudeDelta: NEARBY_DELTA,
        longitudeDelta: NEARBY_DELTA,
      };
    }
    return null;
  }, [exploreState.place] );

  useEffect( ( ) => {
    // Skip animation on first render
    if ( isFirstRender.current ) {
      isFirstRender.current = false;
      return;
    }

    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.MAP_AREA ) {
      return;
    }

    // since we're using initialRegion, we need to animate to the correct zoom level
    // when a user switches back to NEARBY or WORLDWIDE
    if ( exploreState.placeMode === PLACE_MODE.NEARBY ) {
      // Note: we do get observationBounds back from the API for nearby
      // but per user feedback, we want to show users a more zoomed in view
      // when they're looking at NEARBY view
      if ( nearbyRegion.latitude !== undefined && nearbyRegion.longitude !== undefined ) {
        setRegionToAnimate( {
          ...nearbyRegion,
          latitude: nearbyRegion.latitude,
          longitude: nearbyRegion.longitude,
        } );
      }
      return;
    }
    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.WORLDWIDE ) {
      setRegionToAnimate( worldwideRegion );
    }
    if ( mapRef.current
      && exploreState.placeMode === PLACE_MODE.PLACE ) {
      if ( observationBounds ) {
        const newRegion = getMapRegion( observationBounds );
        setRegionToAnimate( newRegion );
      }
    }
  }, [
    exploreState.placeMode,
    nearbyRegion,
    regionFromCoordinates,
    observationBounds,
    exploreState.place?.id,
  ] );

  const handleRedoSearch = async ( ) => {
    setShowRedoSearchButton( false );
    const currentBounds = await mapRef?.current?.getMapBoundaries( );
    if ( !currentBounds ) { return; }
    dispatch( { type: EXPLORE_ACTION.SET_PLACE_MODE_MAP_AREA } );
    dispatch( {
      type: EXPLORE_ACTION.SET_MAP_BOUNDARIES,
      mapBoundaries: {
        swlat: currentBounds.southWest.latitude,
        swlng: currentBounds.southWest.longitude,
        nelat: currentBounds.northEast.latitude,
        nelng: currentBounds.northEast.longitude,
      },
    } );
  };

  const tileMapParams = {
    ...queryParams,
  };
  // Tile queries never need these params
  delete tileMapParams.return_bounds;
  delete tileMapParams.order;
  delete tileMapParams.orderBy;

  const initialRegion: Region = useMemo( () => {
    if ( exploreState.placeMode === PLACE_MODE.NEARBY ) {
      if ( nearbyRegion.latitude !== undefined && nearbyRegion.longitude !== undefined ) {
        return {
          ...nearbyRegion,
          latitude: nearbyRegion.latitude,
          longitude: nearbyRegion.longitude,
        };
      }
    }

    if ( exploreState.placeMode === PLACE_MODE.PLACE ) {
      if ( regionFromCoordinates ) {
        return regionFromCoordinates;
      }
    }

    return worldwideRegion;
  }, [exploreState.placeMode, nearbyRegion, regionFromCoordinates] );

  const handlePanDrag = ( ) => setShowRedoSearchButton( true );

  const handleRegionChange = ( region: Region, _bounds?: unknown ) => {
    currentRegion.current = region;
  };

  const handleCurrentLocationPress = async ( ) => {
    if ( hasLocationPermissions ) {
      const exploreLocation = await defaultExploreLocation( );
      dispatch( {
        type: EXPLORE_ACTION.SET_EXPLORE_LOCATION,
        exploreLocation,
      } );
    } else {
      requestLocationPermissions( );
    }
  };

  const showArc = isSavingOffline || completionPhase !== "idle";
  const saveIcon = completionPhase !== "idle"
    ? "checkmark-circle"
    : "arrow-down-bold-circle";

  return (
    <View className="flex-1 overflow-hidden h-full">
      <View className="z-10">
        {showRedoSearchButton && (
          <View
            className="mx-auto"
            style={DROP_SHADOW}
          >
            <Button
              text={t( "REDO-SEARCH-IN-MAP-AREA" )}
              level="focus"
              className="top-[60px] absolute self-center"
              onPress={handleRedoSearch}
            />
          </View>
        )}
      </View>
      <Map
        ref={mapRef}
        currentLocationButtonClassName="left-5 bottom-20"
        onPanDrag={handlePanDrag}
        onRegionChangeComplete={handleRegionChange}
        initialRegion={initialRegion}
        regionToAnimate={regionToAnimate}
        showCurrentLocationButton
        showSwitchMapTypeButton
        showsCompass={false}
        switchMapTypeButtonClassName="left-20 bottom-20"
        showsUserLocation
        tileMapParams={tileMapParams}
        withPressableObsTiles={tileMapParams !== null}
        onCurrentLocationPress={handleCurrentLocationPress}
        isLoading={isLoading}
      />
      {/* Save offline button — bottom-left, right of re-center and map-layers buttons. */}
      {onSaveOffline && (
        <View
          style={[
            styles.positionAbsolute,
            styles.centeredContent,
            styles.saveButton,
          ]}
        >
          {showArc && (
            <Animated.View
              style={[styles.positionAbsolute, { opacity: arcFadeAnim }]}
            >
              <Svg width={ARC_SIZE} height={ARC_SIZE}>
                <AnimatedCircle
                  cx={ARC_SIZE / 2}
                  cy={ARC_SIZE / 2}
                  r={ARC_RADIUS}
                  stroke="#007AFF"
                  strokeWidth={ARC_STROKE}
                  fill="none"
                  strokeDasharray={ARC_CIRCUMFERENCE}
                  strokeDashoffset={animatedDashOffset}
                  strokeLinecap="round"
                  rotation={-90}
                  originX={ARC_SIZE / 2}
                  originY={ARC_SIZE / 2}
                />
              </Svg>
            </Animated.View>
          )}
          <INatIconButton
            icon={saveIcon}
            onPress={handleSaveOffline}
            accessibilityLabel="Save current map area for offline viewing"
            className="bg-white rounded-full"
            style={DROP_SHADOW}
            disabled={isSavingOffline || completionPhase !== "idle"}
          />
        </View>
      )}
      {/* View saved offline maps — left of the binoculars button */}
      {onViewSavedMaps && (
        <INatIconButton
          width={55}
          height={55}
          onPress={onViewSavedMaps}
          accessibilityLabel="View saved offline maps"
          className="absolute bg-white rounded-full border-[1px] border-lightGray z-10"
          style={[DROP_SHADOW, styles.viewSavedMapsButton]}
        >
          {/* Composite icon: map base + offline badge overlay */}
          <View style={styles.compositeIcon}>
            <View style={styles.compositeIconBase}>
              <INatIcon name="map" size={26} color={colors.inatGreen} />
            </View>
            <View style={styles.compositeIconBadge}>
              <INatIcon name="arrow-down-bold-circle" size={14} color={colors.inatGreen} />
            </View>
          </View>
        </INatIconButton>
      )}
      {isLoading && (
        <View style={centeredLoadingWheel} testID="activity-indicator">
          <ActivityIndicator size={activityIndicatorSize} />
        </View>
      )}
      {renderLocationPermissionsGate( { onPermissionGranted: handleCurrentLocationPress } )}
      {/* Hidden Apple Maps views for MKMapSnapshotter — no provider prop = MapKit on iOS */}
      <NativeMapView
        ref={appleMapRef}
        style={styles.hiddenMapView}
      />
      <NativeMapView
        ref={appleMapSatelliteRef}
        style={styles.hiddenMapView}
        mapType="satellite"
      />
    </View>
  );
};

export default MapView;

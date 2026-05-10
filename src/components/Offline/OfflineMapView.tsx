import { useNavigation, useRoute } from "@react-navigation/native";
import { INatIcon, INatIconButton } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { RealmContext } from "providers/contexts";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LayoutChangeEvent } from "react-native";
import {
  Alert,
  Dimensions,
  Image,
  InteractionManager,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View as NativeView,
} from "react-native";
import {
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import NativeMapView, { Marker } from "react-native-maps";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  Easing,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type OfflineObservation from "realmModels/OfflineObservation";
import type OfflineRegion from "realmModels/OfflineRegion";
import { getCurrentPosition } from "sharedHelpers/geolocationWrapper";
import { useTranslation } from "sharedHooks";
import type { UserLocation } from "sharedHooks/useWatchPosition";

const DROP_SHADOW = Platform.select( {
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 4,
  },
} ) ?? {};

const { useObject } = RealmContext;

// Pin sizes — match iNat tile-dot visual size
const PIN_WIDTH = 18;
const PIN_HEIGHT = 18;
const OBSCURED_WIDTH = 16;
const OBSCURED_HEIGHT = 16;
// GPS dot — matches Apple Maps inner blue dot (~14pt inner + 3pt white ring)
const GPS_DOT_SIZE = 20;
// Pulse ring expands to ~2× the dot, ring-only (no fill) like Apple Maps
const GPS_PULSE_MAX = GPS_DOT_SIZE * 2.2;

const MIN_SCALE = 0.8;
const MAX_SCALE = 8;

const BANNER_HEIGHT = 36;

const styles = StyleSheet.create( {
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingTop: 52,
    paddingBottom: 8,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  banner: {
    height: BANNER_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0a500",
  },
  bannerText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  mapArea: { flex: 1, overflow: "hidden", backgroundColor: "#000" },
  notFound: { flex: 1, alignItems: "center", justifyContent: "center" },
  notFoundText: { color: "#888" },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
    width: "75%",
    ...DROP_SHADOW,
  },
  loadingTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    backgroundColor: "#74AC00",
    borderRadius: 3,
  },
  loadingCounter: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 6,
  },
  cancelButton: {
    marginTop: 8,
    alignItems: "center",
    paddingVertical: 2,
  },
  cancelButtonText: {
    fontSize: 13,
    color: "#c00",
    fontWeight: "600",
  },
  reCenterButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
  },
  toggleButton: {
    position: "absolute",
    bottom: 20,
    right: 16,
  },
  satelliteToggleButton: {
    position: "absolute",
    bottom: 20,
    left: 72, // 16 (margin) + 44 (re-center button) + 12 (gap)
  },
  toggleButtonPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 14,
    height: 44,
    gap: 6,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  gpsDot: {
    width: GPS_DOT_SIZE,
    height: GPS_DOT_SIZE,
    borderRadius: GPS_DOT_SIZE / 2,
    backgroundColor: "#007AFF",
    borderWidth: 2.5,
    borderColor: "#fff",
    ...Platform.select( {
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
    } ),
  },
  flex1: { flex: 1 },
  snapshotImageContainer: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  noSnapshotPlaceholder: {
    flex: 1,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  noSnapshotText: { color: "#888" },
  backButtonTint: { tintColor: "#fff" },
  mapkitFlex: { flex: 1 },
  pinContainer: { position: "absolute", left: 0, top: 0 },
  debugOffsetBox: {
    position: "absolute",
    top: 120,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 10,
    padding: 10,
    zIndex: 999,
    alignItems: "center",
    gap: 6,
  },
  debugOffsetLabel: { color: "#fff", fontSize: 13, fontWeight: "600" },
  debugOffsetInput: {
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 16,
    width: 100,
    textAlign: "center",
  },
  // Help modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 4,
    width: "100%",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 14,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginBottom: 4,
  },
  modalBody: {
    fontSize: 13,
    color: "#333",
    lineHeight: 19,
    marginBottom: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 14,
  },
  modalButtonRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    marginHorizontal: -20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalButtonDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  modalButtonText: {
    fontSize: 17,
    color: "#007AFF",
  },
  modalButtonTextBold: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "600",
  },
} );

// ─── Pin rendered outside the scaled container, fixed visual size ─────────────
// ─── GPS dot (fixed visual size, centre-anchored) ─────────────────────────────
interface GpsDotProps {
  imgX: number;
  imgY: number;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  cX: number;
  cY: number;
  accuracyPx: number;
}

const GpsDot = React.memo( ( {
  imgX, imgY, scale, translateX, translateY, cX, cY, accuracyPx,
}: GpsDotProps ) => {
  // Apple Maps-style ring pulse: starts at the dot's edge, expands and fades
  const pulse = useSharedValue( 0 );

  useEffect( () => {
    pulse.value = withRepeat(
      withTiming( 1, { duration: 1800, easing: Easing.out( Easing.cubic ) } ),
      -1,
      false,
    );
  }, [pulse] );

  // imgX/imgY are plain numbers captured from props. When userLocation changes,
  // React re-renders GpsDot with new numbers (React.memo allows re-render when
  // number props differ). pan/pinch still animate via the gesture SharedValues.

  // Accuracy circle — semi-transparent fill, scales with map zoom
  const accuracyStyle = useAnimatedStyle( () => {
    "worklet";

    const sx = ( imgX - cX ) * scale.value + cX + translateX.value;
    const sy = ( imgY - cY ) * scale.value + cY + translateY.value;
    const r = accuracyPx * scale.value;
    const size = r * 2;
    return {
      position: "absolute" as const,
      left: sx - r,
      top: sy - r,
      width: size,
      height: size,
      borderRadius: r,
      backgroundColor: "rgba(0, 122, 255, 0.10)",
      borderWidth: 1,
      borderColor: "rgba(0, 122, 255, 0.30)",
    };
  } );

  // Expanding ring pulse — ring (border) only, fades out as it grows
  const pulseStyle = useAnimatedStyle( () => {
    "worklet";

    const sx = ( imgX - cX ) * scale.value + cX + translateX.value;
    const sy = ( imgY - cY ) * scale.value + cY + translateY.value;
    const size = GPS_DOT_SIZE + pulse.value * ( GPS_PULSE_MAX - GPS_DOT_SIZE );
    return {
      position: "absolute" as const,
      left: sx - size / 2,
      top: sy - size / 2,
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: "rgba(0, 122, 255, 0.55)",
      backgroundColor: "transparent" as const,
      opacity: 1 - pulse.value,
    };
  } );

  // The solid blue dot
  const dotStyle = useAnimatedStyle( () => {
    "worklet";

    const sx = ( imgX - cX ) * scale.value + cX + translateX.value;
    const sy = ( imgY - cY ) * scale.value + cY + translateY.value;
    return {
      position: "absolute" as const,
      left: sx - GPS_DOT_SIZE / 2,
      top: sy - GPS_DOT_SIZE / 2,
    };
  } );

  return (
    <>
      {accuracyPx > GPS_DOT_SIZE && (
        <Animated.View style={accuracyStyle} pointerEvents="none" />
      )}
      <Animated.View style={pulseStyle} pointerEvents="none" />
      <Animated.View style={[styles.gpsDot, dotStyle]} pointerEvents="none" />
    </>
  );
} );

// ─── Pin layer ─────────────────────────────────────────────────────────────────
// Each pin has its own useAnimatedStyle worklet that computes its screen-space
// position from the shared scale/translateX/translateY SharedValues. This keeps
// the pin image at a fixed visual size regardless of zoom level, matching
// MapKit's native annotation behavior.

interface PinItem {
  uuid: string;
  obscured?: boolean;
  ix: number;
  iy: number;
  obs: OfflineObservation;
}

interface ScreenshotPinsProps {
  pins: PinItem[];
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  displayWidth: number;
  displayHeight: number;
  onProgress: ( rendered: number, total: number ) => void;
}

const PIN_IMAGE = require( "images/location_indicator.png" );
const OBSCURED_PIN_IMAGE = require( "images/obscured_location_indicator.png" );

interface PinViewProps {
  ix: number;
  iy: number;
  obscured: boolean;
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  cX: number;
  cY: number;
}

// Per-pin animated view: useAnimatedStyle computes screen-space position on
// every gesture frame so the pin anchor stays at the correct geographic point
// while the pin image stays at a fixed size regardless of zoom level.
// React.memo prevents React re-renders — SharedValues are stable references so
// props never change after mount; position updates run on the UI thread only.
const PinView = React.memo( ( {
  ix, iy, obscured, scale, translateX, translateY, cX, cY,
}: PinViewProps ) => {
  const w = obscured
    ? OBSCURED_WIDTH
    : PIN_WIDTH;
  const h = obscured
    ? OBSCURED_HEIGHT
    : PIN_HEIGHT;
  const animStyle = useAnimatedStyle( () => ( {
    position: "absolute" as const,
    left: ( ix - cX ) * scale.value + cX + translateX.value - w / 2,
    top: ( iy - cY ) * scale.value + cY + translateY.value - ( obscured
      ? h / 2
      : h ),
  } ) );
  return (
    <Animated.View style={animStyle} pointerEvents="none">
      <Image
        source={obscured
          ? OBSCURED_PIN_IMAGE
          : PIN_IMAGE}
        style={{ width: w, height: h }}
      />
    </Animated.View>
  );
} );

// Each committed batch lives in its own memoized subtree. Because React.memo
// sees a stable `pins` array reference (stored in the parent's state array and
// never replaced), it skips the batch entirely on subsequent renders.
// Always cap at 10 batches so the total load time is bounded to ~10 frames
// regardless of pin count. batchSize = ceil(N/10), so 300 pins → 10×30,
// 600 pins → 10×60, etc.
const MAX_BATCHES = 10;

interface PinBatchProps {
  pins: PinItem[];
  scale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  cX: number;
  cY: number;
}

// Each batch gets its own absoluteFill NativeView so it forms an isolated
// Yoga subtree. The parent NativeView only gains one new child per batch
// (not BATCH_SIZE), keeping Yoga work O(1) per batch instead of O(N_total).
const PinBatch = React.memo( ( {
  pins, scale, translateX, translateY, cX, cY,
}: PinBatchProps ) => (
  <NativeView style={StyleSheet.absoluteFill} pointerEvents="none">
    {pins.map( ( {
      uuid, ix, iy, obscured,
    } ) => (
      <PinView
        key={uuid}
        ix={ix}
        iy={iy}
        obscured={obscured ?? false}
        scale={scale}
        translateX={translateX}
        translateY={translateY}
        cX={cX}
        cY={cY}
      />
    ) )}
  </NativeView>
) );

const ScreenshotPins = React.memo( ( {
  pins, scale, translateX, translateY, displayWidth, displayHeight, onProgress,
}: ScreenshotPinsProps ) => {
  // Each element is a stable slice of `pins` — appended once, never replaced.
  const [batches, setBatches] = useState<PinItem[][]>( [] );

  // Dynamic batch size: always use exactly MAX_BATCHES batches regardless of N.
  // pins is stable (from pinData memo) so batchSize never changes after mount.
  const batchSize = Math.max( 100, Math.ceil( pins.length / MAX_BATCHES ) );
  const rendered = Math.min( batches.length * batchSize, pins.length );

  useEffect( () => {
    onProgress( rendered, pins.length );
    if ( rendered >= pins.length ) { return () => {}; }
    const batchIdx = batches.length;
    const start = batchIdx * batchSize;
    const end = Math.min( start + batchSize, pins.length );
    const id = setTimeout( () => {
      // Append a new stable slice — existing slices keep their references so
      // PinBatch components at indices 0..K-1 are untouched by React.memo.
      setBatches( prev => [...prev, pins.slice( start, end )] );
    }, 0 );
    return () => { clearTimeout( id ); };
  }, [batches.length, batchSize, pins, onProgress, rendered] );

  const cX = displayWidth / 2;
  const cY = displayHeight / 2;

  return (
    <NativeView
      style={[
        styles.pinContainer,
        { width: displayWidth, height: displayHeight },
      ]}
      pointerEvents="none"
    >
      {batches.map( ( batch, i ) => (
        // eslint-disable-next-line react/no-array-index-key, react/jsx-first-prop-new-line
        <PinBatch key={i}
          pins={batch}
          scale={scale}
          translateX={translateX}
          translateY={translateY}
          cX={cX}
          cY={cY}
        />
      ) )}
    </NativeView>
  );
} );

interface MapKitPinsProps {
  pins: PinItem[];
  showObsDetail: ( obs: OfflineObservation ) => void;
  onProgress: ( rendered: number, total: number ) => void;
}

// image prop instead of custom child views — MapKit gets a plain UIImage with
// no MKAnnotationView subclass, no JSI round-trips per pin, and no O(N²)
// annotation layout pass. Eliminates the 77-second block on 634 pins.
// Batched the same way as ScreenshotPins so the parent can show a progress bar.
const MapKitPins = React.memo( ( { pins, showObsDetail, onProgress }: MapKitPinsProps ) => {
  const [batches, setBatches] = useState<PinItem[][]>( [] );
  const batchSize = Math.max( 100, Math.ceil( pins.length / MAX_BATCHES ) );
  const rendered = Math.min( batches.length * batchSize, pins.length );

  useEffect( () => {
    onProgress( rendered, pins.length );
    if ( rendered >= pins.length ) { return () => {}; }
    const start = rendered;
    const end = Math.min( start + batchSize, pins.length );
    const id = setTimeout( () => {
      setBatches( prev => [...prev, pins.slice( start, end )] );
    }, 0 );
    return () => clearTimeout( id );
  }, [batches.length, batchSize, pins, onProgress, rendered] );

  return (
    <>
      {batches.flat().map( ( { uuid, obscured, obs } ) => (
        <Marker
          key={uuid}
          coordinate={{ latitude: obs.latitude!, longitude: obs.longitude! }}
          image={obscured
            ? OBSCURED_PIN_IMAGE
            : PIN_IMAGE}
          // `anchor` is Google Maps only on iOS; use centerOffset for MapKit.
          // -9pt shifts the pin up so its tip lands on the coordinate.
          centerOffset={obscured
            ? { x: 0, y: 0 }
            : { x: 0, y: -9 }}
          onPress={() => { showObsDetail( obs ); }}
        />
      ) )}
    </>
  );
} );

// ─── Main component ───────────────────────────────────────────────────────────
interface RouteParams {
  regionId: string;
}

const OfflineMapView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute();
  const { regionId } = params as RouteParams;

  const region = useObject<OfflineRegion>( "OfflineRegion", regionId );

  // Map display mode: static (screenshot) saved-map view vs. live MapKit view
  const [mapMode, setMapMode] = useState<"static" | "mapkit">( "static" );
  const [staticViewMode, setStaticViewMode] = useState<"standard" | "satellite">( "standard" );
  const [helpVisible, setHelpVisible] = useState( false );
  const mapkitRef = useRef<InstanceType<typeof NativeMapView> | null>( null );

  // GPS location — poll getCurrentPosition every second so the dot always
  // reflects the latest fix without relying on watchPosition.
  const [userLocation, setUserLocation] = useState<UserLocation | null>( null );

  useEffect( () => {
    const poll = () => getCurrentPosition(
      pos => setUserLocation( {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        positional_accuracy: pos.coords.accuracy,
        altitude: pos.coords.altitude,
        altitudinal_accuracy: pos.coords.altitudeAccuracy,
      } ),
      () => {},
      { enableHighAccuracy: true, maximumAge: 0 },
    );

    poll(); // immediate first fetch
    const intervalId = setInterval( poll, 1_000 );
    return () => { clearInterval( intervalId ); };
  }, [] );

  // screenWidth is used both by pinData useMemo and the worklet captures below —
  // must be declared before both
  const { width: screenWidth } = Dimensions.get( "window" );

  // Defer mounting 300+ pins until after the screen navigation animation completes
  // so the map image renders immediately on open
  const [pinsReady, setPinsReady] = useState( false );
  useEffect( () => {
    const handle = InteractionManager.runAfterInteractions( () => { setPinsReady( true ); } );
    return () => handle.cancel();
  }, [] );

  // Tracks ScreenshotPins batch-render progress. Non-null while loading;
  // rendered === total means all pins committed.
  const [pinsProgress, setPinsProgress] = useState<{
    rendered: number;
    total: number;
  } | null>( null );
  const handlePinsProgress = useCallback(
    ( rendered: number, total: number ) => { setPinsProgress( { rendered, total } ); },
    [],
  );
  const pinsLoading = pinsProgress !== null && pinsProgress.rendered < pinsProgress.total;

  // Tracks whether MapKit has been entered at least once — once true the
  // NativeMapView stays mounted (hidden) so pins don't reload on re-entry.
  const [mapkitEverShown, setMapkitEverShown] = useState( false );

  // MapKit readiness — false until onMapReady fires; only reset on first entry
  const [mapkitReady, setMapkitReady] = useState( false );

  // Tracks MapKitPins batch-render progress (mirrors pinsProgress for static mode (screenshot))
  const [mapkitPinsProgress, setMapkitPinsProgress] = useState<{
    rendered: number;
    total: number;
  } | null>( null );
  const handleMapkitPinsProgress = useCallback(
    ( rendered: number, total: number ) => { setMapkitPinsProgress( { rendered, total } ); },
    [],
  );
  const mapkitPinsLoading = mapkitPinsProgress !== null
    && mapkitPinsProgress.rendered < mapkitPinsProgress.total;
  const mapkitLoading = mapMode === "mapkit" && ( !mapkitReady || mapkitPinsLoading );
  const anyLoading = pinsLoading || mapkitLoading;

  useEffect( () => {
    if ( mapMode === "mapkit" && !mapkitEverShown ) {
      setMapkitReady( false );
      setMapkitPinsProgress( null );
      setMapkitEverShown( true );
    }
  }, [mapMode] ); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-compute all pin positions once when region loads rather than recalculating
  // on every render. Also derives bounds used for GPS in-bounds check.
  const pinData = useMemo( () => {
    if ( !region ) { return null; }
    const sw = region.snapshotWidth ?? screenWidth;
    const sh = region.snapshotHeight ?? screenWidth;
    const dW = screenWidth;
    const dH = screenWidth * ( sh / sw );
    const swLng = region.centerLongitude - region.longitudeDelta / 2;
    const neLng = region.centerLongitude + region.longitudeDelta / 2;
    const swLat = region.centerLatitude - region.latitudeDelta / 2;
    const neLat = region.centerLatitude + region.latitudeDelta / 2;
    // Apple Maps (MKMapSnapshotter) fits longitudeDelta exactly across the
    // snapshot width, then fills the height at the same Mercator scale.
    // Because portrait screens are tall, the snapshot shows MORE latitude than
    // latitudeDelta — so latitudeDelta is wrong as a vertical bound.
    // Correct bounds: center ± halfMercH where halfMercH = (dH/dW) × lngDelta × π/360.
    // This formula also guarantees centerLatitude maps exactly to dH/2.
    const mercY = ( lat: number ) => Math.log(
      Math.tan( Math.PI / 4 + ( lat * Math.PI ) / 360 ),
    );
    const halfMercH = ( ( dH / dW ) * region.longitudeDelta * Math.PI ) / 360;
    const mercCenter = mercY( region.centerLatitude );
    const mercNorth = mercCenter + halfMercH;
    const mercSouth = mercCenter - halfMercH;
    const pins = Array.from( region.observations )
      .filter( obs => obs.latitude && obs.longitude )
      .map( obs => {
        const obscured = obs.obscured ?? false;
        const ix = ( ( obs.longitude! - swLng ) / ( neLng - swLng ) ) * dW;
        const iy = ( ( mercNorth - mercY( obs.latitude! ) ) / ( mercNorth - mercSouth ) ) * dH;
        return {
          uuid: obs.uuid,
          obscured,
          ix,
          iy,
          obs,
        };
      } );
    return {
      swLng,
      neLng,
      swLat,
      neLat,
      dW,
      dH,
      pins,
      mercNorth,
      mercSouth,
      mercY,
      // meters → image pixels conversion for accuracy circle
      metersPerPixel: ( region.latitudeDelta * 111_000 ) / dH,
    };
  }, [region, screenWidth] );

  // Track the rendered map area height so re-center hits the visual centre
  const mapAreaHeight = useRef( Dimensions.get( "window" ).height );
  const handleMapAreaLayout = useCallback( ( e: LayoutChangeEvent ) => {
    mapAreaHeight.current = e.nativeEvent.layout.height;
  }, [] );

  // Pan/pinch shared values
  const scale = useSharedValue( 1 );
  const translateX = useSharedValue( 0 );
  const translateY = useSharedValue( 0 );
  // Tracks e.scale from the previous pinch frame so we can compute incremental delta
  const lastPinchScale = useSharedValue( 1 );
  // Hide pin layer on UI thread during re-center animation so iOS skips compositing
  // all N SVG CALayers per frame — makes re-center instant regardless of pin count
  const pinLayerOpacity = useSharedValue( 1 );

  // Pre-compute display dimensions as plain JS numbers so worklets can capture them
  // (Realm objects cannot cross the UI/worklet runtime boundary)
  const snapshotW = region?.snapshotWidth ?? screenWidth;
  const snapshotH = region?.snapshotHeight ?? screenWidth;
  const displayWidth = screenWidth;
  const displayHeight = screenWidth * ( snapshotH / snapshotW );
  const cX = displayWidth / 2;
  const cY = displayHeight / 2;

  const pinLayerStyle = useAnimatedStyle( () => ( { opacity: pinLayerOpacity.value } ) );

  // Animated style for the image container
  const imageContainerStyle = useAnimatedStyle( () => ( {
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  } ) );

  const showObsDetail = useCallback( ( obs: OfflineObservation ) => {
    const name = obs.taxon_common_name || obs.taxon_name || "Unknown";
    const lines = [
      obs.observed_on
        ? `Date: ${obs.observed_on}`
        : null,
      obs.place_guess
        ? `Place: ${obs.place_guess}`
        : null,
      obs.obscured
        ? "Location: Obscured"
        : null,
    ].filter( Boolean ).join( "\n" );
    Alert.alert( name, lines || "No details available" );
  }, [] );

  // Single tap handler for all pins. Called from the UI-thread tap worklet with
  // the current transform values so hit-testing uses the exact rendered positions.
  // Screen-space hit radius stays constant regardless of zoom level.
  const HIT_RADIUS_SCREEN = 20;
  const handlePinTap = useCallback( (
    tapX: number,
    tapY: number,
    curScale: number,
    curTX: number,
    curTY: number,
  ) => {
    if ( !pinData ) { return; }
    // Invert the image transform to get image-space tap coordinates
    const imgTapX = ( tapX - cX - curTX ) / curScale + cX;
    const imgTapY = ( tapY - cY - curTY ) / curScale + cY;
    const hitRadiusImg = HIT_RADIUS_SCREEN / curScale;
    const hitRadiusSq = hitRadiusImg * hitRadiusImg;
    for ( const pin of pinData.pins ) {
      const dx = pin.ix - imgTapX;
      const dy = pin.iy - imgTapY;
      if ( dx * dx + dy * dy <= hitRadiusSq ) {
        showObsDetail( pin.obs );
        return;
      }
    }
  }, [pinData, cX, cY, showObsDetail] );

  // ── Pan gesture: accumulate per-frame deltas (.onChange gives changeX / changeY)
  const panGesture = Gesture.Pan()
    .onChange( e => {
      "worklet";

      translateX.value += e.changeX;
      translateY.value += e.changeY;
    } );

  // ── Pinch gesture: scale around focal point, incremental per-frame
  const pinchGesture = Gesture.Pinch()
    .onStart( () => {
      "worklet";

      lastPinchScale.value = 1;
    } )
    .onUpdate( e => {
      "worklet";

      const ds = e.scale / lastPinchScale.value;
      const newScale = Math.max( MIN_SCALE, Math.min( MAX_SCALE, scale.value * ds ) );
      const actualDs = newScale / scale.value;

      // Keep focal point stationary: adjust translation so the pinch centre
      // doesn't drift (formula derived from React Native's centre-anchored transform).
      translateX.value = ( e.focalX - cX ) * ( 1 - actualDs ) + actualDs * translateX.value;
      translateY.value = ( e.focalY - cY ) * ( 1 - actualDs ) + actualDs * translateY.value;

      scale.value = newScale;
      lastPinchScale.value = e.scale;
    } );

  // Single tap gesture for pin hit-testing. Running on the UI thread lets us
  // read scale/translate values atomically, then hand off to JS for the O(N)
  // pin search. Fails automatically if the touch moves (pan) or takes too long.
  const tapGesture = Gesture.Tap()
    .maxDuration( 250 )
    .onEnd( e => {
      "worklet";

      runOnJS( handlePinTap )( e.x, e.y, scale.value, translateX.value, translateY.value );
    } );

  const combinedGesture = Gesture.Simultaneous( panGesture, pinchGesture, tapGesture );

  const handleReCenter = useCallback( () => {
    // MapKit mode: animate to GPS location, or saved region center as fallback
    if ( mapMode === "mapkit" ) {
      const target = userLocation
        ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: region?.latitudeDelta ?? 0.01,
          longitudeDelta: region?.longitudeDelta ?? 0.01,
        }
        : {
          latitude: region?.centerLatitude ?? 0,
          longitude: region?.centerLongitude ?? 0,
          latitudeDelta: region?.latitudeDelta ?? 0.01,
          longitudeDelta: region?.longitudeDelta ?? 0.01,
        };
      mapkitRef.current?.animateToRegion( target, 200 );
      return;
    }

    // Static mode (screenshot) — run on the UI thread so scale.value is always current
    if ( !pinData ) { return; }

    // If we have a GPS fix but it's outside the saved region, alert and bail.
    if ( userLocation ) {
      const {
        swLng, neLng, swLat, neLat,
      } = pinData;
      const inBounds = userLocation.latitude >= swLat && userLocation.latitude <= neLat
        && userLocation.longitude >= swLng && userLocation.longitude <= neLng;
      if ( !inBounds ) {
        Alert.alert(
          "Outside Map Area",
          "Your current location is outside the bounds of this saved map.",
        );
        return;
      }
    }

    const viewportCY = mapAreaHeight.current / 2;
    if ( userLocation ) {
      const lon = userLocation.longitude;
      const lat = userLocation.latitude;
      const {
        swLng, neLng, swLat, neLat, dW, dH,
      } = pinData;
      const _cX = cX;
      const _cY = cY;
      const _vcY = viewportCY;
      runOnUI( () => {
        "worklet";

        // Hide pins before animating — iOS skips compositing all N SVG layers
        // per frame, making the 150 ms re-center completely smooth.
        pinLayerOpacity.value = 0;
        const gpsX = ( ( lon - swLng ) / ( neLng - swLng ) ) * dW;
        const gpsY = ( ( neLat - lat ) / ( neLat - swLat ) ) * dH;
        translateX.value = withTiming(
          -( gpsX - _cX ) * scale.value,
          { duration: 150 },
          finished => {
            "worklet";

            if ( finished ) { pinLayerOpacity.value = 1; }
          },
        );
        translateY.value = withTiming(
          -( gpsY - _cY ) * scale.value + ( _vcY - _cY ),
          { duration: 150 },
        );
      } )();
    } else {
      // No GPS — reset the view to show the full saved region
      runOnUI( () => {
        "worklet";

        pinLayerOpacity.value = 0;
        translateX.value = withTiming( 0, { duration: 150 } );
        translateY.value = withTiming( 0, { duration: 150 } );
        scale.value = withTiming( 1, { duration: 150 }, finished => {
          "worklet";

          if ( finished ) { pinLayerOpacity.value = 1; }
        } );
      } )();
    }
  }, [
    userLocation, mapMode, region, pinData, cX, cY,
    scale, translateX, translateY, pinLayerOpacity,
  ] );

  if ( !region ) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{t( "Region-not-found" )}</Text>
      </View>
    );
  }

  // Bounds and GPS derived from pre-computed pinData (avoids recomputing after early return)
  const swLng = pinData?.swLng ?? 0;
  const neLng = pinData?.neLng ?? 0;
  const swLat = pinData?.swLat ?? 0;
  const neLat = pinData?.neLat ?? 0;

  // GPS dot — only show when we have a fix inside the saved region bounds
  const gpsInBounds = !!( userLocation
    && userLocation.latitude >= swLat && userLocation.latitude <= neLat
    && userLocation.longitude >= swLng && userLocation.longitude <= neLng );

  // Plain-number GPS position in image-space — recomputed on every render when
  // userLocation changes so React.memo(GpsDot) receives new props and re-renders.
  const gpsImgX = ( userLocation && pinData )
    ? ( ( userLocation.longitude - pinData.swLng ) / ( pinData.neLng - pinData.swLng ) )
      * pinData.dW
    : 0;
  const gpsImgY = ( userLocation && pinData )
    ? ( ( pinData.mercNorth - pinData.mercY( userLocation.latitude ) )
      / ( pinData.mercNorth - pinData.mercSouth ) ) * pinData.dH
    : 0;
  const gpsAccuracyPx = ( userLocation && pinData )
    ? ( userLocation.positional_accuracy ?? 0 ) / pinData.metersPerPixel
    : 0;

  // Pre-computed outside JSX so react-native/no-inline-styles doesn't fire
  const progressFillWidth = pinsProgress && pinsProgress.total > 0
    ? `${Math.round( ( pinsProgress.rendered / pinsProgress.total ) * 100 )}%` as const
    : "0%" as const;
  const mapkitProgressFillWidth = mapkitPinsProgress && mapkitPinsProgress.total > 0
    ? `${Math.round( ( mapkitPinsProgress.rendered / mapkitPinsProgress.total ) * 100 )}%` as const
    : "0%" as const;

  const staticOpacity = mapMode === "static"
    ? 1
    : 0;
  const staticPointerEvents = mapMode === "static"
    ? "auto" as const
    : "none" as const;
  const mapkitOpacity = mapMode === "mapkit"
    ? 1
    : 0;
  const mapkitPointerEvents = mapMode === "mapkit"
    ? "auto" as const
    : "none" as const;
  const reCenterOpacityMapkit = userLocation
    ? 1
    : 0.4;
  const reCenterOpacityStatic = ( userLocation && gpsInBounds )
    ? 1
    : 0.4;
  const reCenterOpacity = mapMode === "mapkit"
    ? reCenterOpacityMapkit
    : reCenterOpacityStatic;

  // Live mode requires iOS 17+ (offline map downloads in Apple Maps added in iOS 17)
  const supportsLiveMode = Platform.OS === "ios"
    && parseInt( String( Platform.Version ), 10 ) >= 17;

  // Pre-computed outside JSX to satisfy react-native/no-inline-styles
  const toggleOpacity = anyLoading
    ? 0.4
    : 1;
  const reCenterOpacityFinal = anyLoading
    ? 0.4
    : reCenterOpacity;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <INatIconButton
          icon="chevron-left"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={styles.backButtonTint}
        />
        <Text style={styles.headerTitle} numberOfLines={1}>
          {region.name}
        </Text>
        <INatIconButton
          icon="help-circle-outline"
          color="#fff"
          // eslint-disable-next-line i18next/no-literal-string
          accessibilityLabel="Help"
          onPress={() => setHelpVisible( true )}
        />
      </View>

      {/* Offline banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          {mapMode === "static"
            ? "Static Map"
            : "Live Map"}
        </Text>
      </View>

      {/* Map area — pan + pinch gestures */}
      <View style={styles.mapArea} onLayout={handleMapAreaLayout}>
        {/* Static (screenshot) content — always mounted so pins don't remount on toggle */}
        <View
          style={[StyleSheet.absoluteFill, { opacity: staticOpacity }]}
          pointerEvents={staticPointerEvents}
        >
          <GestureDetector gesture={combinedGesture}>
            <Animated.View style={styles.flex1}>
              {/* Snapshot image (scaled + translated) */}
              <Animated.View
                style={[
                  {
                    ...styles.snapshotImageContainer,
                    width: displayWidth,
                    height: displayHeight,
                  },
                  imageContainerStyle,
                ]}
              >
                {( staticViewMode === "satellite"
                  ? region.satelliteSnapshotPath
                  : region.snapshotPath )
                  ? (
                    <Image
                      source={{
                        uri: staticViewMode === "satellite"
                          ? region.satelliteSnapshotPath
                          : region.snapshotPath,
                      }}
                      style={{ width: displayWidth, height: displayHeight }}
                      resizeMode="cover"
                    />
                  )
                  : (
                    <View style={styles.noSnapshotPlaceholder}>
                      <Text style={styles.noSnapshotText}>
                        {t( "No-map-snapshot" )}
                      </Text>
                    </View>
                  )}
              </Animated.View>

              {/* Observation pins — deferred until after screen transition.
                  Wrapped in an animated opacity layer so the UI thread can hide
                  all pins (opacity→0) before re-center animation starts, skipping
                  GPU compositing of N SVG CALayers on every animation frame. */}
              <Animated.View style={pinLayerStyle} pointerEvents="none">
                {pinsReady && pinData && (
                  <ScreenshotPins
                    pins={pinData.pins}
                    scale={scale}
                    translateX={translateX}
                    translateY={translateY}
                    displayWidth={displayWidth}
                    displayHeight={displayHeight}
                    onProgress={handlePinsProgress}
                  />
                )}
              </Animated.View>

              {/* GPS dot — only when inside saved region bounds */}
              {gpsInBounds && (
                <GpsDot
                  imgX={gpsImgX}
                  imgY={gpsImgY}
                  scale={scale}
                  translateX={translateX}
                  translateY={translateY}
                  cX={cX}
                  cY={cY}
                  accuracyPx={gpsAccuracyPx}
                />
              )}
            </Animated.View>
          </GestureDetector>
        </View>

        {/* Live MapKit view — deferred until first entry to avoid blocking
            Fabric commits during static (screenshot) pin loading (MapKit's first Metal
            render pass holds the main thread). Once shown, stays mounted so
            pins are cached and don't reload on subsequent re-entries. */}
        {mapkitEverShown && (
          <View
            style={[StyleSheet.absoluteFill, { opacity: mapkitOpacity }]}
            pointerEvents={mapkitPointerEvents}
          >
            <NativeMapView
              ref={mapkitRef}
              style={styles.mapkitFlex}
              showsUserLocation
              initialRegion={{
                latitude: region.centerLatitude,
                longitude: region.centerLongitude,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
              }}
              onMapReady={() => { setMapkitReady( true ); }}
            >
              {pinsReady && pinData && (
                <MapKitPins
                  pins={pinData.pins}
                  showObsDetail={showObsDetail}
                  onProgress={handleMapkitPinsProgress}
                />
              )}
            </NativeMapView>
          </View>
        )}

        {/* Satellite / standard toggle — static mode only */}
        {mapMode === "static" && (
          <View style={styles.satelliteToggleButton}>
            <INatIconButton
              icon="map-layers"
              onPress={() => setStaticViewMode( prev => (
                prev === "standard"
                  ? "satellite"
                  : "standard"
              ) )}
              accessibilityLabel={
                staticViewMode === "standard"
                  // eslint-disable-next-line i18next/no-literal-string
                  ? "Switch to satellite view"
                  // eslint-disable-next-line i18next/no-literal-string
                  : "Switch to standard view"
              }
              className="bg-white rounded-full"
              style={DROP_SHADOW}
            />
          </View>
        )}

        {/* Toggle between static (screenshot) and live MapKit view — iOS 17+ only */}
        {supportsLiveMode && (
          <View style={styles.toggleButton}>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={anyLoading}
              onPress={() => {
                const next = mapMode === "static"
                  ? "mapkit"
                  : "static";
                setMapMode( () => next );
              }}
              style={[styles.toggleButtonPill, DROP_SHADOW, { opacity: toggleOpacity }]}
              activeOpacity={0.8}
            >
              <INatIcon
                name="map"
                size={15}
                color="#333"
              />
              <Text style={styles.toggleButtonText}>
                {mapMode === "static"
                  ? "Live"
                  : "Static"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Re-center button */}
        <View style={styles.reCenterButton}>
          <INatIconButton
            icon="location-crosshairs"
            disabled={anyLoading}
            onPress={handleReCenter}
            accessibilityLabel="Re-center on my location"
            className="bg-white rounded-full"
            style={{
              opacity: reCenterOpacityFinal,
              ...DROP_SHADOW,
            }}
          />
        </View>

        {/* Pin-loading overlay — gray-out while ScreenshotPins batches Fabric commits.
            pointerEvents="box-none" so the background
            tint is visual-only and does NOT absorb touches; the re-center and
            toggle buttons are disabled via their own disabled props, while the
            back button in the header remains fully interactive. */}
        {pinsLoading && mapMode === "static" && (
          <NativeView style={styles.loadingOverlay} pointerEvents="box-none">
            <NativeView style={styles.loadingCard}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Text style={styles.loadingTitle}>Loading pins…</Text>
              <NativeView style={styles.progressTrack}>
                <NativeView
                  style={[styles.progressFill, { width: progressFillWidth }]}
                />
              </NativeView>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Text style={styles.loadingCounter}>
                {pinsProgress
                  ? `${pinsProgress.rendered} / ${pinsProgress.total} pins`
                  : ""}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </NativeView>
          </NativeView>
        )}

        {/* MapKit loading overlay — shown while MapKit loads the map tile and
            while MapKitPins batches its Marker commits. Title changes from
            "Loading map…" (waiting for onMapReady) to "Loading pins…" once
            the map is ready and pin batching begins. */}
        {mapkitLoading && (
          <NativeView style={styles.loadingOverlay} pointerEvents="box-none">
            <NativeView style={styles.loadingCard}>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Text style={styles.loadingTitle}>
                {mapkitReady
                  ? "Loading pins…"
                  : "Loading map…"}
              </Text>
              <NativeView style={styles.progressTrack}>
                <NativeView
                  style={[styles.progressFill, { width: mapkitProgressFillWidth }]}
                />
              </NativeView>
              {/* eslint-disable-next-line i18next/no-literal-string */}
              <Text style={styles.loadingCounter}>
                {mapkitPinsProgress
                  ? `${mapkitPinsProgress.rendered} / ${mapkitPinsProgress.total} pins`
                  : ""}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => navigation.goBack()}
                style={styles.cancelButton}
              >
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </NativeView>
          </NativeView>
        )}

      </View>

      {/* Help modal */}
      <Modal
        visible={helpVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHelpVisible( false )}
      >
        <Pressable
          accessibilityRole="button"
          style={styles.modalOverlay}
          onPress={() => setHelpVisible( false )}
        >
          <Pressable accessibilityRole="button" style={styles.modalCard}>
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.modalTitle}>Map Modes</Text>

            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.modalSectionTitle}>Static Mode</Text>
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.modalBody}>
              Shows a saved snapshot of this area. Works fully offline without any extra setup.
            </Text>

            <NativeView style={styles.modalDivider} />

            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.modalSectionTitle}>Live Mode (iOS 17+)</Text>
            {/* eslint-disable-next-line i18next/no-literal-string */}
            <Text style={styles.modalBody}>
              {"Uses Apple Maps. For it to work offline, first download this area in Apple Maps:\n"
                + "  1. Open Maps and search for this location\n"
                + "  2. Tap the result, tap (\u2022\u2022\u2022) \u2192 Download Map\n"
                + "  3. Adjust the area and tap Download"}
            </Text>

            <NativeView style={styles.modalButtonRow}>
              <Pressable
                accessibilityRole="button"
                style={styles.modalButton}
                onPress={() => setHelpVisible( false )}
              >
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Text style={styles.modalButtonText}>OK</Text>
              </Pressable>
              <NativeView style={styles.modalButtonDivider} />
              <Pressable
                accessibilityRole="button"
                style={styles.modalButton}
                onPress={() => {
                  setHelpVisible( false );
                  Linking.openURL( "https://support.apple.com/en-us/105084" );
                }}
              >
                {/* eslint-disable-next-line i18next/no-literal-string */}
                <Text style={styles.modalButtonTextBold}>Learn More</Text>
              </Pressable>
            </NativeView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default OfflineMapView;

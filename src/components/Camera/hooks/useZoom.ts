import clamp from "lodash/clamp";
import indexOf from "lodash/indexOf";
import last from "lodash/last";
import {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Gesture,
} from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { CameraDevice } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34

// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;

// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;
const PAN_ZOOM_MIN_DISTANCE = -100;
const PAN_ZOOM_MAX_DISTANCE = 100;

const formatZoomLabel = ( value: number ) => String( Math.round( value * 10 ) / 10 );

// The first switch factor is the wide lens. iOS often reports that handoff as
// video zoom 2, which is shown as 1×, so each label is the stop divided by it.
// Ultra-wide sits at minZoom, below that factor. An empty list (Android 5.2.2)
// still uses the physical cameras.
const lensButtons = (
  device: CameraDevice,
  minZoom: number,
  ceiling: number,
) => {
  const factors = [...( device.zoomLensSwitchFactors ?? [] )]
    .filter( factor => factor > 0 && factor >= minZoom && factor <= ceiling )
    .sort( ( a, b ) => a - b );
  const hasUltraWide = minZoom < 1 || device.physicalDevices?.some(
    physicalDevice => physicalDevice.type === "ultra-wide-angle",
  );

  if ( factors.length === 0 ) {
    const zoomButtonOptions = ["1"];
    if ( hasUltraWide ) {
      zoomButtonOptions.unshift( ".5" );
    }
    if ( device.physicalDevices?.some(
      physicalDevice => physicalDevice.type === "telephoto",
    ) ) {
      zoomButtonOptions.push( "3" );
    }
    return {
      usesSwitchFactors: false,
      zoomButtonOptions,
      zoomButtonValues: zoomButtonOptions.map( option => clamp(
        Number( option ),
        minZoom,
        ceiling,
      ) ),
    };
  }

  const wideZoom = hasUltraWide
    ? factors[0]
    : 1;
  const stops = [...factors];
  if ( minZoom < stops[0] ) {
    stops.unshift( minZoom );
  }
  const zoomButtonValues = [...new Set( stops )];
  return {
    usesSwitchFactors: true,
    zoomButtonOptions: zoomButtonValues.map(
      stop => formatZoomLabel( stop / wideZoom ),
    ),
    zoomButtonValues,
  };
};

const useZoom = ( device: CameraDevice ) => {
  const { maxZoom, minZoom, isVirtualDevice } = device;
  const initialZoomTextValue = "1";
  const neutralZoom = 1;
  const maxZoomWithPinch = Math.min( maxZoom ?? 1, MAX_ZOOM_FACTOR );
  const initialZoom = !isVirtualDevice
    ? minZoom
    : neutralZoom;
  const {
    usesSwitchFactors,
    zoomButtonOptions,
    zoomButtonValues,
  } = useMemo(
    ( ) => lensButtons( device, minZoom, maxZoomWithPinch ),
    [device, maxZoomWithPinch, minZoom],
  );

  const zoom = useSharedValue( initialZoom );
  const startZoom = useSharedValue( initialZoom );

  const labelForDeviceZoom = ( deviceZoom: number ) => {
    const closest = zoomButtonValues.reduce(
      ( best, value, index ) => (
        Math.abs( value - deviceZoom ) < Math.abs( zoomButtonValues[best] - deviceZoom )
          ? index
          : best
      ),
      0,
    );
    return zoomButtonOptions[closest] ?? initialZoomTextValue;
  };
  const [zoomTextValue, setZoomTextValue] = useState(
    ( ) => ( usesSwitchFactors
      ? labelForDeviceZoom( initialZoom )
      : initialZoomTextValue ),
  );

  const handleZoomButtonPress = ( ) => {
    if ( usesSwitchFactors && zoomButtonValues.length > 1 ) {
      const currentIndex = zoomButtonValues.reduce(
        ( best, value, index ) => (
          Math.abs( value - zoom.get( ) ) < Math.abs( zoomButtonValues[best] - zoom.get( ) )
            ? index
            : best
        ),
        0,
      );
      const nextIndex = ( currentIndex + 1 ) % zoomButtonValues.length;
      const nextZoom = zoomButtonValues[nextIndex];
      const nextLabel = zoomButtonOptions[nextIndex];
      zoom.set( withSpring( nextZoom ) );
      setZoomTextValue( nextLabel );
      return;
    }
    if ( zoomTextValue === last( zoomButtonOptions ) ) {
      zoom.set( withSpring( zoomButtonValues[0] ) );
      setZoomTextValue( zoomButtonOptions[0] );
    } else {
      const zoomIndex = indexOf( zoomButtonOptions, zoomTextValue );
      zoom.set( withSpring( zoomButtonValues[zoomIndex + 1] ) );
      setZoomTextValue( zoomButtonOptions[zoomIndex + 1] );
    }
  };

  const onZoomStart = useCallback( ( ) => {
    // start pinch-to-zoom
    startZoom.set( zoom.get() );
  }, [startZoom, zoom] );

  const resetZoom = useCallback( ( ) => {
    const closest = zoomButtonValues.reduce(
      ( best, value, index ) => (
        Math.abs( value - initialZoom ) < Math.abs( zoomButtonValues[best] - initialZoom )
          ? index
          : best
      ),
      0,
    );
    zoom.set( initialZoom );
    setZoomTextValue( usesSwitchFactors
      ? ( zoomButtonOptions[closest] ?? initialZoomTextValue )
      : initialZoomTextValue );
  }, [
    initialZoom,
    initialZoomTextValue,
    usesSwitchFactors,
    zoom,
    zoomButtonOptions,
    zoomButtonValues,
  ] );

  const updateZoomTextValue = useCallback( ( newZoom: number ) => {
    // Compare against the zoom factors the buttons map to, not the labels themselves: a
    // label like "3" is a magnification, while newZoom is a device zoom factor.
    const closestIndex = zoomButtonValues.reduce(
      ( closest, value, index ) => (
        Math.abs( value - newZoom ) < Math.abs( zoomButtonValues[closest] - newZoom )
          ? index
          : closest ),
      0,
    );
    setZoomTextValue( zoomButtonOptions[closestIndex] );
  }, [zoomButtonOptions, zoomButtonValues] );

  const onZoomChange = useCallback( ( newValue: number ) => {
    "worklet";

    const newZoom = interpolate(
      newValue,
      [-1, 0, 1],
      [minZoom, startZoom.get( ), maxZoomWithPinch],
      Extrapolation.CLAMP,
    );
    zoom.set( newZoom );

    scheduleOnRN( updateZoomTextValue, newZoom );
  }, [maxZoomWithPinch, minZoom, updateZoomTextValue, startZoom, zoom] );

  const pinchToZoom = useMemo( ( ) => Gesture.Pinch( )
    .runOnJS( true )
    .onStart( ( ) => {
      onZoomStart( );
    } )
    .onChange( e => {
      // Calculate new zoom value from pinch to zoom
      // (since scale factor is relative to initial pinch)
      const newValue = interpolate(
        e.scale,
        [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
        [-1, 0, 1],
        Extrapolation.CLAMP,
      );
      onZoomChange( newValue );
    } ), [
    onZoomChange,
    onZoomStart,
  ] );

  const yDiff = useSharedValue( 0 );
  const isPanActive = useSharedValue( false );
  const panToZoom = Gesture.Pan()
    .runOnJS( true )
    .averageTouches( true )
    .activateAfterLongPress( 1 )
    .onBegin( () => {
      yDiff.set( 0 );
      isPanActive.set( true );
      onZoomStart( );
    } )
    .onChange( ev => {
      yDiff.set( value => value + ev.changeY );
      // Calculate new zoom value from pan (invert because minus pan is up)
      const newValue = interpolate(
        yDiff.get( ),
        [PAN_ZOOM_MIN_DISTANCE, 0, PAN_ZOOM_MAX_DISTANCE],
        [-1, 0, 1],
        Extrapolation.CLAMP,
      ) * -1;
      onZoomChange( newValue );
    } )
    .onEnd( () => {
      isPanActive.set( false );
    } );

  return {
    handleZoomButtonPress,
    panToZoom,
    pinchToZoom,
    resetZoom,
    showZoomButton: isVirtualDevice,
    zoomTextValue,
    zoom,
  };
};

export default useZoom;

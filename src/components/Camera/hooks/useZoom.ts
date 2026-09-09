import clamp from "lodash/clamp";
import indexOf from "lodash/indexOf";
import last from "lodash/last";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Gesture,
} from "react-native-gesture-handler";
import {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { CameraDevice, CameraProps } from "react-native-vision-camera";
import { scheduleOnRN } from "react-native-worklets";

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34

// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;

// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;
const PAN_ZOOM_MIN_DISTANCE = -100;
const PAN_ZOOM_MAX_DISTANCE = 100;

const useZoom = ( device: CameraDevice ): object => {
  const initialZoomTextValue = "1";
  const zoomButtonOptions = useMemo( () => {
    const options = [initialZoomTextValue];
    if ( device?.physicalDevices?.includes( "ultra-wide-angle-camera" ) ) {
      // Add a 0.5x zoom option for ultra-wide-angle cameras to front of array
      options.unshift( ".5" );
    }
    if ( device?.physicalDevices?.includes( "telephoto-camera" ) ) {
      // Add a 3x zoom option for telephoto cameras to end of array
      options.push( "3" );
    }
    return options;
  }, [device?.physicalDevices] );
  const minZoom = device?.minZoom ?? 1;
  const neutralZoom = device?.neutralZoom ?? 2;
  const maxZoomWithPinch = Math.min( device.maxZoom ?? 1, MAX_ZOOM_FACTOR );
  const initialZoom = !device?.isMultiCam
    ? minZoom
    : neutralZoom;
  const zoom = useSharedValue( initialZoom );
  const startZoom = useSharedValue( initialZoom );
  const [zoomTextValue, setZoomTextValue] = useState( initialZoomTextValue );

  // goal here is to turn the display labels (some subset of .5, 1, 3) into the zoom factor for
  // zoom.set so the result matches what the native camera shows for that label
  //
  // The labels are magnifications relative to the main wide lens. neutralZoom is the zoom
  // factor at which that main lens is active, so factor = neutralZoom * label.
  // ios/android anchor their zoom scales differently, which is why neutralZoom differs:
  //   - Android puts the wide lens at 1.0 and the ultra-wide below it (minZoom ~0.5-0.67),
  //     so neutralZoom is always 1 and the labels already are the zoom factors.
  //   - iOS puts the widest lens at 1.0, so on any iPhone with an ultra-wide the default lens
  //     sits at 2.0 and neutralZoom is 2. Without an ultra-wide it is 1.
  // The clamp keeps requests inside the device's real range
  //
  // notably 3x is that threshold for handing off to the telephoto lens on the 15 Pro
  // but for more recent Pros, that threshold is 5x so maybe we want to account for that someday
  const zoomButtonValues = useMemo(
    ( ) => zoomButtonOptions.map( option => clamp(
      neutralZoom * Number( option ),
      minZoom,
      maxZoomWithPinch,
    ) ),
    [maxZoomWithPinch, minZoom, neutralZoom, zoomButtonOptions],
  );

  useEffect( ( ) => {
    const newInitialZoom = !device?.isMultiCam
      ? minZoom
      : neutralZoom;
    zoom.set( newInitialZoom );
    startZoom.set( newInitialZoom );
  }, [device?.isMultiCam, minZoom, neutralZoom, zoom, startZoom] );

  const handleZoomButtonPress = ( ) => {
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
    zoom.set( initialZoom );
    setZoomTextValue( initialZoomTextValue );
  }, [initialZoom, initialZoomTextValue, zoom] );

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

  const animatedProps = useAnimatedProps < CameraProps >(
    () => ( { zoom: zoom.get( ) } ),
  );

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
    animatedProps,
    handleZoomButtonPress,
    panToZoom,
    pinchToZoom,
    resetZoom,
    showZoomButton: device?.isMultiCam,
    zoomTextValue,
  };
};

export default useZoom;

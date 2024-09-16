import _ from "lodash";
import {
  useCallback,
  useMemo,
  useState
} from "react";
import {
  Gesture, GestureResponderEvent
} from "react-native-gesture-handler";
import {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import type { CameraProps } from "react-native-vision-camera";

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34

// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;

// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;

const zoomButtonOptions = [".5", "1", "3"];

const useZoom = ( device: Object ): Object => {
  const minZoom = device?.minZoom ?? 1;
  const neutralZoom = device?.neutralZoom ?? 2;
  // this maxZoom zooms to 3x magnification on an iPhone 15 Pro
  // currently the camera viewport is different than the photo taken
  // so the photo taken with this zoom looks accurate compared with the native camera
  // photo taken, but the camera preview looks a little too small
  const maxZoomWithButton = neutralZoom ** 2.5;
  const maxZoomWithPinch = Math.min( device.maxZoom ?? 1, MAX_ZOOM_FACTOR );
  const initialZoom = !device?.isMultiCam
    ? minZoom
    : neutralZoom;
  const zoom = useSharedValue( initialZoom );
  const startZoom = useSharedValue( initialZoom );
  const initialZoomTextValue = zoomButtonOptions[1];
  const [zoomTextValue, setZoomTextValue] = useState( initialZoomTextValue );

  const zoomButtonValues = [minZoom, neutralZoom, maxZoomWithButton];

  const handleZoomButtonPress = ( ) => {
    if ( zoomTextValue === _.last( zoomButtonOptions ) ) {
      zoom.value = withSpring( zoomButtonValues[0] );
      setZoomTextValue( zoomButtonOptions[0] );
    } else {
      const zoomIndex = _.indexOf( zoomButtonOptions, zoomTextValue );
      zoom.value = withSpring( zoomButtonValues[zoomIndex + 1] );
      setZoomTextValue( zoomButtonOptions[zoomIndex + 1] );
    }
  };

  const onZoomStart = useCallback( ( ) => {
    // start pinch-to-zoom
    startZoom.value = zoom.value;
  }, [
    startZoom,
    zoom.value
  ] );

  const resetZoom = () => {
    zoom.value = initialZoom;
    setZoomTextValue( initialZoomTextValue );
  };

  const onZoomChange = useCallback( scale => {
    // Calculate new zoom value from pinch to zoom (since scale factor is relative to initial pinch)
    const newScale = interpolate(
      scale,
      [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
      [-1, 0, 1],
      Extrapolate.CLAMP
    );
    const newZoom = interpolate(
      newScale,
      [-1, 0, 1],
      [minZoom, startZoom.value, maxZoomWithPinch],
      Extrapolate.CLAMP
    );
    zoom.value = newZoom;

    const closestZoomTextValue = zoomButtonOptions.reduce(
      ( prev, curr ) => {
        if ( newZoom === minZoom ) {
          return zoomButtonOptions[0];
        }
        return (
          Math.abs( curr - newZoom ) < Math.abs( prev - newZoom )
            ? curr
            : prev );
      }
    );
    setZoomTextValue( closestZoomTextValue );
  }, [
    maxZoomWithPinch,
    minZoom,
    startZoom.value,
    zoom
  ] );

  const animatedProps = useAnimatedProps < CameraProps >(
    () => ( { zoom: zoom.value } ),
    [zoom]
  );

  const pinchToZoom = useMemo( ( ) => Gesture.Pinch( )
    .runOnJS( true )
    .onStart( ( ) => {
      onZoomStart( );
    } ).onChange( ( e: GestureResponderEvent ) => {
      onZoomChange( e.scale );
    } ), [
    onZoomChange,
    onZoomStart
  ] );

  return {
    animatedProps,
    handleZoomButtonPress,
    pinchToZoom,
    resetZoom,
    showZoomButton: device?.isMultiCam,
    zoomTextValue
  };
};

export default useZoom;

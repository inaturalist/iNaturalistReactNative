// @flow

import {
  useCallback,
  useMemo,
  useState
} from "react";
import {
  Gesture
} from "react-native-gesture-handler";
import {
  Extrapolate,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withSpring
} from "react-native-reanimated";

// This is taken from react-native-vision library itself: https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/Constants.ts#L19 https://github.com/mrousavy/react-native-vision-camera/blob/9eed89aac6155eba155595f3e006707152550d0d/package/example/src/CameraPage.tsx#L34
// The maximum zoom factor you should be able to zoom in
const MAX_ZOOM_FACTOR = 20;
// Used for calculating the final zoom by pinch gesture
const SCALE_FULL_ZOOM = 3;

const useZoom = ( device: Object ): Object => {
  const initialZoom = !device.isMultiCam
    ? device.minZoom
    : device.neutralZoom;
  const zoom = useSharedValue( initialZoom );
  const startZoom = useSharedValue( initialZoom );
  const [zoomTextValue, setZoomTextValue] = useState( "1" );

  const { minZoom } = device;
  const maxZoom = Math.min( device.maxZoom ?? 1, MAX_ZOOM_FACTOR );

  const changeZoom = ( ) => {
    const currentZoomValue = zoomTextValue;
    if ( currentZoomValue === "1" ) {
      zoom.value = withSpring( maxZoom );
      setZoomTextValue( "3" );
    } else if ( currentZoomValue === "3" ) {
      zoom.value = withSpring( minZoom );
      setZoomTextValue( ".5" );
    } else {
      zoom.value = withSpring( device.neutralZoom );
      setZoomTextValue( "1" );
    }
  };

  const onZoomStart = useCallback( ( ) => {
    startZoom.value = zoom.value;
  }, [
    startZoom,
    zoom.value
  ] );

  const resetZoom = () => {
    zoom.value = initialZoom;
  };

  const onZoomChange = useCallback( scale => {
    // Calculate new zoom value (since scale factor is relative to initial pinch)
    const newScale = interpolate(
      scale,
      [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM],
      [-1, 0, 1],
      Extrapolate.CLAMP
    );
    const newZoom = interpolate(
      newScale,
      [-1, 0, 1],
      [minZoom, startZoom.value, maxZoom],
      Extrapolate.CLAMP
    );
    zoom.value = newZoom;
  }, [
    maxZoom,
    minZoom,
    startZoom.value,
    zoom
  ] );

  const animatedProps = useAnimatedProps(
    () => ( { zoom: zoom.value } ),
    [zoom]
  );

  const pinchToZoom = useMemo( ( ) => Gesture.Pinch( )
    .runOnJS( true )
    .onStart( _ => {
      onZoomStart?.();
    } ).onChange( e => {
      onZoomChange?.( e.scale );
    } ), [
    onZoomChange,
    onZoomStart
  ] );

  return {
    animatedProps,
    changeZoom,
    onZoomChange,
    onZoomStart,
    pinchToZoom,
    resetZoom,
    showZoomButton: device.isMultiCam,
    zoomTextValue
  };
};

export default useZoom;

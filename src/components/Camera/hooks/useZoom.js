// @flow

import {
  useState
} from "react";
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

const useZoom = ( device: any ): any => {
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

  const onZoomStart = () => {
    startZoom.value = zoom.value;
  };

  const resetZoom = () => {
    zoom.value = initialZoom;
  };

  const onZoomChange = scale => {
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
  };

  const animatedProps = useAnimatedProps(
    () => ( { zoom: zoom.value } ),
    [zoom]
  );

  return {
    animatedProps,
    changeZoom,
    onZoomChange,
    onZoomStart,
    showZoomButton: device.isMultiCam,
    zoomTextValue,
    resetZoom
  };
};

export default useZoom;

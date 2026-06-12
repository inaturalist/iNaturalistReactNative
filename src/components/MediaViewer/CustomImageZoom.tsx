// eslint-disable-next-line import/no-extraneous-dependencies
import type { ZoomableRef } from "@likashefqet/react-native-image-zoom";
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import React, {
  useEffect,
  useMemo,
  useRef,
} from "react";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation";

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

interface Props {
  uri: string;
  setZooming: ( ) => void;
  selectedMediaIndex: number;
}

const CustomImageZoom = ( {
  uri,
  setZooming,
  selectedMediaIndex,
}: Props ) => {
  const { screenWidth, screenHeight } = useDeviceOrientation( );
  const imageZoomRef = useRef<ZoomableRef>( null );

  const style = useMemo( ( ) => ( {
    height: screenHeight,
    width: screenWidth,
  } ), [screenHeight, screenWidth] );

  useEffect( () => {
    if ( imageZoomRef?.current ) {
      // Reset zoom when image uri changes. This supports tapping a thumbnail
      // but not scrolling left/right since we want the user to be able to pan
      // and drag a zoomed in photo
      imageZoomRef?.current?.reset( );
    }
  }, [selectedMediaIndex] );

  return (
    <ImageZoom
      ref={imageZoomRef}
      testID={`CustomImageZoom.${uri}`}
      uri={uri}
      style={style}
      minScale={MIN_SCALE}
      maxScale={MAX_SCALE}
      isDoubleTapEnabled // we need this so image doesn't snap back to original size on pan/zoom
      onInteractionStart={( ) => setZooming( true )}
      onInteractionEnd={( ) => setZooming( false )}
    />
  );
};

export default CustomImageZoom;

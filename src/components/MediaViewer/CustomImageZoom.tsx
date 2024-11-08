// eslint-disable-next-line import/no-extraneous-dependencies
import { ImageZoom } from "@likashefqet/react-native-image-zoom";
import type { Node } from "react";
import React, {
  useMemo,
  useRef
} from "react";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";

const MIN_SCALE = 0.5;
const MAX_SCALE = 5;

interface Props {
  uri: string
  setZooming: ( ) => void
}

const CustomImageZoom = ( { uri, setZooming }: Props ): Node => {
  const imageZoomRef = useRef( );
  const { screenWidth, screenHeight } = useDeviceOrientation( );

  const style = useMemo( ( ) => ( {
    height: screenHeight,
    width: screenWidth
  } ), [screenHeight, screenWidth] );

  return (
    <ImageZoom
      ref={imageZoomRef}
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

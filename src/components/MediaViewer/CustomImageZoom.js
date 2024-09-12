// @flow

import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";
import { Image as RNImage } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";

type Props = {
  // Height of the container
  height: number,
  imageUri: string,
  // Function to tell the parent whether zooming is enabled, useful to disable
  // scrolling
  setZooming?: Function,
  zoomDisabled?: boolean
}

const CustomImageZoom = ( {
  height,
  imageUri,
  setZooming,
  zoomDisabled = false
}: Props ): Node => {
  const [photoDimensions, setPhotoDimensions] = useState( {
    width: 0,
    height: 0
  } );
  const {
    isLandscapeMode,
    isTablet,
    screenWidth,
    screenHeight
  } = useDeviceOrientation( );
  const usableScreenWidth = !isTablet && isLandscapeMode
    ? screenHeight
    : screenWidth;
  const aspectRatio = photoDimensions.width / photoDimensions.height;
  const imageHeight = Math.min( height, photoDimensions.height * aspectRatio );
  const imageWidth = Math.min(
    usableScreenWidth,
    ( imageHeight / photoDimensions.height ) * photoDimensions.width
  );

  const handleMove = useCallback( ( { scale } ) => {
    if ( !setZooming ) return;
    if ( scale > 1 ) {
      setZooming( true );
    } else {
      setZooming( false );
    }
  }, [setZooming] );

  useEffect( ( ) => {
    RNImage.getSize( imageUri, ( w, h ) => {
      setPhotoDimensions( {
        height: h,
        width: w
      } );
    } );
  }, [imageUri] );

  const source = useMemo( ( ) => ( { uri: imageUri } ), [imageUri] );

  return (
    <ImageZoom
      cropWidth={usableScreenWidth}
      cropHeight={height}
      imageWidth={imageWidth || usableScreenWidth}
      imageHeight={
        photoDimensions.width < photoDimensions.height
          ? height
          : ( imageHeight || height )
      }
      minScale={1}
      onMove={handleMove}
      pinchToZoom={!zoomDisabled}
    >
      <View
        testID="CustomImageZoom"
      >
        <Image
          testID={`CustomImageZoom.${imageUri}`}
          source={source}
          resizeMode="contain"
          className="w-full h-full"
          accessibilityIgnoresInvertColors
        />
      </View>
    </ImageZoom>
  );
};

export default CustomImageZoom;

// @flow

import classnames from "classnames";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";

// lifted from this issue: https://github.com/ascoders/react-native-image-zoom/issues/42#issuecomment-734209924

type Props = {
  source: Object
}

const CustomImageZoom = ( { source }: Props ): Node => {
  const scaleValue = useRef( 1 );
  const [photoDimensions, setPhotoDimensions] = useState( {
    width: 0,
    height: 0
  } );

  const { width, height } = Dimensions.get( "screen" );
  const aspectRatio = photoDimensions.width / photoDimensions.height;
  const SELECTED_IMAGE_HEIGHT = Math.min( photoDimensions.height * aspectRatio, height ) - 150;

  const handleMove = ( { scale } ) => {
    scaleValue.current = scale;
  };

  useEffect( ( ) => {
    Image.getSize( source.uri, ( w, h ) => {
      setPhotoDimensions( {
        height: h,
        width: w
      } );
    } );
  }, [source] );

  if ( !photoDimensions.width ) {
    return null;
  }

  return (
    <ImageZoom
      cropWidth={width}
      cropHeight={SELECTED_IMAGE_HEIGHT}
      imageWidth={width}
      imageHeight={SELECTED_IMAGE_HEIGHT}
      minScale={1}
      onStartShouldSetPanResponder={e => {
        const pinching = e.nativeEvent.touches.length === 2;
        const alreadyZooming = scaleValue.current > 1;
        return pinching || alreadyZooming;
      }}
      onMove={handleMove}
    >
      <View
        onStartShouldSetResponder={
          e => e.nativeEvent.touches.length < 2 && scaleValue.current <= 1
        }
        testID="CustomImageZoom"
      >
        {/* $FlowIgnore */}
        <Image
          testID={`CustomImageZoom.${source.uri}`}
          source={source}
          resizeMode="contain"
          className={classnames(
            "w-full h-full"
          )}
          accessibilityIgnoresInvertColors
        />
      </View>
    </ImageZoom>
  );
};

export default CustomImageZoom;

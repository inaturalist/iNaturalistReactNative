// @flow

import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useRef } from "react";
import { Dimensions } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";

// lifted from this issue: https://github.com/ascoders/react-native-image-zoom/issues/42#issuecomment-734209924

const { width, height } = Dimensions.get( "screen" );
// $FlowIgnore
const SELECTED_IMAGE_HEIGHT = height - 350;

type Props = {
  source: Object
}

const ImageViewer = ( { source }: Props ): Node => {
  const scaleValue = useRef( 1 );

  const handleMove = ( { scale } ) => {
    scaleValue.current = scale;
  };

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
        className="w-full h-full"
        onStartShouldSetResponder={e => e.nativeEvent.touches.length < 2 && scaleValue.current <= 1}
      >
        <Image
          source={source}
          className="w-full h-full"
        />
      </View>
    </ImageZoom>
  );
};

export default ImageViewer;

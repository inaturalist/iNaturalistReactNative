// @flow

import type { Node } from "react";
import React, { useRef } from "react";
import { Dimensions, Image, View } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { imageStyles, viewStyles } from "styles/mediaViewer/mediaViewer";

// lifted from this issue: https://github.com/ascoders/react-native-image-zoom/issues/42#issuecomment-734209924

const { width } = Dimensions.get( "screen" );
// $FlowIgnore
const selectedImageHeight = imageStyles.selectedPhoto.height;

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
      cropHeight={selectedImageHeight}
      imageWidth={width}
      imageHeight={selectedImageHeight}
      minScale={1}
      onStartShouldSetPanResponder={e => {
        const pinching = e.nativeEvent.touches.length === 2;
        const alreadyZooming = scaleValue.current > 1;
        return pinching || alreadyZooming;
      }}
      onMove={handleMove}
    >
      <View
        style={viewStyles.fullSize}
        onStartShouldSetResponder={e => e.nativeEvent.touches.length < 2 && scaleValue.current <= 1}
      >
        <Image
          source={source}
          style={imageStyles.fullSize}
        />
      </View>
    </ImageZoom>
  );
};

export default ImageViewer;

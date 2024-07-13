// This assumes that its contents are not rotated correctly on an iPad... for
// whatever reason, and rotates them using a CSS transform and some munging
// of the position. This is very much a kludge. It would be far preferrable
// to fix whatever is causing the incorrect rotation. Originally a workaround
// for https://github.com/mrousavy/react-native-vision-camera/issues/1891
import { View } from "components/styledComponents";
import React, { useRef, useState } from "react";
import { iPadStylePatch } from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";

const VeryBadIpadRotator = ( { children } ) => {
  const [dims, setDims] = useState( {} );
  const { deviceOrientation } = useDeviceOrientation();
  const containerRef = useRef( );

  const innerStyle = iPadStylePatch( deviceOrientation );
  innerStyle.flex = 1;
  // courtesy of
  // https://github.com/mrousavy/react-native-vision-camera/issues/1891#issuecomment-1746222690
  if (
    innerStyle.transform
    && dims.width
    && dims.height
  ) {
    innerStyle.position = "absolute";
    innerStyle.width = dims.height;
    innerStyle.height = dims.width;
    innerStyle.left = dims.width / 2 - dims.height / 2;
    innerStyle.top = dims.height / 2 - dims.width / 2;
  }
  return (
    <View
      ref={containerRef}
      className="relative flex-1"
      onLayout={
        // The outer container is essentially the layout as originally
        // intended, and the inner view is the one that gets rotated and
        // repositioned
        ( ) => containerRef?.current?.measure(
          ( x, y, w, h, pageX, pageY ) => setDims( {
            x,
            y,
            width: w,
            height: h,
            pageX,
            pageY
          } )
        )
      }
    >
      <View style={innerStyle}>
        {children}
      </View>
    </View>
  );
};

export default VeryBadIpadRotator;

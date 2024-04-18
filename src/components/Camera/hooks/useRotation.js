// @flow

import {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation";

const useRotation = ( ): object => {
  const { deviceOrientation } = useDeviceOrientation( );

  const rotation = useSharedValue( 0 );
  switch ( deviceOrientation ) {
    case LANDSCAPE_LEFT:
      rotation.value = -90;
      break;
    case LANDSCAPE_RIGHT:
      rotation.value = 90;
      break;
    case PORTRAIT_UPSIDE_DOWN:
      rotation.value = 180;
      break;
    default:
      rotation.value = 0;
  }
  const rotatableAnimatedStyle = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: withTiming( `${-1 * ( rotation?.value || 0 )}deg` )
        }
      ]
    } ),
    [rotation.value]
  );

  return {
    rotatableAnimatedStyle,
    rotation
  };
};

export default useRotation;

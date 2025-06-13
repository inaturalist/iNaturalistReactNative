import {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import useDeviceOrientation, {
  LANDSCAPE_LEFT,
  LANDSCAPE_RIGHT,
  PORTRAIT_UPSIDE_DOWN
} from "sharedHooks/useDeviceOrientation.ts";

const rotationValue = ( deviceOrientation: string | undefined ) => {
  switch ( deviceOrientation ) {
    case LANDSCAPE_LEFT:
      return -90;
    case LANDSCAPE_RIGHT:
      return 90;
    case PORTRAIT_UPSIDE_DOWN:
      return 180;
    default:
      return 0;
  }
};

const useRotation = ( ) => {
  const { deviceOrientation } = useDeviceOrientation( );

  const rotation = useSharedValue( 0 );
  rotation.value = rotationValue( deviceOrientation );

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

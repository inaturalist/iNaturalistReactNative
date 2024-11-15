import {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { rotationValue } from "sharedHelpers/visionCameraPatches";
import useDeviceOrientation from "sharedHooks/useDeviceOrientation.ts";

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

import { ActivityIndicator } from "components/SharedComponents";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import colors from "styles/tailwindColors";

interface Props {
  takingPhoto: boolean;
  cameraType: string;
}

const FadeInOutView = ( { takingPhoto, cameraType }: Props ) => {
  const opacity = useSharedValue( 0 );

  useEffect( ( ) => {
    if ( takingPhoto ) {
      opacity.set(
        withSequence(
          withTiming( 1, { duration: 100 } ),
          withTiming( 0, { duration: 100 } ),
        ),
      );
    }
  }, [opacity, takingPhoto] );

  const animatedStyle = useAnimatedStyle( () => ( {
    opacity: opacity.value,
  } ) );

  return (
    <>
      <Animated.View
        pointerEvents="none"
        className="items-center justify-center bg-black absolute h-full w-full"
        style={animatedStyle}
      />
      {( takingPhoto && cameraType === "AI" ) && (
        <ActivityIndicator
          size={50}
          color={colors.white}
        />
      )}
    </>
  );
};

export default FadeInOutView;

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

// Inline style instead of className: reanimated's Animated.View isn't
// registered with nativewind 4, so className has no effect on it
const OVERLAY_STYLE = {
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.black,
  position: "absolute",
  height: "100%",
  width: "100%",
} as const;

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
        style={[OVERLAY_STYLE, animatedStyle]}
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

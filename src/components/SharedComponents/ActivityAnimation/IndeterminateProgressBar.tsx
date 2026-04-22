import React, { useEffect, useMemo } from "react";
import { Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get( "screen" );

const HEIGHT = 4;
const PROGRESS_WIDTH = width / 2;
const DURATION = 1200;

interface IndeterminateProgressBarProps {
  color?: string;
}

const IndeterminateProgressBar = ( {
  color,
}: IndeterminateProgressBarProps ) => {
  const translateX = useSharedValue( -PROGRESS_WIDTH );

  const { foregroundColor } = useMemo( () => ( {
    foregroundColor: color,
  } ), [color] );

  useEffect( () => {
    // withRepeat to repeat the animation
    translateX.set( withRepeat(
      // withDelay to add a delay to our animation
      withDelay(
        DURATION / 2,
        withTiming( width, {
          duration: DURATION,
        } ),
      ),
      // Set number of repetitions to -1 to loop indefinitely
      -1,
    ) );
  }, [translateX] );

  const progress = useAnimatedStyle( () => ( {
    width: PROGRESS_WIDTH,
    height: HEIGHT,
    transform: [{ translateX: translateX.get( ) }],
  } ) );

  return (
    <Animated.View style={[progress, { backgroundColor: foregroundColor }]} />
  );
};

export default IndeterminateProgressBar;

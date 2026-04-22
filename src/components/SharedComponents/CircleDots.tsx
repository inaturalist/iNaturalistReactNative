import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { PropsWithChildren } from "react";
import React, { useCallback, useEffect } from "react";
import Reanimated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import colors from "styles/tailwindColors";

interface Props extends PropsWithChildren {
  animated?: boolean;
  className?: string;
  color?: string;
}

const AnimatedView = Reanimated.createAnimatedComponent( View );

const CircleDots = ( {
  animated,
  children,
  className,
  color = String( colors?.darkGray || "black" ),
}: Props ) => {
  const animation = useSharedValue( 0 );
  const rotation = useDerivedValue( ( ) => interpolate(
    animation.get( ),
    [0, 1],
    [0, 360],
  ) );
  const rotate = useAnimatedStyle( ( ) => ( {
    transform: [
      {
        rotateZ: `${rotation.get( )}deg`,
      },
    ],
  } ) );

  const startAnimation = useCallback( ( ) => {
    animation.set( withRepeat(
      withTiming( 1, {
        duration: 10000,
        easing: Easing.linear,
      } ),
      -1,
    ) );
  }, [animation] );

  const stopAnimation = useCallback( ( ) => {
    animation.set( 0 );
  }, [animation] );

  useEffect( ( ) => {
    if ( animated ) {
      startAnimation( );
    } else {
      stopAnimation( );
    }
  }, [animated, startAnimation, stopAnimation] );

  return (
    <View className={`${className} justify-center items-center`}>
      <View className="absolute">
        { children }
      </View>
      <AnimatedView style={rotate} testID="UploadStatus.QueuedRotatingIcon">
        <INatIcon name="circle-dots" color={color} size={33} />
      </AnimatedView>
    </View>
  );
};

export default CircleDots;

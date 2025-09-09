// @flow

import {
  INatIconButton
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from "react-native-reanimated";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel: string,
  backgroundColor?: string,
  // $FlowIgnore
  children?: unknown,
  color?: string,
  disabled?: boolean,
  height?: number,
  icon: string,
  mode?: "contained",
  onPress: Function,
  rotating?: boolean,
  size?: number,
  style?: Object,
  testID?: string,
  width?: number,
}

const RotatingINatIconButton = ( {
  accessibilityHint,
  accessibilityLabel,
  backgroundColor,
  children,
  color,
  disabled,
  height,
  icon,
  mode,
  onPress,
  rotating,
  size,
  style,
  testID,
  width
}: Props ): Node => {
  const rotation = useSharedValue( 0 );
  // eslint-disable-next-line no-unused-vars
  const [_, setNeedsReRender] = useState( false );

  const animatedStyles = useAnimatedStyle(
    () => ( {
      transform: [
        {
          rotateZ: `${rotation.get( )}deg`
        }
      ]
    } )
  );

  const getRotationAnimation = toValue => withDelay(
    500,
    withTiming( toValue, {
      duration: 1000,
      easing: Easing.linear
    } )
  );

  useEffect( () => {
    const cleanup = () => {
      cancelAnimation( rotation );
      rotation.set( 0 );
      // Trigger one more render to ensure the rotation gets reset to 0
      setNeedsReRender( true );
    };

    if ( rotating ) {
      rotation.set( withRepeat(
        withSequence(
          getRotationAnimation( 180 ),
          getRotationAnimation( 360 ),
          withTiming( 0, { duration: 0 } )
        ),
        -1
      ) );
    } else {
      cleanup();
    }

    return cleanup;
  }, [rotating, rotation] );

  return (
    <Animated.View
      style={animatedStyles}
    >
      <INatIconButton
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        backgroundColor={backgroundColor}
        color={color}
        disabled={disabled}
        height={height}
        icon={icon}
        mode={mode}
        onPress={onPress}
        rotating={rotating}
        size={size}
        style={style}
        testID={testID}
        width={width}
      >
        { children }
      </INatIconButton>
    </Animated.View>
  );
};

export default RotatingINatIconButton;

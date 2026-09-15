import classnames from "classnames";
import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable } from "components/styledComponents";
import React, { useCallback, useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import colors from "styles/tailwindColors";

const FADE_IN_DURATION = 200;
const VISIBLE_DURATION = 2000;
const FADE_OUT_DURATION = 200;

interface Props {
  icon?: string;
  onHide: ( ) => void;
  testID?: string;
  text: string;
  variant?: "light" | "dark";
  wrapperClassName?: string;
}

const Toast = ( {
  icon, onHide, testID, text, variant = "light", wrapperClassName,
}: Props ) => {
  const opacity = useSharedValue( 0 );
  const animatedStyle = useAnimatedStyle( ( ) => ( { opacity: opacity.get( ) } ) );
  const onHideRef = useRef( onHide );

  useEffect( ( ) => {
    onHideRef.current = onHide;
  }, [onHide] );

  const handleHide = useCallback( ( ) => onHideRef.current( ), [] );

  useEffect( ( ) => {
    AccessibilityInfo.announceForAccessibility( text );
    opacity.set(
      withSequence(
        withTiming( 1, { duration: FADE_IN_DURATION } ),
        withDelay(
          VISIBLE_DURATION,
          withTiming( 0, { duration: FADE_OUT_DURATION }, finished => {
            if ( finished ) {
              scheduleOnRN( handleHide );
            }
          } ),
        ),
      ),
    );
  }, [handleHide, opacity, text] );

  const isDark = variant === "dark";
  const containerClassName = classnames(
    "flex-row self-center items-center gap-2 rounded-lg p-2",
    isDark
      ? "bg-darkGray/50"
      : "bg-white max-w-[220px]",
    wrapperClassName,
  );
  const textClassName = isDark
    ? "text-white"
    : "text-darkGray text-center";

  // inline style for opacity instead of className: Animated.View doesn't like className
  return (
    <Animated.View pointerEvents="box-none" style={animatedStyle}>
      <Pressable
        accessibilityLabel={text}
        accessibilityRole="button"
        className={containerClassName}
        onPress={onHide}
        testID={testID}
      >
        {icon && (
          <INatIcon
            name={icon}
            size={19}
            color={isDark
              ? colors.white
              : colors.darkGray}
          />
        )}
        <Body1 className={textClassName}>{text}</Body1>
      </Pressable>
    </Animated.View>
  );
};

export default Toast;

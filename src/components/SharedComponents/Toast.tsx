import classnames from "classnames";
import INatIcon from "components/SharedComponents/INatIcon";
import Body1 from "components/SharedComponents/Typography/Body1";
import { Pressable, View } from "components/styledComponents";
import React, { useCallback, useEffect, useRef } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, {
  cancelAnimation,
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
  onPress?: ( ) => void;
  testID?: string;
  text: string;
  variant?: "light" | "dark";
  wrapperClassName?: string;
}

const Toast = ( {
  icon, onHide, onPress, testID, text, variant = "light", wrapperClassName,
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

    return ( ) => cancelAnimation( opacity );
  }, [handleHide, opacity, text] );

  const isDark = variant === "dark";
  const containerClassName = classnames(
    "flex-row self-center items-center rounded-lg",
    isDark
      ? "bg-darkGray/50 p-2"
      : "bg-white px-[10px] py-[7px] max-w-[220px]",
    wrapperClassName,
  );
  const textClassName = classnames(
    isDark
      ? "text-white"
      : "text-darkGray text-center",
    icon && "ml-2",
  );
  const content = (
    <>
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
    </>
  );

  // inline style for opacity instead of className: Animated.View doesn't like className
  return (
    <Animated.View pointerEvents="box-none" style={animatedStyle}>
      {onPress
        ? (
          <Pressable
            accessibilityLabel={text}
            accessibilityRole="button"
            className={containerClassName}
            onPress={onPress}
            testID={testID}
          >
            {content}
          </Pressable>
        )
        : (
          <View className={containerClassName} testID={testID}>
            {content}
          </View>
        )}
    </Animated.View>
  );
};

export default Toast;

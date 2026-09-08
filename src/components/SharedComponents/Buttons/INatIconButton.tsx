import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import { getCurrentRoute } from "navigation/navigationUtils";
import type { PropsWithChildren } from "react";
import React from "react";
import type {
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import {
  Platform,
  Pressable,
} from "react-native";
import { log } from "sharedHelpers/logger";
import colors from "styles/tailwindColors";
import { twMerge } from "tailwind-merge";

const logger = log.extend( "INatIconButton" );

interface Props extends PropsWithChildren {
  accessibilityHint?: string;
  accessibilityLabel: string;
  className?: string;
  color?: string;
  disabled?: boolean;
  height?: number;
  icon?: string;
  // Only show the icon with all the same layout, don't make it a button
  iconOnly?: boolean;
  onPress: ( _event: GestureResponderEvent ) => void;
  // Inserts a white or colored view under the icon so an holes in the shape show as
  // white
  preventTransparency?: boolean;
  size?: number;
  style?: ViewStyle;
  testID?: string;
  width?: number;
  backgroundColor?: string;
  mode?: "contained";
}

const MIN_ACCESSIBLE_DIM = 44;

// w-11/h-11 = 2.75rem = 44px (MIN_ACCESSIBLE_DIM), expressed as a class rather
// than an inline style so a caller's own w-/h- className can override it via
// twMerge instead of being unconditionally beaten by an inline style
const DEFAULT_DIM_CLASSES = "w-11 h-11";

const WRAPPER_STYLE: ViewStyle = {
  alignItems: "center",
  justifyContent: "center",
};

const CONTAINED_WRAPPER_STYLE: ViewStyle = {
  borderRadius: 9999,
};

// Similar to IconButton in react-native-paper, except this allows independent
// control over touchable area with `width` and `height` *and* the size of
// the icon with `size`
const INatIconButton = ( {
  accessibilityHint,
  accessibilityLabel,
  children,
  className,
  color,
  disabled = false,
  height,
  icon,
  iconOnly,
  onPress,
  preventTransparency,
  size = 18,
  style,
  testID,
  width,
  backgroundColor,
  mode,
}: Props ) => {
  // Only validated when explicitly passed: omitting width/height means the
  // caller is sizing this button via className (falling back to
  // DEFAULT_DIM_CLASSES below), which we can't statically check here.
  if ( width !== undefined && width < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Width cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`,
    );
  }
  if ( height !== undefined && height < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Height cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`,
    );
  }
  if ( !accessibilityLabel && !iconOnly ) {
    throw new Error(
      "Button needs an accessibility label",
    );
  }
  // width/height keys are omitted from this object entirely (not merely set
  // to undefined) when the caller doesn't pass them: nativewind merges the
  // resolved className styles into this same style object, and an explicit
  // `width: undefined` key still overwrites that merged-in value the way
  // Object.assign would, whereas an absent key does not. Omitting them lets
  // DEFAULT_DIM_CLASSES (or a caller's own w-/h- className, merged in via
  // twMerge below) take effect instead.
  const wrapperStyle = React.useMemo( ( ) => ( [
    {
      ...( width !== undefined && { width } ),
      ...( height !== undefined && { height } ),
    },
    WRAPPER_STYLE,
    mode === "contained" && {
      backgroundColor: preventTransparency
        ? undefined
        : backgroundColor,
      ...CONTAINED_WRAPPER_STYLE,
    },
    style,
  ] ), [
    backgroundColor,
    height,
    mode,
    preventTransparency,
    style,
    width,
  ] );
  const dimClassName = twMerge( DEFAULT_DIM_CLASSES, className );

  const content = (
    <View
      className={classnames(
        "relative",
        // This degree of pixel pushing was meant for a ~22px icon, so it
        // might have to be made relative, but it's barely noticeable for
        // most icons
        Platform.OS === "android"
          ? "top-[0.8px]"
          : "left-[0.2px] top-[0.1px]",
      )}
    >
      { backgroundColor && preventTransparency && (
        <View
          // Position and size need to be dynamic
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            opacity: disabled
              ? 0
              : 1,
            position: "absolute",
            top: preventTransparency
              ? 2
              : -2,
            start: preventTransparency
              ? 2
              : -2,
            width: preventTransparency
              ? size - 4
              : size + 4,
            height: preventTransparency
              ? size - 4
              : size + 4,
            backgroundColor,
            borderRadius: 9999,
          }}
        />
      )}
      {
        children || (
          <INatIcon
            name={icon}
            size={size}
            color={String( color || colors?.darkGray )}
          />
        )
      }
    </View>
  );

  if ( iconOnly ) {
    return (
      <View className={dimClassName} style={wrapperStyle} testID={testID}>
        { content }
      </View>
    );
  }

  const handlePressWithTracking = ( event: GestureResponderEvent ) => {
    if ( testID ) {
      const currentRoute = getCurrentRoute( );
      logger.info( `Button tap: ${testID}-${currentRoute?.name || "undefined"}` );
    }

    if ( onPress ) {
      onPress( event );
    }
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      // nativewind 4 drops function styles on interop'd components, so the
      // pressed/disabled opacity is expressed with classes instead
      className={classnames(
        dimClassName,
        disabled
          ? "opacity-50"
          : "active:opacity-95",
      )}
      disabled={disabled}
      onPress={handlePressWithTracking}
      style={wrapperStyle}
      testID={testID}
    >
      { content }
    </Pressable>
  );
};

export default INatIconButton;

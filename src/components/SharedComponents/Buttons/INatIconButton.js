// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Platform, Pressable } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel: string,
  children?: any,
  color?: string,
  disabled?: boolean,
  height?: number,
  icon: string,
  onPress: Function,
  // Inserts a white or colored view under the icon so an holes in the shape show as
  // white
  preventTransparency?: boolean,
  size?: number,
  style?: Object,
  testID?: string,
  width?: number,
  backgroundColor?: string,
  mode?: "contained"
}

const MIN_ACCESSIBLE_DIM = 44;

// Similar to IconButton in react-native-paper, except this allows independent
// control over touchable area with `width` and `height` *and* the size of
// the icon with `size`
const INatIconButton = ( {
  accessibilityHint,
  accessibilityLabel,
  children,
  color,
  disabled = false,
  height = 44,
  icon,
  onPress,
  preventTransparency,
  size = 18,
  style,
  testID,
  width = 44,
  backgroundColor,
  mode
}: Props ): Node => {
  const theme = useTheme( );
  // width || 0 is to placate flow. width should never be undefined because of
  // the defaultProps, but I guess flow can't figure that out.
  if ( ( width || 0 ) < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Width cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`
    );
  }
  if ( ( height || 0 ) < MIN_ACCESSIBLE_DIM ) {
    throw new Error(
      `Height cannot be less than ${MIN_ACCESSIBLE_DIM}. Use IconButton for smaller buttons.`
    );
  }
  if ( !accessibilityLabel ) {
    throw new Error(
      "Button needs an accessibility label"
    );
  }
  const opacity = pressed => {
    if ( disabled ) {
      return 0.5;
    }
    if ( pressed ) {
      return 0.95;
    }
    return 1;
  };

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={( { pressed } ) => [
        {
          opacity: opacity( pressed ),
          width,
          height,
          justifyContent: "center",
          alignItems: "center"
        },
        mode === "contained" && {
          backgroundColor: preventTransparency
            ? null
            : backgroundColor,
          borderRadius: 9999
        },
        style
      ]}
      testID={testID}
    >
      <View
        className={classnames(
          "relative relative",
          // This degree of pixel pushing was meant for a ~22px icon, so it
          // might have to be made relative, but it's barely noticeable for
          // most icons
          Platform.OS === "android"
            ? "top-[0.8px]"
            : "left-[0.2px] top-[0.1px]"
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
              borderRadius: 9999
            }}
          />
        )}
        {
          children || (
            <INatIcon
              name={icon}
              size={size}
              color={color || theme.colors.primary}
            />
          )
        }
      </View>
    </Pressable>
  );
};

INatIconButton.defaultProps = {
  height: 44,
  size: 18,
  width: 44
};

export default INatIconButton;

// @flow

import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "react-native-paper";
import colors from "styles/tailwindColors";

type Props = {
  accessibilityHint?: string,
  accessibilityLabel: string,
  children?: any,
  color?: string,
  disabled?: boolean,
  height?: number,
  icon: string,
  onPress: Function,
  size?: number,
  style?: Object,
  testID?: string,
  width?: number,
  // Inserts a white or colored view under the icon so an holes in the shape show as
  // white
  backgroundColor?: string,
  mode?: string
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
  size = 18,
  style,
  testID,
  width = 44,
  backgroundColor,
  mode
}: Props ): Node => {
  const theme = useTheme( );
  const isWhite = backgroundColor === colors.white;
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
          // eslint-disable-next-line no-nested-ternary
          opacity: disabled
            ? 0.5
            : pressed
              ? 0.95
              : 1,
          width,
          height,
          justifyContent: "center",
          alignItems: "center"
        },
        mode === "contained" && {
          backgroundColor,
          borderRadius: 9999
        },
        style
      ]}
      testID={testID}
    >
      <View className="relative">
        { backgroundColor && (
          <View
            // Position and size need to be dynamic
            // eslint-disable-next-line react-native/no-inline-styles
            style={{
              position: "absolute",
              top: isWhite
                ? 2
                : -2,
              start: isWhite
                ? 2
                : -2,
              width: isWhite
                ? size - 2
                : size + 4,
              height: isWhite
                ? size - 2
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

// @flow

import { INatIcon } from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { Pressable } from "react-native";
import { useTheme } from "react-native-paper";

type Props = {
  accessibilityLabel?: string,
  color?: string,
  height?: number,
  icon: string,
  onPress: Function,
  size?: number,
  style?: Object,
  testID?: string,
  width?: number,
}

const MIN_ACCESSIBLE_DIM = 44;

// Similar to IconButton in react-native-paper, except this allows independent
// control over touchable area with `width` and `height` *and* the size of
// the icon with `size`
const INatIconButton = ( {
  accessibilityLabel,
  color,
  height,
  icon,
  onPress,
  size,
  style,
  testID,
  width
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
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={( { pressed } ) => [
        {
          opacity: pressed
            ? 0.95
            : 1,
          width,
          height,
          justifyContent: "center",
          alignItems: "center"
        },
        style
      ]}
      testID={testID}
    >
      <INatIcon name={icon} size={size} color={color || theme.colors.primary} />
    </Pressable>
  );
};

INatIconButton.defaultProps = {
  height: 44,
  size: 18,
  width: 44
};

export default INatIconButton;

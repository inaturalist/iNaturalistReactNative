import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import INatIcon from "components/SharedComponents/INatIcon";
import { View } from "components/styledComponents";
import React from "react";
import type { GestureResponderEvent } from "react-native";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityHint?: string;
  accessibilityLabel: string;
  backgroundColor: string;
  disabled?: boolean;
  icon: string;
  iconColor?: string;
  iconSize?: number;
  onPress: ( _event: GestureResponderEvent ) => void;
  testID?: string;
}

// A 40x40 visual icon button on a solid, rounded square background, with the
// 44x44 minimum touch target provided by INatIconButton. Mirrors the circular
// EvidenceButton/TransparentCircleButton wrappers, but rounded-md instead of a
// full circle (which is all `mode="contained"` on INatIconButton can produce).
const ContainedSquareButton = ( {
  accessibilityHint,
  accessibilityLabel,
  backgroundColor,
  disabled,
  icon,
  iconColor = colors.white,
  iconSize = 20,
  onPress,
  testID,
}: Props ) => (
  <INatIconButton
    accessibilityHint={accessibilityHint}
    accessibilityLabel={accessibilityLabel}
    disabled={disabled}
    onPress={onPress}
    testID={testID}
  >
    <View
      className="w-10 h-10 rounded-md items-center justify-center"
      // Background color is caller-driven (often stateful), so it has to be
      // an inline style rather than a static Tailwind class.
      // eslint-disable-next-line react-native/no-inline-styles
      style={{ backgroundColor }}
    >
      <INatIcon name={icon} size={iconSize} color={iconColor} />
    </View>
  </INatIconButton>
);

export default ContainedSquareButton;

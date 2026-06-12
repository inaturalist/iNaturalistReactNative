import INatIconButton from "components/SharedComponents/Buttons/INatIconButton";
import INatIcon from "components/SharedComponents/INatIcon";
import { View } from "components/styledComponents";
import React from "react";
import colors from "styles/tailwindColors";

interface Props {
  accessibilityHint?: string;
  accessibilityLabel: string;
  backgroundColor: string;
  disabled?: boolean;
  icon: string;
  iconColor?: string;
  iconSize?: number;
  onPress: ( ) => void;
  testID?: string;
}

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
      style={{ backgroundColor }}
    >
      <INatIcon name={icon} size={iconSize} color={iconColor} />
    </View>
  </INatIconButton>
);

export default ContainedSquareButton;

// @flow
import * as React from "react";
import { IconButton, useTheme } from "react-native-paper";

type Props = {
  icon: any,
  disabled?: boolean,
  handlePress: any,
  accessibilityLabel: string,
  accessibilityHint?: string
}

const EvidenceButton = ( {
  icon,
  disabled,
  handlePress,
  accessibilityLabel,
  accessibilityHint
}: Props ): React.Node => {
  const theme = useTheme( );
  return (
    <IconButton
      disabled={disabled}
      onPress={handlePress}
      containerColor={theme.colors.secondary}
      iconColor={theme.colors.onSecondary}
      size={35}
      icon={icon}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
};

export default EvidenceButton;

import { INatIconButton } from "components/SharedComponents";
import * as React from "react";
import colors from "styles/tailwindColors";

interface Props {
  icon: string;
  disabled?: boolean;
  handlePress: () => void;
  accessibilityLabel: string;
  accessibilityHint?: string;
}

const EvidenceButton = ( {
  icon,
  disabled,
  handlePress,
  accessibilityLabel,
  accessibilityHint,
}: Props ) => {
  if ( !accessibilityLabel ) {
    throw new Error(
      "EvidenceButton needs an accessibility label",
    );
  }
  return (
    <INatIconButton
      onPress={handlePress}
      backgroundColor={disabled
        ? colors.lightGray
        : colors.inatGreen}
      color={colors.white}
      size={33}
      icon={icon}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      width={60}
      height={60}
      mode="contained"
    />
  );
};

export default EvidenceButton;

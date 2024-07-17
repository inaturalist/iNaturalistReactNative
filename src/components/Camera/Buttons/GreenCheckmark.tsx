import {
  INatIconButton
} from "components/SharedComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  disabled?: boolean;
  handleCheckmarkPress: ( ) => void;
}

const GreenCheckmark = ( {
  disabled,
  handleCheckmarkPress
}: Props ) => {
  const { t } = useTranslation( );

  return (
    <INatIconButton
      onPress={handleCheckmarkPress}
      accessibilityLabel={t( "View-suggestions" )}
      accessibilityHint={t( "Shows-identification-suggestions" )}
      disabled={disabled}
      icon="checkmark-circle"
      color={colors.inatGreen}
      size={40}
      width="100%"
      height="100%"
      backgroundColor={colors.white}
      preventTransparency
    />
  );
};

export default GreenCheckmark;

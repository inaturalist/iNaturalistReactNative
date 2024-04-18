// @flow

import {
  INatIconButton
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  handleCheckmarkPress: ( ) => void
}

const GreenCheckmark = ( {
  handleCheckmarkPress
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <INatIconButton
      onPress={handleCheckmarkPress}
      accessibilityLabel={t( "View-suggestions" )}
      accessibilityHint={t( "Shows-identification-suggestions" )}
      disabled={false}
      icon="checkmark-circle"
      color={colors.inatGreen}
      size={40}
      testID="camera-button-label-switch-camera"
      width="100%"
      height="100%"
      backgroundColor={colors.white}
      preventTransparency
    />
  );
};

export default GreenCheckmark;

// @flow

import {
  INatIconButton
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  navToObsEdit: Function
}

const GreenCheckmark = ( {
  navToObsEdit
}: Props ): Node => {
  const { t } = useTranslation( );

  return (
    <INatIconButton
      onPress={navToObsEdit}
      accessibilityLabel={t( "Navigate-to-observation-edit-screen" )}
      accessibilityRole="button"
      accessibilityState={{ disabled: false }}
      disabled={false}
      icon="checkmark-circle"
      color={colors.inatGreen}
      size={40}
      testID="camera-button-label-switch-camera"
      width="100%"
      height="100%"
      backgroundColor={colors.white}
    />
  );
};

export default GreenCheckmark;

// @flow

import {
  TransparentCircleButton
} from "components/SharedComponents";
import type { Node } from "react";
import React from "react";
import { Alert } from "react-native";
import useTranslation from "sharedHooks/useTranslation";
import colors from "styles/tailwindColors";

type Props = {
  attribution?: string,
  licenseCode?: string,
  optionalClasses?: string
};

const AttributionButton = ( {
  attribution,
  licenseCode,
  optionalClasses
}: Props ): Node => {
  const { t } = useTranslation( );
  const usableAttribution = attribution || t( "all-rights-reserved" );
  return (
    <TransparentCircleButton
      testID="AttributionButton"
      onPress={( ) => Alert.alert( t( "Copyright" ), usableAttribution )}
      icon={
        licenseCode?.match( /^cc/ )
          ? "creative-commons"
          : "copyright"
      }
      color={colors.white}
      accessibilityLabel={usableAttribution}
      optionalClasses={optionalClasses}
    />
  );
};

export default AttributionButton;

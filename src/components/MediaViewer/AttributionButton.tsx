import {
  TransparentCircleButton
} from "components/SharedComponents";
import React from "react";
import { Alert } from "react-native";
import useTranslation from "sharedHooks/useTranslation.ts";
import colors from "styles/tailwindColors";

interface Props {
  attribution?: string;
  licenseCode?: string;
  optionalClasses?: string;
}

const AttributionButton = ( {
  attribution,
  licenseCode,
  optionalClasses
}: Props ) => {
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

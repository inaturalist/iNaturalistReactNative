import { INatIcon } from "components/SharedComponents";
import { View } from "components/styledComponents";
import React from "react";
import { useTranslation } from "sharedHooks";
import colors from "styles/tailwindColors";

interface Props {
  passed: boolean;
}

const RuleStatusIcon = ( { passed }: Props ) => {
  const { t } = useTranslation( );
  const accessibilityLabel = passed
    ? t( "Passed" )
    : t( "Failed" );

  return (
    <View accessible accessibilityLabel={accessibilityLabel}>
      <INatIcon
        name={passed
          ? "checkmark-circle"
          : "triangle-exclamation"}
        color={passed
          ? colors.inatGreen
          : colors.warningRed}
        size={19}
      />
    </View>
  );
};

export default RuleStatusIcon;

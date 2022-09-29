// @flow

import * as React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { textStyles, viewStyles } from "styles/sharedComponents/qualityBadge";

type Props = {
  qualityGrade: ?string,
}

const QualityBadge = ( { qualityGrade }: Props ): React.Node => {
  const { t } = useTranslation( );

  return (
    <View style={viewStyles.badgeContainer}>
      <Text
        style={textStyles.badgeText}
      >
        {t( `Quality-Grade-Badge-${qualityGrade ? qualityGrade.replace( "_", "_" ) : ""}` )}
      </Text>
    </View>
  );
};

export default QualityBadge;

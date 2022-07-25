// @flow

import * as React from "react";
import {Text} from "react-native-paper";
import {View} from "react-native";
import {textStyles, viewStyles} from "../../styles/sharedComponents/qualityBadge";
import {useTranslation} from "react-i18next";

type Props = {
  qualityGrade: ?string,
}

const QualityBadge = ( { qualityGrade }: Props ): React.Node => {
  const { t } = useTranslation( );

  return <View style={viewStyles.badgeContainer}>
    <Text style={textStyles.badgeText}>{t( `Quality-Grade-Badge-${qualityGrade ? qualityGrade.replace( "_", "_" ) : ""}` )}</Text>
  </View>;
};

export default QualityBadge;

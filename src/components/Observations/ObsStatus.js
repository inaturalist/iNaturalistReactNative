// @flow

import classnames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  ActivityCount,
  QualityGradeStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

type Props = {
  observation: typeof Observation,
  layout?: "horizontal" | "vertical",
  color?: "string"
};
/* eslint-disable react-native/no-inline-styles */
const ObsStatus = ( { observation, color, layout = "vertical" }: Props ): Node => {
  const { t } = useTranslation();
  const theme = useTheme();
  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
  const margin = layout === "vertical" ? "mb-1" : "mr-1";
  const flexDirection = layout === "vertical" ? "flex-column" : "flex-row";
  const iconColor = color || theme.colors.primary;

  return (
    <View className={classnames( "flex px-2", flexDirection )}>
      <ActivityCount
        marginClass={margin}
        count={observation.identifications?.length}
        icon="cv-sparklylabel"
        color={iconColor}
        accessibilityLabel={t( "Number-of-identifications" )}
        testID="ActivityCount.identificationCount"
      />
      <ActivityCount
        marginClass={margin}
        count={observation.comments?.length}
        color={iconColor}
        accessibilityLabel={t( "Number-of-comments" )}
        testID="ActivityCount.commentCount"
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />
    </View>
  );
};

export default ObsStatus;

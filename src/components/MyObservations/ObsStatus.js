// @flow

import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { ActivityCount, QualityGradeStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  observation: typeof Observation,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string
};
/* eslint-disable react-native/no-inline-styles */
const ObsStatus = ( {
  observation,
  white,
  layout = "vertical",
  classNameMargin
}: Props ): Node => {
  const { t } = useTranslation();
  const theme = useTheme();
  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
  const margin = layout === "vertical" ? "mb-1" : "mr-2";
  const flexDirection = layout === "vertical" ? "flex-column" : "flex-row";
  const iconColor = white ? theme.colors.onPrimary : theme.colors.primary;
  const numIdents = observation.identifications?.length || 0;
  const numComments = observation.comments?.length || 0;

  return (
    <View className={classNames( "flex", flexDirection, classNameMargin )}>
      <ActivityCount
        icon="label"
        classNameMargin={margin}
        count={numIdents}
        white={white}
        accessibilityLabel={t( "x-identifications", { count: numIdents } )}
      />
      <ActivityCount
        icon="comments"
        classNameMargin={margin}
        count={numComments}
        white={white}
        accessibilityLabel={t( "x-comments", { count: numComments } )}
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />
    </View>
  );
};

export default ObsStatus;

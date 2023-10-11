// @flow

import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import {
  CommentsCount,
  IdentificationsCount,
  QualityGradeStatus
} from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

type Props = {
  observation: typeof Observation,
  layout?: "horizontal" | "vertical",
  white?: boolean,
  classNameMargin?: string,
};
/* eslint-disable react-native/no-inline-styles */
const ObsStatus = ( {
  observation,
  white,
  layout = "vertical",
  classNameMargin
}: Props ): Node => {
  const theme = useTheme();
  const qualityGrade = checkCamelAndSnakeCase( observation, "qualityGrade" );
  const margin = layout === "vertical"
    ? "mb-1 ml-1"
    : "mr-2";
  const flexDirection = layout === "vertical"
    ? "flex-column"
    : "flex-row";
  const iconColorResearchCheck = qualityGrade === "research"
    ? theme.colors.secondary
    : theme.colors.primary;
  const iconColor = white
    ? theme.colors.onPrimary
    : iconColorResearchCheck;
  const numIdents = observation.identifications?.length || 0;
  const numComments = observation.comments?.length || 0;
  const identificationsFilled = observation.identifications_viewed === false;
  const commentsFilled = observation.comments_viewed === false;

  return (
    <View className={classNames( "flex", flexDirection, classNameMargin )}>
      <IdentificationsCount
        classNameMargin={margin}
        count={numIdents}
        white={white}
        filled={identificationsFilled}
      />
      <CommentsCount
        classNameMargin={margin}
        count={numComments}
        white={white}
        filled={commentsFilled}
        testID="ObsStatus.commentsCount"
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />
    </View>
  );
};

export default ObsStatus;

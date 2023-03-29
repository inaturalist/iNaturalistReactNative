// @flow

import classNames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { ActivityCount, QualityGradeStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";
import Observation from "realmModels/Observation";

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

  // 03072023 amanda - applying chris' bandaid fix from PR #515: https://github.com/inaturalist/iNaturalistReactNative/pull/515
  // to make sure android devices don't crash on start
  let identificationA11yLabel = "";
  let commentA11yLabel = "";
  try {
    // not exactly sure why this causes a consistent error every time you run android
    // for the first time...
    identificationA11yLabel = t( "x-identifications", { count: numIdents } );
    commentA11yLabel = t( "x-comments", { count: numComments } );
  } catch ( e ) {
    console.warn( e );
  }

  return (
    <View className={classNames( "flex", flexDirection, classNameMargin )}>
      <ActivityCount
        icon="label"
        classNameMargin={margin}
        count={numIdents}
        white={white}
        accessibilityLabel={identificationA11yLabel}
      />
      <ActivityCount
        icon="comments"
        classNameMargin={margin}
        count={numComments}
        white={white}
        accessibilityLabel={commentA11yLabel}
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />
    </View>
  );
};

export default ObsStatus;

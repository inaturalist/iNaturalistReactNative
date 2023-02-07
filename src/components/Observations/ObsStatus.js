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
  item: typeof Observation,
  layout?: "horizontal" | "vertical",
};
/* eslint-disable react-native/no-inline-styles */
const ObsStatus = ( { item, layout = "vertical" }: Props ): Node => {
  const { t } = useTranslation();
  const theme = useTheme();
  const qualityGrade = checkCamelAndSnakeCase( item, "qualityGrade" );

  const getIconColor = () => {
    if ( layout === "horizontal" ) {
      return theme.colors.onSecondary;
    }
    if ( item.viewed === false ) {
      return theme.colors.error;
    }
    return theme.colors.primary;
  };

  const iconColor = getIconColor();
  const margin = layout === "vertical" ? "mb-1" : "mr-1";
  const flexDirection = layout === "vertical" ? "flex-column" : "flex-row";
  return (
    <View className={classnames( "flex px-2", flexDirection )}>
      <ActivityCount
        marginClass={margin}
        count={item.identifications?.length}
        icon="cv-sparklylabel"
        color={iconColor}
        accessibilityLabel={t( "Number-of-identifications" )}
        testID="ActivityCount.identificationCount"
      />
      <ActivityCount
        marginClass={margin}
        count={item.comments?.length}
        color={iconColor}
        accessibilityLabel={t( "Number-of-comments" )}
        testID="ActivityCount.commentCount"
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={iconColor} />
    </View>
  );
};

export default ObsStatus;

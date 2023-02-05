// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { ActivityCount, QualityGradeStatus } from "components/SharedComponents";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";
import classnames from 'classnames'

type Props = {
  item: Object,
  layout?: string
}

const ObsCardStats = ( { item, layout }: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const qualityGrade = checkCamelAndSnakeCase( item, "qualityGrade" );

  const getIconColor = ( ) => {
    if ( layout === "grid" ) {
      return theme.colors.onSecondary;
    }
    if ( item.viewed === false ) {
      return theme.colors.error;
    }
    return theme.colors.primary;
  };

  const margin = layout === "list" ? "mb-2.5" : "mr-2.5"
  const flexDirection = layout === "list" ? "flex-column" : "flex-row"
  return (
    <View className={classnames(
      "flex px-2",
      flexDirection
    )}>
      <ActivityCount
        marginClass={margin}
        count={item.identifications?.length}
        color={getIconColor( )}
        accessibilityLabel={t( "Number-of-identifications" )}
        testID="ActivityCount.identificationCount"
      />
      <ActivityCount
        marginClass={margin}
        count={item.comments?.length}
        color={getIconColor( )}
        accessibilityLabel={t( "Number-of-comments" )}
        testID="ActivityCount.commentCount"
      />
      <QualityGradeStatus qualityGrade={qualityGrade} color={getIconColor( )} />
    </View>
  )

};

export default ObsCardStats;

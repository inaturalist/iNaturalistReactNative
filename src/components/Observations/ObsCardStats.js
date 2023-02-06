// @flow

import classnames from "classnames";
import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { ActivityCount, Body3, QualityGradeStatus } from "components/SharedComponents";
import { Image, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

type Props = {
  item: Object,
  layout?: string
}
/* eslint-disable react-native/no-inline-styles */
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

  const iconColor = getIconColor( );
  const margin = layout === "list" ? "mb-2.5" : "mr-2.5";
  const flexDirection = layout === "list" ? "flex-column" : "flex-row";
  return (
    <View className={classnames(
      "flex px-2",
      flexDirection
    )}
    >
      {
        /*
        @TODO add ic_id icon
        <ActivityCount
          marginClass={margin}
          count={item.identifications?.length}
          color={iconColor}
          accessibilityLabel={t( "Number-of-identifications" )}
          testID="ActivityCount.identificationCount"
        />
        */
      }
      <View className={classnames( margin, "flex flex-row items-center" )}>
        <Image
          style={{ height: 15, width: 15, tintColor: iconColor }}
          source={require( "images/ic_id.png" )}
        />
        <Body3 className="ml-1" style={{ color: iconColor }}>{item.identifications.length}</Body3>
      </View>
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

export default ObsCardStats;

// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import ActivityCount from "components/SharedComponents/ActivityCount";
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus";
import { View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "react-native-paper";

type Props = {
  item: Object,
  type?: string,
  layout?: string
}

const ObsCardStats = ( { item, type, layout }: Props ): Node => {
  const { t } = useTranslation( );
  const theme = useTheme( );
  const qualityGrade = checkCamelAndSnakeCase( item, "qualityGrade" );

  const setIconColor = ( ) => {
    if ( item.viewed === false ) {
      return theme.colors.error;
    } if ( layout === "grid" ) {
      return theme.colors.onPrimary;
    }
    return theme.colors.primary;
  };

  const renderIdRow = ( ) => (
    <ActivityCount
      count={item.identifications?.length}
      color={setIconColor( )}
      accessibilityLabel={t( "Number-of-identifications" )}
      testID="ActivityCount.identificationCount"
    />
  );

  const renderCommentRow = ( ) => (
    <ActivityCount
      count={item.comments?.length}
      color={setIconColor( )}
      accessibilityLabel={t( "Number-of-comments" )}
      testID="ActivityCount.commentCount"
    />
  );

  const renderQualityGrade = ( ) => (
    <QualityGradeStatus qualityGrade={qualityGrade} color={setIconColor( )} />
  );

  const renderColumn = ( ) => (
    <View>
      {renderIdRow( )}
      {renderCommentRow( )}
      {renderQualityGrade( )}
    </View>
  );

  const renderRow = ( ) => (
    <View className="flex-row absolute bottom-1 justify-between w-full px-2">
      <View className="flex-row">
        {renderIdRow( )}
        {renderCommentRow( )}
      </View>
      {renderQualityGrade( )}
    </View>
  );

  return type === "list" ? renderColumn( ) : renderRow( );
};

export default ObsCardStats;

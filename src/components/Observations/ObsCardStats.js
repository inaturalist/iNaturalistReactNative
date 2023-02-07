// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { ActivityCount, QualityGradeStatus } from "components/SharedComponents";
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

  const renderIdRow = ( ) => {
    const numIdents = item.identifications?.length || 0;
    return (
      <ActivityCount
        count={numIdents}
        color={setIconColor( )}
        accessibilityLabel={t( "x-identifications", { count: numIdents } )}
        testID="ActivityCount.identificationCount"
      />
    );
  };

  const renderCommentRow = ( ) => {
    const numComments = item.comments?.length || 0;
    return (
      <ActivityCount
        count={item.comments?.length}
        color={setIconColor( )}
        accessibilityLabel={t( "x-comments", { count: numComments } )}
        testID="ActivityCount.commentCount"
      />
    );
  };

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

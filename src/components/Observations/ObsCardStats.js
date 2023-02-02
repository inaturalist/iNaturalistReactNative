// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import ActivityCount from "components/SharedComponents/ActivityCount";
import QualityGradeStatus from "components/SharedComponents/QualityGradeStatus";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  item: Object,
  type?: string,
  layout?: string
}

const ObsCardStats = ( { item, type, layout }: Props ): Node => {
  const theme = useTheme( );
  const numOfIds = item.identifications?.length || "0";
  const numOfComments = item.comments?.length || "0";
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
    <View className="flex-row items-center mr-3">
      <Icon name="shield" color={setIconColor( )} size={14} />
      <Text className="mx-1" style={{ color: setIconColor( ) }}>{numOfIds}</Text>
    </View>
  );

  const renderCommentRow = ( ) => (
    <ActivityCount numOfComments={numOfComments} color={setIconColor( )} />
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

// @flow

import checkCamelAndSnakeCase from "components/ObsDetails/helpers/checkCamelAndSnakeCase";
import { Text, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  item: Object,
  type?: string,
  view?: string
}

const ObsCardStats = ( { item, type, view }: Props ): Node => {
  const numOfIds = item.identifications?.length || 0;
  const numOfComments = item.comments?.length || 0;
  const qualityGrade = checkCamelAndSnakeCase( item, "qualityGrade" );

  const setIconColor = ( ) => {
    if ( item.viewed === false ) {
      return colors.red;
    }
    if ( view === "grid" ) {
      return colors.white;
    }
    return colors.black;
  };

  const qualityGradeText = {
    needs_id: t( "NI" ),
    research: t( "RG" ),
    casual: t( "C" )
  };

  // console.log( item.viewed, "viewed" );
  const renderIdRow = ( ) => (
    <View className="flex-row items-center mr-3">
      <Icon name="shield" color={setIconColor( )} size={14} />
      <Text className="mx-1" style={{ color: setIconColor( ) }}>{numOfIds || 0}</Text>
    </View>
  );

  const renderCommentRow = ( ) => (
    <View className="flex-row items-center">
      <Icon name="comment" color={setIconColor( )} size={14} />
      <Text
        className="mx-1"
        style={{ color: setIconColor( ) }}
        testID="ObsList.obsCard.commentCount"
      >
        {numOfComments || 0}
      </Text>
    </View>
  );

  const renderQualityGrade = ( ) => (
    <Text style={{ color: setIconColor( ) }}>
      {qualityGrade ? qualityGradeText[qualityGrade] : "?"}
    </Text>
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

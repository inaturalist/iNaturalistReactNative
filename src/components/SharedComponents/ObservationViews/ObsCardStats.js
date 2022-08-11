// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import colors from "../../../styles/colors";
import { textStyles, viewStyles } from "../../../styles/sharedComponents/observationViews/obsCard";
import checkCamelAndSnakeCase from "../../ObsDetails/helpers/checkCamelAndSnakeCase";

type Props = {
  item: Object,
  type?: string
}

const ObsCardStats = ( { item, type }: Props ): Node => {
  const numOfIds = item.identifications?.length || 0;
  const numOfComments = item.comments?.length || 0;
  const qualityGrade = checkCamelAndSnakeCase( item, "qualityGrade" );

  const iconColor = item.viewed === false ? colors.red : colors.black;

  const qualityGradeText = {
    needs_id: t( "NI" ),
    research: t( "RG" ),
    casual: t( "C" )
  };

  const renderIdRow = ( ) => (
    <View style={viewStyles.iconRow}>
      <Icon name="shield" color={iconColor} size={14} style={viewStyles.icon} />
      <Text style={[textStyles.text, { color: iconColor }]}>{numOfIds || 0}</Text>
    </View>
  );

  const renderCommentRow = ( ) => (
    <View style={viewStyles.iconRow}>
      <Icon name="comment" color={iconColor} size={14} style={viewStyles.icon} />
      <Text style={[textStyles.text, { color: iconColor }]} testID="ObsList.obsCard.commentCount">
        {numOfComments || 0}
      </Text>
    </View>
  );

  const renderQualityGrade = ( ) => (
    <Text style={textStyles.text}>
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
    <View style={viewStyles.photoStatRow}>
      {renderIdRow( )}
      {renderCommentRow( )}
      {renderQualityGrade( )}
    </View>
  );

  return type === "list" ? renderColumn( ) : renderRow( );
};

export default ObsCardStats;

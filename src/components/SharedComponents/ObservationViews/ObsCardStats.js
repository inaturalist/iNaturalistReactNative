// @flow

import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";

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

  const renderColumn = ( ) => (
    <View>
      <Text style={textStyles.text}>{numOfIds || "no ids"}</Text>
      <Text style={textStyles.text} testID="ObsList.obsCard.commentCount">
        {numOfComments || 0}
      </Text>
      <Text style={textStyles.text}>{qualityGrade || "no quality grade"}</Text>
    </View>
  );

  const renderRow = ( ) => (
    <View style={viewStyles.photoStatRow}>
      <Text style={textStyles.text}>{numOfIds || "no ids"}</Text>
      <Text style={textStyles.text} testID="ObsList.obsCard.commentCount">
        {numOfComments || 0}
      </Text>
      <Text style={textStyles.text}>{qualityGrade || "no quality grade"}</Text>
    </View>
  );

  return type === "list" ? renderColumn( ) : renderRow( );
};

export default ObsCardStats;

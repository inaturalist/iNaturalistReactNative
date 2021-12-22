// @flow

import React from "react";
import { Pressable, Text, View, Image } from "react-native";
import type { Node } from "react";
import Observation from "../../../models/Observation";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const onPress = ( ) => handlePress( item );

  return (
    <Pressable
      onPress={onPress}
      style={viewStyles.row}
      testID={`ObsList.obsCard.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={Observation.uri( item )}
        style={viewStyles.imageBackground}
        testID="ObsList.photo"
      />
      <View style={viewStyles.obsDetailsColumn}>
        <Text style={textStyles.text}>{item.taxon.preferredCommonName}</Text>
        <Text style={textStyles.text}>{item.placeGuess}</Text>
        <Text style={textStyles.text}>{item.timeObservedAt}</Text>
      </View>
      <View>
        <Text style={textStyles.text}>{item.identifications.length}</Text>
        <Text style={textStyles.text} testID="ObsList.obsCard.commentCount">{item.comments.length}</Text>
        <Text style={textStyles.text}>{item.qualityGrade}</Text>
      </View>
    </Pressable>
  );
};

export default ObsCard;

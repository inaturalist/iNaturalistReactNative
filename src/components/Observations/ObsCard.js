// @flow

import React from "react";
import { Pressable, Text, View, Image } from "react-native";
import type { Node } from "react";

import { viewStyles, textStyles } from "../../styles/observations/obsCard";

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => (
  <Pressable
    onPress={( ) => handlePress( item )}
    style={viewStyles.row}
    testID="ObsList.obsCard"
    accessibilityRole="link"
    accessibilityLabel="Navigate to observation details screen"
  >
    <Image
      source={{ uri: item.photos[0].url }}
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
      <Text style={textStyles.text}>{item.comments.length}</Text>
      <Text style={textStyles.text}>{item.qualityGrade}</Text>
    </View>
  </Pressable>
);

export default ObsCard;

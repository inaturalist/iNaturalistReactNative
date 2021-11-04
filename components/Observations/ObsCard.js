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
  >
    <Image
      source={{ uri: item.userPhoto }}
      style={viewStyles.imageBackground}
      testID="ObsList.photo"
    />
    <View style={viewStyles.obsDetailsColumn}>
      <Text style={textStyles.text}>{item.commonName}</Text>
      <Text style={textStyles.text}>{item.placeGuess}</Text>
      <Text style={textStyles.text}>{item.timeObservedAt}</Text>
    </View>
    <View>
      <Text style={textStyles.text}>{item.identificationCount}</Text>
      <Text style={textStyles.text}>{item.commentCount}</Text>
      <Text style={textStyles.text}>{item.qualityGrade}</Text>
    </View>
  </Pressable>
);

export default ObsCard;

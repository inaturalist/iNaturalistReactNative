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
  // TODO: fix whatever funkiness is preventing realm mapTo from correctly
  // displaying camelcased item keys on ObservationList

  const commonName = item.taxon.preferredCommonName || item.taxon.preferred_common_name;
  const placeGuess = item.placeGuess || item.place_guess;
  const timeObserved = item.timeObservedAt || item.time_observed_at;
  const numOfIds = item.identifications.length;
  const numOfComments = item.comments.length;
  const qualityGrade = item.qualityGrade || item.quality_grade;

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
        {/* TODO: fill in with actual empty states */}
        <Text style={textStyles.text}>{commonName || "no common name"}</Text>
        <Text style={textStyles.text}>{placeGuess || "no place guess"}</Text>
        <Text style={textStyles.text}>{timeObserved || "no time given"}</Text>
      </View>
      <View>
        <Text style={textStyles.text}>{numOfIds || "no ids"}</Text>
        <Text style={textStyles.text} testID="ObsList.obsCard.commentCount">{numOfComments || "no comments"}</Text>
        <Text style={textStyles.text}>{qualityGrade || "no quality grade"}</Text>
      </View>
    </Pressable>
  );
};

export default ObsCard;

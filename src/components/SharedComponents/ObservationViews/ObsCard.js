// @flow

import React from "react";
import { Pressable, View, Image, Text } from "react-native";
import type { Node } from "react";
import Observation from "../../../models/Observation";

import { viewStyles, textStyles } from "../../../styles/sharedComponents/observationViews/obsCard";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function
}

const ObsCard = ( { item, handlePress }: Props ): Node => {
  const onPress = ( ) => handlePress( item );
  const needsUpload = item.timeSynced === null && item.timeUpdatedLocally !== null;

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
        <ObsCardDetails item={item} needsUpload={needsUpload} />
      </View>
      {needsUpload ? <Text style={textStyles.wrap}>needs upload</Text> : <ObsCardStats item={item} type="list" />}
    </Pressable>
  );
};

export default ObsCard;

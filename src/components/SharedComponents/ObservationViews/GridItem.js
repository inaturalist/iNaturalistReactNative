// @flow

import React from "react";
import { Pressable, Text, Image } from "react-native";
import type { Node } from "react";
import Observation from "../../../models/Observation";

import { textStyles, imageStyles, viewStyles } from "../../../styles/sharedComponents/observationViews/gridItem";

type Props = {
  item: Object,
  handlePress: Function
}

const GridItem = ( { item, handlePress }: Props ): Node => {
  const onPress = ( ) => handlePress( item );
  // TODO: fix whatever funkiness is preventing realm mapTo from correctly
  // displaying camelcased item keys on ObservationList

  return (
    <Pressable
      onPress={onPress}
      style={viewStyles.gridItem}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={Observation.uri( item )}
        style={imageStyles.gridImage}
        testID="ObsList.photo"
      />
      <Text style={textStyles.text}>{item.taxon.preferredCommonName || item.taxon.preferred_common_name}</Text>
    </Pressable>
  );
};

export default GridItem;

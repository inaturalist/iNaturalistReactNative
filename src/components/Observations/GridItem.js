// @flow

import React from "react";
import { Pressable, Text, Image } from "react-native";
import type { Node } from "react";

import { textStyles, imageStyles, viewStyles } from "../../styles/observations/gridItem";

type Props = {
  item: Object,
  handlePress: Function
}

const GridItem = ( { item, handlePress }: Props ): Node => (
  <Pressable
    onPress={( ) => handlePress( item )}
    style={viewStyles.gridItem}
    testID={`ObsList.gridItem.${item.uuid}`}
    accessibilityRole="link"
    accessibilityLabel="Navigate to observation details screen"
  >
    <Image
      source={{ uri: item.observationPhotos[0].photo.url }}
      style={imageStyles.gridImage}
      testID="ObsList.photo"
    />
    <Text style={textStyles.text}>{item.taxon.preferredCommonName}</Text>
  </Pressable>
);

export default GridItem;

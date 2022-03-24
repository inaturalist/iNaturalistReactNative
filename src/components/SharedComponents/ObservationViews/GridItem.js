// @flow

import React from "react";
import { Pressable, Image } from "react-native";
import type { Node } from "react";
import Observation from "../../../models/Observation";

import { imageStyles, viewStyles } from "../../../styles/sharedComponents/observationViews/gridItem";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function,
  uri?: string
}

const GridItem = ( { item, handlePress, uri }: Props ): Node => {
  const onPress = ( ) => handlePress( item );
  // TODO: fix whatever funkiness is preventing realm mapTo from correctly
  // displaying camelcased item keys on ObservationList

  // TODO: add fallback image when there is no uri
  const imageUri = uri === "project" ? Observation.projectUri( item ) : Observation.uri( item, true );

  return (
    <Pressable
      onPress={onPress}
      style={viewStyles.gridItem}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      <Image
        source={imageUri}
        style={imageStyles.gridImage}
        testID="ObsList.photo"
      />
      <ObsCardStats item={item} />
      <ObsCardDetails item={item} />
    </Pressable>
  );
};

export default GridItem;

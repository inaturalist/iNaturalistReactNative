// @flow

import type { Node } from "react";
import React from "react";
import {
  Image, Pressable, Text, View
} from "react-native";
import {
  imageStyles,
  viewStyles
} from "styles/observations/gridItem";

import Observation from "../../models/Observation";
import Photo from "../../models/Photo";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";

type Props = {
  item: Object,
  handlePress: Function,
  uri?: string
}

const GridItem = ( { item, handlePress, uri }: Props ): Node => {
  const onPress = ( ) => handlePress( item );

  const photo = item?.observationPhotos?.[0]?.photo;

  // TODO: add fallback image when there is no uri
  const imageUri = uri === "project"
    ? Observation.projectUri( item )
    : { uri: Photo.displayLocalOrRemoteMediumPhoto( photo ) };

  const totalObsPhotos = item.observationPhotos && item.observationPhotos.length;

  return (
    <Pressable
      onPress={onPress}
      style={viewStyles.gridItem}
      testID={`ObsList.gridItem.${item.uuid}`}
      accessibilityRole="link"
      accessibilityLabel="Navigate to observation details screen"
    >
      {totalObsPhotos > 1 && (
        <View style={viewStyles.totalObsPhotos}>
          <Text>{totalObsPhotos}</Text>
        </View>
      )}
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

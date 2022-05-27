// @flow

import React from "react";
import { Pressable, Image, Text, View } from "react-native";
import type { Node } from "react";

import { imageStyles, viewStyles } from "../../../styles/sharedComponents/observationViews/gridItem";
import Observation from "../../../models/Observation";
import ObsCardDetails from "./ObsCardDetails";
import ObsCardStats from "./ObsCardStats";
import Photo from "../../../models/Photo";

type Props = {
  item: Object,
  handlePress: Function,
  uri?: string
}

const GridItem = ( { item, handlePress, uri }: Props ): Node => {
  const onPress = ( ) => handlePress( item );
  const needsUpload = item._synced_at === null;

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
      <ObsCardDetails item={item} needsUpload={needsUpload} />
    </Pressable>
  );
};

export default GridItem;

// @flow

import React from "react";
import { FlatList, Image, Text } from "react-native";
import type { Node } from "react";

import { viewStyles, imageStyles, textStyles } from "../../styles/camera/normalCamera";

type Props = {
  observationPhotos: Array<Object>
}

const TopPhotos = ( { observationPhotos }: Props ): Node => {
  const renderSmallPhoto = ( { item } ) => (
    <Image source={{ uri: item.uri }} style={imageStyles.smallPhoto} />
  );

  const emptyDescription = ( ) => <Text style={textStyles.topPhotoText}>Photos you take will appear here</Text>;

  return (
    <FlatList
      data={observationPhotos}
      contentContainerStyle={viewStyles.photoContainer}
      renderItem={renderSmallPhoto}
      horizontal
      ListEmptyComponent={emptyDescription}
    />
  );
};

export default TopPhotos;

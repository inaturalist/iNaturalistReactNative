// @flow

import React from "react";
import { FlatList, Image } from "react-native";
import type { Node } from "react";

import { viewStyles, imageStyles } from "../../styles/camera/normalCamera";

type Props = {
  observationPhotos: Array<Object>
}

const TopPhotos = ( { observationPhotos }: Props ): Node => {
  const renderSmallPhoto = ( { item } ) => (
    <Image source={{ uri: item.uri }} style={imageStyles.smallPhoto} />
  );

  return (
    <FlatList
      data={observationPhotos}
      contentContainerStyle={viewStyles.photoContainer}
      renderItem={renderSmallPhoto}
      horizontal
    />
  );
};

export default TopPhotos;

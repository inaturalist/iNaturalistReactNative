// @flow

import React from "react";
import { FlatList, Image, Text } from "react-native";
import type { Node } from "react";

import { viewStyles, imageStyles, textStyles } from "../../styles/camera/standardCamera";
import Photo from "../../models/Photo";

type Props = {
  photos: Array<Object>
}

const TopPhotos = ( { photos }: Props ): Node => {
  const renderSmallPhoto = ( { item } ) => {
    const uri = Photo.setPlatformSpecificFilePath( item.path );

    return (
      <Image source={{ uri }} style={imageStyles.smallPhoto} />
    );
  };

  const emptyDescription = ( ) => <Text style={textStyles.topPhotoText}>Photos you take will appear here</Text>;

  return (
    <FlatList
      data={photos}
      contentContainerStyle={viewStyles.photoContainer}
      renderItem={renderSmallPhoto}
      horizontal
      ListEmptyComponent={emptyDescription}
    />
  );
};

export default TopPhotos;

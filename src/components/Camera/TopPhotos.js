// @flow

import React from "react";
import { Text } from "react-native";
import type { Node } from "react";

import { textStyles } from "../../styles/camera/normalCamera";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";

type Props = {
  photos: Array<Object>
}

const TopPhotos = ( { photos }: Props ): Node => {
  const emptyDescription = ( ) => <Text style={textStyles.topPhotoText}>Photos you take will appear here</Text>;

  return (
    <PhotoCarousel
      photos={photos}
      emptyComponent={emptyDescription}
      containerStyle="camera"
    />
  );
};

export default TopPhotos;

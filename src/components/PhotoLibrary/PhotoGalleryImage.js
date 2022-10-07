// @flow

import type { Node } from "react";
import React from "react";
import { Image, Pressable } from "react-native";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/colors";
import { imageStyles } from "styles/photoLibrary/photoGallery";

type Props = {
  uri: string,
  handleImagePress: Function,
  isSelected: boolean
}

const PhotoGalleryImage = ( {
  uri,
  handleImagePress,
  isSelected
}: Props ): Node => (
  <Pressable
    onPress={handleImagePress}
    testID={`PhotoGallery.${uri}`}
  >
    <Image
      testID="PhotoGallery.photo"
      source={{ uri }}
      style={imageStyles.galleryImage}
    />
    {isSelected && (
    <IconMaterial
      name="check-circle"
      size={30}
      style={imageStyles.selectedIcon}
      color={colors.inatGreen}
    />
    )}
  </Pressable>
);

export default PhotoGalleryImage;

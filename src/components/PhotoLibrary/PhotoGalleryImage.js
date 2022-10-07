// @flow

import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/colors";

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
      className="h-24 w-24"
    />
    <View className="absolute top-0 right-0">
      {isSelected && (
        <IconMaterial
          name="check-circle"
          size={30}
          color={colors.inatGreen}
        />
      )}
    </View>
  </Pressable>
);

export default PhotoGalleryImage;

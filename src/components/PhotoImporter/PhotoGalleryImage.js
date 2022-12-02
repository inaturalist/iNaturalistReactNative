// @flow

import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  uri: string,
  handleImagePress: Function,
  isSelected: boolean,
  isDisabled: boolean
}

const PhotoGalleryImage = ( {
  uri,
  handleImagePress,
  isSelected,
  isDisabled
}: Props ): Node => {
  const showIcon = ( ) => {
    if ( isDisabled ) {
      return (
        <IconMaterial
          name="indeterminate-check-box"
          size={30}
          color={colors.gray}
        />
      );
    }
    if ( isSelected ) {
      return (
        <IconMaterial
          name="check-circle"
          size={30}
          color={colors.inatGreen}
          testID={`PhotoGallery.selected.${uri}`}
        />
      );
    }
    return null;
  };
  return (
    <Pressable
      className="w-1/4 px-0.5 py-0.5"
      onPress={handleImagePress}
      testID={`PhotoGallery.${uri}`}
      disabled={isDisabled}
    >
      <Image
        testID="PhotoGallery.photo"
        source={{ uri }}
        className="grow aspect-square"
      />
      <View className="absolute top-0 right-0">
        {showIcon( )}
      </View>
    </Pressable>
  );
};

export default PhotoGalleryImage;

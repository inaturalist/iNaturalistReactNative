// @flow

import { Image, Pressable, View } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import IconMaterial from "react-native-vector-icons/MaterialIcons";
import colors from "styles/tailwindColors";

type Props = {
  uri: string,
  timestamp: number,
  handleImagePress: Function,
  isSelected: boolean,
  isDisabled: boolean,
  itemStyle: Object
}

const PhotoGalleryImage = ( {
  uri,
  timestamp,
  handleImagePress,
  isSelected,
  isDisabled,
  itemStyle
}: Props ): Node => {
  const showIcon = ( ) => {
    if ( isDisabled ) {
      return (
        <IconMaterial
          name="indeterminate-check-box"
          size={30}
          color={colors.darkGray}
          accessibilityState={{
            disabled: true
          }}
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
          accessibilityState={{
            disabled: false
          }}
        />
      );
    }
    return null;
  };

  return (
    <Pressable
      className="overflow-hidden"
      onPress={handleImagePress}
      testID={`PhotoGallery.${uri}`}
      disabled={isDisabled}
      accessible
      accessibilityRole="button"
      accessibilityLabel={t( "Photo-taken-at", {
        date: new Date( timestamp * 1000 ).toLocaleString()
      } )}
      accessibilityState={{
        disabled: isDisabled
      }}
    >
      <Image
        testID={`PhotoGallery.photo.${uri}`}
        source={{ uri }}
        accessibilityIgnoresInvertColors
        style={itemStyle}
      />
      <View className="absolute top-0 right-0">
        {showIcon( )}
      </View>
    </Pressable>
  );
};

export default PhotoGalleryImage;

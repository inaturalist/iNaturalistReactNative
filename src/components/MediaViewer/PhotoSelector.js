// @flow

import classnames from "classnames";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import {
  FlatList
} from "react-native";

type Props = {
  photoUris: Array<string>,
  scrollToIndex: Function,
  selectedPhotoIndex?: number,
  isLandscapeMode?:boolean,
  isLargeScreen?: boolean
}

const PhotoSelector = ( {
  photoUris,
  scrollToIndex,
  selectedPhotoIndex,
  isLandscapeMode,
  isLargeScreen
}: Props ): Node => {
  const smallPhotoClass = "rounded-sm w-[42px] h-[42px] mt-[6px] mx-[3px]";
  const largePhotoClass = "rounded-md w-[83px] h-[83px] mx-[10px]";

  const renderPhoto = ( { item, index } ) => (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => scrollToIndex( index )}
    >
      <Image
        source={{ uri: item }}
        accessibilityIgnoresInvertColors
        className={classnames(
          {
            "border border-white border-[3px]": selectedPhotoIndex === index
          },
          {
            "mt-[18px]": isLargeScreen && isLandscapeMode,
            "mt-[47px]": isLargeScreen && !isLandscapeMode
          },
          {
            [`${smallPhotoClass}`]: !isLargeScreen,
            [`${largePhotoClass}`]: isLargeScreen
          }
        )}
      />
    </Pressable>
  );

  return (
    <View className={classnames(
      {
        "left-[9px]": isLargeScreen
      }
    )}
    >
      <FlatList
        data={[...photoUris]}
        renderItem={renderPhoto}
        horizontal
      />
    </View>
  );
};

export default PhotoSelector;

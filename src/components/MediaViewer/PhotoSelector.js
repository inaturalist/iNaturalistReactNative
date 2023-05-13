// @flow

import classnames from "classnames";
import { Image, Pressable } from "components/styledComponents";
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
  const smallPhotoClass = "rounded-sm w-[42px] h-[42px]";
  const largePhotoClass = "rounded-md w-[83px] h-[83px]";

  const renderPhoto = ( { item, index } ) => (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => scrollToIndex( index )}
    >
      <Image
        source={{ uri: item }}
        accessibilityIgnoresInvertColors
        className={classnames(
          "mt-[6px]",
          {
            "border border-white border-[3px]": selectedPhotoIndex === index
          },
          {
            "mx-[3px]": !isLargeScreen,
            "mx-[8.5px] mt-[47px]": isLargeScreen && isLandscapeMode,
            "mx-[10px] my-[18px] mt-[47px]": isLargeScreen && !isLandscapeMode
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
    <FlatList
      data={[...photoUris]}
      renderItem={renderPhoto}
      horizontal
    />
  );
};

export default PhotoSelector;

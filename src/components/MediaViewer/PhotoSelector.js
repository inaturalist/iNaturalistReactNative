// @flow

import classnames from "classnames";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import {
  FlatList
} from "react-native";
import useTranslation from "sharedHooks/useTranslation";

type Props = {
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  scrollToIndex: Function,
  selectedPhotoIndex?: number,
  isLargeScreen?: boolean
}

const PhotoSelector = ( {
  photos,
  scrollToIndex,
  selectedPhotoIndex,
  isLargeScreen
}: Props ): Node => {
  const { t } = useTranslation( );
  const smallPhotoClass = "rounded-sm w-[42px] h-[42px] mx-[6px] my-[12px]";
  const largePhotoClass = "rounded-md w-[83px] h-[83px] mx-[10px] my-[20px]";

  const renderPhoto = useCallback( ( { item: photo, index } ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t( "View-photo" )}
      onPress={( ) => scrollToIndex( index )}
      className={classnames(
        "overflow-hidden",
        {
          "border border-white border-[3px]": selectedPhotoIndex === index
        },
        {
          [`${smallPhotoClass}`]: !isLargeScreen,
          [`${largePhotoClass}`]: isLargeScreen
        }
      )}
    >
      <Image
        source={{ uri: photo.url || photo.localFilePath }}
        accessibilityIgnoresInvertColors
        className="w-full h-full"
      />
    </Pressable>
  ), [
    isLargeScreen,
    scrollToIndex,
    selectedPhotoIndex,
    t
  ] );

  return (
    <View>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        horizontal
      />
    </View>
  );
};

export default PhotoSelector;

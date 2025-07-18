// @flow

import classnames from "classnames";
import { INatIcon } from "components/SharedComponents";
import { Image, Pressable, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import {
  FlatList
} from "react-native";
import Photo from "realmModels/Photo.ts";
import useTranslation from "sharedHooks/useTranslation.ts";

type Props = {
  isLargeScreen?: boolean,
  photos: Array<{
    id?: number,
    url: string,
    localFilePath?: string,
    attribution?: string,
    licenseCode?: string
  }>,
  scrollToIndex: Function,
  selectedMediaIndex?: number,
  sounds?: Array<{
    file_url: string
  }>,
}

const SMALL_ITEM_CLASS = "rounded-sm w-[42px] h-[42px] mx-[6px] my-[12px]";
const LARGE_ITEM_CLASS = "rounded-md w-[83px] h-[83px] mx-[10px] my-[20px]";

const PhotoSelector = ( {
  isLargeScreen,
  photos,
  scrollToIndex,
  selectedMediaIndex,
  sounds = []
}: Props ): Node => {
  const { t } = useTranslation( );
  const items = [
    ...photos.map( photo => ( { ...photo, type: "photo" } ) ),
    ...sounds.map( sound => ( { ...sound, type: "sound" } ) )
  ];

  const renderItem = useCallback( ( { item, index } ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t( "View-photo" )}
      onPress={( ) => scrollToIndex( index )}
      className={classnames(
        "overflow-hidden",
        {
          "border border-white border-[3px]": selectedMediaIndex === index
        },
        {
          [SMALL_ITEM_CLASS]: !isLargeScreen,
          [LARGE_ITEM_CLASS]: isLargeScreen
        }
      )}
    >
      {
        item.type === "photo"
          ? (
            <Image
              source={{ uri: Photo.displayLocalOrRemoteSquarePhoto( item ) }}
              accessibilityIgnoresInvertColors
              className="w-full h-full"
            />
          )
          : (
            <View className="w-full h-full bg-darkGray items-center justify-center">
              <INatIcon
                name="sound-outline"
                color="white"
                size={26}
              />
            </View>
          )
      }
    </Pressable>
  ), [
    isLargeScreen,
    scrollToIndex,
    selectedMediaIndex,
    t
  ] );

  return (
    <View>
      <FlatList
        data={items}
        renderItem={renderItem}
        horizontal
      />
    </View>
  );
};

export default PhotoSelector;

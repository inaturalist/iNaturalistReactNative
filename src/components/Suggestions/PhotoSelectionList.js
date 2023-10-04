// @flow

import classnames from "classnames";
import {
  Image, Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React from "react";
import { FlatList } from "react-native";

type Props = {
  photoUris: Array<string>,
  selectedPhotoUri: string,
  setSelectedPhotoUri: Function
};

const PhotoSelectionList = ( {
  photoUris, selectedPhotoUri, setSelectedPhotoUri
}: Props ): Node => {
  const renderPhoto = ( { item } ) => (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => {
        setSelectedPhotoUri( item );
      }}
      className={classnames(
        "w-[83px] h-[83px] justify-center mx-1.5 rounded-lg"
      )}
    >
      <View className={classnames(
        "rounded-lg overflow-hidden",
        {
          "border border-inatGreen border-[3px]": selectedPhotoUri === item
        }
      )}
      >
        <Image
          source={{ uri: item }}
          accessibilityIgnoresInvertColors
          className="w-full h-full"
        />
      </View>
    </Pressable>
  );

  return (
    <FlatList
      data={photoUris}
      renderItem={renderPhoto}
      horizontal
    />
  );
};

export default PhotoSelectionList;

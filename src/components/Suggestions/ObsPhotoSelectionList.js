// @flow

import classnames from "classnames";
import {
  Image, Pressable, View
} from "components/styledComponents";
import type { Node } from "react";
import React, { useCallback } from "react";
import { FlatList } from "react-native";
import { useTranslation } from "sharedHooks";

type Props = {
  photoUris: Array<string>,
  selectedPhotoUri: string,
  onPressPhoto: Function
};

const ObsPhotoSelectionList = ( {
  photoUris, selectedPhotoUri, onPressPhoto
}: Props ): Node => {
  const { t } = useTranslation( );

  const renderPhoto = useCallback( ( { item } ) => (
    <Pressable
      accessibilityRole="button"
      onPress={( ) => {
        onPressPhoto( item );
      }}
      className={classnames(
        "w-[83px] h-[83px] justify-center mx-1.5 rounded-lg"
      )}
      accessibilityLabel={t( "Select-photo" )}
      testID={`PhotoSelectionList.${item}`}
    >
      <View
        className={classnames(
          "rounded-lg overflow-hidden",
          {
            "border border-inatGreen border-[3px]": selectedPhotoUri === item
          }
        )}
        testID={`PhotoSelectionList.border.${item}`}
      >
        <Image
          source={{ uri: item }}
          accessibilityIgnoresInvertColors
          className="w-full h-full"
        />
      </View>
    </Pressable>
  ), [selectedPhotoUri, onPressPhoto, t] );

  return (
    <FlatList
      data={photoUris}
      renderItem={renderPhoto}
      horizontal
    />
  );
};

export default ObsPhotoSelectionList;

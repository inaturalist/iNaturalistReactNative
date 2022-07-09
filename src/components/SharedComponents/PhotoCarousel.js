// @flow

import React from "react";
import { FlatList, Image, Pressable } from "react-native";
import type { Node } from "react";
import { Avatar, useTheme } from "react-native-paper";

import { imageStyles, viewStyles } from "../../styles/sharedComponents/photoCarousel";

type Props = {
  emptyComponent?: Function,
  photoUris: Array<string>,
  setSelectedPhotoIndex?: Function,
  selectedPhotoIndex?: number,
  containerStyle?: string,
  handleDelete?: Function
}

const PhotoCarousel = ( {
  photoUris,
  emptyComponent,
  setSelectedPhotoIndex,
  selectedPhotoIndex,
  containerStyle,
  handleDelete
}: Props ): Node => {
  const { colors } = useTheme( );
  const renderDeleteButton = photoUri => (
    <Pressable
      onPress={( ) => {
        if ( !handleDelete ) { return; }
        handleDelete( photoUri );
      }}
      style={viewStyles.deleteButton}
    >
      <Avatar.Icon icon="delete-forever" size={30} style={{ backgroundColor: colors.background }} />
    </Pressable>
  );

  const renderPhoto = ( { item, index } ) => (
    <Pressable
      onPress={( ) => {
        if ( setSelectedPhotoIndex ) {
          setSelectedPhotoIndex( index );
        }
      }}
    >
      <Image
        source={{ uri: item }}
        style={[
          imageStyles.photo,
          selectedPhotoIndex === index && viewStyles.greenSelectionBorder,
          ( containerStyle === "camera" ) && imageStyles.photoStandardCamera
        ]}
        testID="ObsEdit.photo"
      />
      {( containerStyle === "camera" ) && renderDeleteButton( item )}
    </Pressable>
  );

  return (
    <FlatList
      data={photoUris}
      contentContainerStyle={( containerStyle === "camera" ) && viewStyles.photoContainer}
      renderItem={renderPhoto}
      horizontal
      ListEmptyComponent={emptyComponent}
    />
  );
};

export default PhotoCarousel;

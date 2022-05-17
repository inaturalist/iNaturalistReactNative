// @flow

import React from "react";
import { FlatList, Image, Pressable } from "react-native";
import type { Node } from "react";
import { Avatar } from "react-native-paper";

import { imageStyles, viewStyles } from "../../styles/sharedComponents/photoCarousel";
import Photo from "../../models/Photo";

type Props = {
  emptyComponent?: Function,
  photos: Array<Object>,
  setSelectedPhoto?: Function,
  selectedPhoto?: number,
  containerStyle?: string,
  handleDelete?: Function
}

const PhotoCarousel = ( {
  photos,
  emptyComponent,
  setSelectedPhoto,
  selectedPhoto,
  containerStyle,
  handleDelete
}: Props ): Node => {
  const renderDeleteButton = ( item ) => (
    <Pressable
      onPress={( ) => {
        if ( !handleDelete ) { return; }
        handleDelete( item );
      }}
      style={viewStyles.deleteButton}
    >
      <Avatar.Icon icon="delete-forever" size={30} />
    </Pressable>
  );

  const renderPhoto = ( { item, index } ) => {
    const uri = Photo.setPlatformSpecificFilePath( item.path );

    return (
      <Pressable
        onPress={( ) => {
          if ( setSelectedPhoto ) {
            setSelectedPhoto( index );
          }
        }}
      >
        <Image
          source={{ uri }}
          style={[
            imageStyles.obsPhoto,
            selectedPhoto === index && viewStyles.greenSelectionBorder
          ]}
          testID="ObsEdit.photo"
        />
        {( containerStyle === "camera" ) && renderDeleteButton( item )}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={photos}
      contentContainerStyle={( containerStyle === "camera" ) && viewStyles.photoContainer}
      renderItem={renderPhoto}
      horizontal
      ListEmptyComponent={emptyComponent}
    />
  );
};

export default PhotoCarousel;

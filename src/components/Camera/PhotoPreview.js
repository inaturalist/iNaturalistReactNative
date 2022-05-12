// @flow

import React from "react";
import { FlatList, Image, Pressable, Text } from "react-native";
import type { Node } from "react";
import RNFS from "react-native-fs";
import { Avatar } from "react-native-paper";

import { viewStyles, imageStyles, textStyles } from "../../styles/camera/standardCamera";
import Photo from "../../models/Photo";

type Props = {
  photos: Array<Object>,
  setPhotos: Function
}

const PhotoPreview = ( { photos, setPhotos }: Props ): Node => {
  const renderSmallPhoto = ( { item } ) => {
    const uri = Photo.setPlatformSpecificFilePath( item.path );

    const deletePhoto = ( ) => {
      const updatedPhotos = photos;
      const photoIndex = photos.findIndex( p => p === item );
      updatedPhotos.splice( photoIndex, 1 );

      // spreading the array forces PhotoPreview to rerender on each photo deletion
      setPhotos( [...updatedPhotos] );

      // delete photo thumbnail from temp directory
      const tempDirectory = `${RNFS.TemporaryDirectoryPath}/ReactNative`;
      const fileName = item.path.split( "ReactNative/" )[1];
      RNFS.unlink( `${tempDirectory}/${fileName}` );
    };

    return (
      <>
        <Image source={{ uri }} style={imageStyles.smallPhoto} />
        <Pressable
          onPress={deletePhoto}
          style={viewStyles.deleteButton}
        >
          <Avatar.Icon icon="delete-forever" size={30} />
        </Pressable>
      </>
    );
  };

  const emptyDescription = ( ) => <Text style={textStyles.topPhotoText}>Photos you take will appear here</Text>;

  return (
    <FlatList
      data={photos}
      contentContainerStyle={viewStyles.photoContainer}
      renderItem={renderSmallPhoto}
      horizontal
      ListEmptyComponent={emptyDescription}
    />
  );
};

export default PhotoPreview;

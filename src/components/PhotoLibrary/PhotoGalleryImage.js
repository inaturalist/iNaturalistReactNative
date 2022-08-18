// @flow

import type { Node } from "react";
import React from "react";
import {
  Image, Pressable
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useBetween } from "use-between";

import colors from "../../styles/colors";
import { imageStyles } from "../../styles/photoLibrary/photoGallery";
import useSelectedPhotos from "./hooks/useSelectedPhotos";

const MAX_PHOTOS_ALLOWED = 20;

type Props = {
  item: Object,
  setShowAlert: Function,
  selectedAlbum: string,
  getAllPhotos: Function,
  updatePhotoGallery: Function
}

const PhotoGalleryImage = ( {
  item,
  setShowAlert,
  selectedAlbum,
  getAllPhotos,
  updatePhotoGallery
}: Props ): Node => {
  const useSharedSelectedPhotos = ( ) => useBetween( useSelectedPhotos );
  const {
    selectedPhotos,
    unselectPhoto,
    selectPhoto
  } = useSharedSelectedPhotos( );
  const uri = item?.image?.uri;
  const albumGroupName = selectedAlbum === "All" ? "All Photos" : selectedAlbum;
  const selectedInCurrentAlbum = selectedPhotos.filter( p => p.group_name === albumGroupName );
  const isSelected = selectedInCurrentAlbum.some( p => p.image.uri === uri );

  const handlePhotoSelection = selected => {
    if ( !selected ) {
      selectPhoto( item );
      updatePhotoGallery( false );
    } else {
      unselectPhoto( item );
      updatePhotoGallery( true );
    }
  };

  const handlePress = ( ) => {
    const allPhotos = getAllPhotos( );
    if ( isSelected || allPhotos.length < MAX_PHOTOS_ALLOWED ) {
      handlePhotoSelection( isSelected );
    } else {
      setShowAlert( true );
    }
  };

  const imageUri = { uri };
  return (
    <Pressable
      onPress={handlePress}
      testID={`PhotoGallery.${uri}`}
    >
      <Image
        testID="PhotoGallery.photo"
        source={imageUri}
        style={imageStyles.galleryImage}
      />
      {isSelected && (
        <Icon
          name="check-circle"
          size={30}
          style={imageStyles.selectedIcon}
          color={colors.inatGreen}
        />
      )}
    </Pressable>
  );
};

export default PhotoGalleryImage;

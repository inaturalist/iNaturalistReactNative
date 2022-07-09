// @flow

import React, { useState, useEffect } from "react";
import { Image, Dimensions } from "react-native";
import type { Node } from "react";
import { Appbar, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { HeaderBackButton } from "@react-navigation/elements";
import ImageZoom from "react-native-image-pan-zoom";

import { imageStyles, viewStyles } from "../../styles/mediaViewer/mediaViewer";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ViewNoFooter from "../SharedComponents/ViewNoFooter";
import DeletePhotoDialog from "../SharedComponents/DeletePhotoDialog";
import Photo from "../../models/Photo";

const { width, height } = Dimensions.get( "screen" );
const selectedImageHeight = height - 350;

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  initialPhotoSelected: Object,
  hideModal: Function
}

const MediaViewer = ( {
  photoUris, setPhotoUris, initialPhotoSelected, hideModal
}: Props ): Node => {
  const { t } = useTranslation( );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState( initialPhotoSelected );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );

  const numOfPhotos = photoUris.length;

  const handlePhotoSelection = index => setSelectedPhotoIndex( index );

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => setDeleteDialogVisible( false );

  useEffect( ( ) => {
    // automatically select the only photo in the media viewer
    if ( numOfPhotos === 1 && selectedPhotoIndex !== 0 ) {
      setSelectedPhotoIndex( 0 );
    }
    // close media viewer when there are no photos
    if ( numOfPhotos === 0 ) {
      hideModal( );
    }
  }, [numOfPhotos, selectedPhotoIndex, hideModal] );

  return (
    <ViewNoFooter style={viewStyles.container}>
      <Appbar.Header style={viewStyles.container}>
        <Appbar.Content title={t( "X-Photos", { photoCount: numOfPhotos } )} />
      </Appbar.Header>
      {numOfPhotos > 0 && (
        <ImageZoom
          cropWidth={width}
          cropHeight={selectedImageHeight}
          imageWidth={width}
          imageHeight={selectedImageHeight}
        >
          <Image
            style={imageStyles.selectedPhoto}
            source={{ uri: Photo.displayLargePhoto( photoUris[selectedPhotoIndex] ) }}
          />
        </ImageZoom>
      )}
      <PhotoCarousel
        photoUris={photoUris}
        selectedPhotoIndex={selectedPhotoIndex}
        setSelectedPhotoIndex={handlePhotoSelection}
      />
      <HeaderBackButton onPress={hideModal} />
      <DeletePhotoDialog
        deleteDialogVisible={deleteDialogVisible}
        photoUriToDelete={photoUris[selectedPhotoIndex]}
        photoUris={photoUris}
        setPhotoUris={setPhotoUris}
        hideDialog={hideDialog}
      />
      <Button
        style={viewStyles.alignRight}
        onPress={showDialog}
      >
        {t( "Remove-Photo" )}
      </Button>
    </ViewNoFooter>
  );
};

export default MediaViewer;

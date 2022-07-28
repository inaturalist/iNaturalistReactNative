// @flow

import { HeaderBackButton } from "@react-navigation/elements";
import type { Node } from "react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, Image, View } from "react-native";
import ImageZoom from "react-native-image-pan-zoom";
import { Appbar, Button } from "react-native-paper";

import Photo from "../../models/Photo";
import { imageStyles, viewStyles } from "../../styles/mediaViewer/mediaViewer";
import DeletePhotoDialog from "../SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
// import ViewNoFooter from "../SharedComponents/ViewNoFooter";

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
    <View style={viewStyles.container}>
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
    </View>
  );
};

export default MediaViewer;

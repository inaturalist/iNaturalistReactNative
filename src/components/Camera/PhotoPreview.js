// @flow

import React, { useState } from "react";
import { Text } from "react-native";
import type { Node } from "react";
import { Portal, Modal } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { viewStyles, textStyles } from "../../styles/camera/standardCamera";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import MediaViewer from "../MediaViewer/MediaViewer";
import DeletePhotoDialog from "../SharedComponents/DeletePhotoDialog";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function
}

const PhotoPreview = ( { photoUris, setPhotoUris }: Props ): Node => {
  const { t } = useTranslation( );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const [photoUriToDelete, setPhotoUriToDelete] = useState( null );
  const [initialPhotoSelected, setInitialPhotoSelected] = useState( null );
  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleSelection = ( photoUri ) => {
    setInitialPhotoSelected( photoUri );
    showModal( );
  };

  const showDialog = ( ) => setDeleteDialogVisible( true );

  const hideDialog = ( ) => {
    setPhotoUriToDelete( null );
    setDeleteDialogVisible( false );
  };

  const handleDelete = ( photoUri ) => {
    setPhotoUriToDelete( photoUri );
    showDialog( );
  };

  const emptyDescription = ( ) => (
    <Text style={textStyles.topPhotoText}>
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );

  return (
    <>
      <DeletePhotoDialog
        deleteDialogVisible={deleteDialogVisible}
        photoUriToDelete={photoUriToDelete}
        photoUris={photoUris}
        setPhotoUris={setPhotoUris}
        hideDialog={hideDialog}
      />
      <Portal>
        <Modal
          visible={mediaViewerVisible}
          onDismiss={hideModal}
          contentContainerStyle={viewStyles.container}
        >
          <MediaViewer
            initialPhotoSelected={initialPhotoSelected}
            photoUris={photoUris}
            setPhotoUris={setPhotoUris}
            hideModal={hideModal}
          />
        </Modal>
      </Portal>
      <PhotoCarousel
        photoUris={photoUris}
        emptyComponent={emptyDescription}
        containerStyle="camera"
        handleDelete={handleDelete}
        setSelectedPhotoIndex={handleSelection}
      />
    </>
  );
};

export default PhotoPreview;

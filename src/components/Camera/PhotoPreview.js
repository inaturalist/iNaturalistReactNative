// @flow

import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "react-native";

import { textStyles } from "../../styles/camera/standardCamera";
import MediaViewer from "../MediaViewer/MediaViewer";
import MediaViewerModal from "../MediaViewer/MediaViewerModal";
import DeletePhotoDialog from "../SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";

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

  const handleSelection = photoUri => {
    setInitialPhotoSelected( photoUri );
    showModal( );
  };

  const showDialog = ( ) => setDeleteDialogVisible( true );

  const hideDialog = ( ) => {
    setPhotoUriToDelete( null );
    setDeleteDialogVisible( false );
  };

  const handleDelete = photoUri => {
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
      <MediaViewerModal
        mediaViewerVisible={mediaViewerVisible}
        hideModal={hideModal}
      >
        <MediaViewer
          initialPhotoSelected={initialPhotoSelected}
          photoUris={photoUris}
          setPhotoUris={setPhotoUris}
          hideModal={hideModal}
        />
      </MediaViewerModal>
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

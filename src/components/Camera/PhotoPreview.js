// @flow

import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import DeletePhotoDialog from "components/SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import { Text, View } from "components/styledComponents";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  photoUris: Array<string>,
  setPhotoUris: Function,
  savingPhoto: boolean
}

const PhotoPreview = ( { photoUris, setPhotoUris, savingPhoto }: Props ): Node => {
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
    <Text className="text-white text-xl mt-20 ml-3">
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
      <View className="bg-black h-32">
        <PhotoCarousel
          photoUris={photoUris}
          emptyComponent={emptyDescription}
          containerStyle="camera"
          handleDelete={handleDelete}
          setSelectedPhotoIndex={handleSelection}
          savingPhoto={savingPhoto}
        />
      </View>
    </>
  );
};

export default PhotoPreview;

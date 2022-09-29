// @flow

import MediaViewer from "components/MediaViewer/MediaViewer";
import MediaViewerModal from "components/MediaViewer/MediaViewerModal";
import DeletePhotoDialog from "components/SharedComponents/DeletePhotoDialog";
import PhotoCarousel from "components/SharedComponents/PhotoCarousel";
import type { Node } from "react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { textStyles, viewStyles } from "styles/camera/photoPreview";

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

  const insets = useSafeAreaInsets( );

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
    <Text style={[
      textStyles.topPhotoText, {
        // $FlowIgnore
        bottom: textStyles.topPhotoText.bottom + insets.top
      }]}
    >
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
      <View style={[
        viewStyles.photoPreviewContainer, {
          // $FlowIgnore
          height: viewStyles.photoPreviewContainer.height + insets.top
        }
      ]}
      >
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

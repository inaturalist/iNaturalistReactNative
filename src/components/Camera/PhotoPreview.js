// @flow

import React, { useState } from "react";
import { Text } from "react-native";
import type { Node } from "react";
import Realm from "realm";
import { Button, Paragraph, Dialog, Portal, Modal } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { viewStyles, textStyles } from "../../styles/camera/standardCamera";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";
import ObservationPhoto from "../../models/ObservationPhoto";
import realmConfig from "../../models/index";
import MediaViewer from "../MediaViewer/MediaViewer";

type Props = {
  photos: Array<Object>,
  setPhotos: Function
}

const PhotoPreview = ( { photos, setPhotos }: Props ): Node => {
  const { t } = useTranslation( );
  const [deleteDialogVisible, setDeleteDialogVisible] = useState( false );
  const [photoToDelete, setPhotoToDelete] = useState( null );
  const [mainPhoto, setMainPhoto] = useState( null );

  const [mediaViewerVisible, setMediaViewerVisible] = useState( false );

  const showModal = ( ) => setMediaViewerVisible( true );
  const hideModal = ( ) => setMediaViewerVisible( false );

  const handleSelection = ( photo ) => {
    setMainPhoto( photo );
    showModal( );
    // navigation.navigate( "MediaViewer", { photos, mainPhoto } );
  };

  const showDialog = ( ) => setDeleteDialogVisible( true );
  const hideDialog = ( ) => {
    setPhotoToDelete( null );
    setDeleteDialogVisible( false );
  };

  const deletePhoto = async ( ) => {
    if ( !photoToDelete ) { return; }
    const updatedPhotos = photos;
    const photoIndex = photos.findIndex( p => p === photoToDelete );
    updatedPhotos.splice( photoIndex, 1 );

    // spreading the array forces PhotoPreview to rerender on each photo deletion
    setPhotos( [...updatedPhotos] );

    const realm = await Realm.open( realmConfig );
    await ObservationPhoto.deleteObservationPhoto( realm, photoToDelete );

    hideDialog( );
  };

  const handleDelete = ( item ) => {
    setPhotoToDelete( item );
    showDialog( );
  };

  const emptyDescription = ( ) => (
    <Text style={textStyles.topPhotoText}>
      {t( "Photos-you-take-will-appear-here" )}
    </Text>
  );

  return (
    <>
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDialog}>
          <Dialog.Content>
            <Paragraph>{t( "Are-you-sure" )}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog} style={viewStyles.cancelButton}>
              {t( "Cancel" )}
            </Button>
            <Button onPress={deletePhoto} style={viewStyles.confirmButton}>
              {t( "Yes-delete-photo" )}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Modal visible={mediaViewerVisible} onDismiss={hideModal} contentContainerStyle={viewStyles.container}>
          <MediaViewer
            mainPhoto={mainPhoto}
            photos={photos}
            setPhotos={setPhotos}
            hideModal={hideModal}
          />
        </Modal>
      </Portal>
      <PhotoCarousel
        photos={photos}
        emptyComponent={emptyDescription}
        containerStyle="camera"
        handleDelete={handleDelete}
        setSelectedPhoto={handleSelection}
      />
    </>
  );
};

export default PhotoPreview;

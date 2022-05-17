// @flow

import React, { useState } from "react";
import { Text } from "react-native";
import type { Node } from "react";
import RNFS from "react-native-fs";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";

import { viewStyles, textStyles } from "../../styles/camera/standardCamera";
import PhotoCarousel from "../SharedComponents/PhotoCarousel";

type Props = {
  photos: Array<Object>,
  setPhotos: Function
}

const PhotoPreview = ( { photos, setPhotos }: Props ): Node => {
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );
  const [photoToDelete, setPhotoToDelete] = useState( null );
  const navigation = useNavigation( );

  const handleSelection = ( mainPhoto ) => {
    navigation.navigate( "MediaViewer", { photos, mainPhoto } );
  };

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => {
    setPhotoToDelete( null );
    setVisible( false );
  };

  const deletePhoto = ( ) => {
    if ( !photoToDelete ) { return; }
    const updatedPhotos = photos;
    const photoIndex = photos.findIndex( p => p === photoToDelete );
    updatedPhotos.splice( photoIndex, 1 );

    // spreading the array forces PhotoPreview to rerender on each photo deletion
    setPhotos( [...updatedPhotos] );

    // delete photo thumbnail from temp directory
    const tempDirectory = `${RNFS.TemporaryDirectoryPath}/ReactNative`;
    const fileName = photoToDelete.path.split( "ReactNative/" )[1];
    RNFS.unlink( `${tempDirectory}/${fileName}` );

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
        <Dialog visible={visible} onDismiss={hideDialog}>
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

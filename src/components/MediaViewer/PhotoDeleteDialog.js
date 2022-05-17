// @flow

import React, { useState } from "react";
import type { Node } from "react";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { viewStyles } from "../../styles/mediaViewer/mediaViewer";

type Props = {
  photo: Object
}

const PhotoDeleteDialog = ( { photo }: Props ): Node => {
  console.log( photo, "photo delete dialog" );
  const { t } = useTranslation( );
  const [visible, setVisible] = useState( false );
  // const [photoToDelete, setPhotoToDelete] = useState( null );

  const showDialog = ( ) => setVisible( true );
  const hideDialog = ( ) => {
    // setPhotoToDelete( null );
    setVisible( false );
  };

  const deletePhoto = ( ) => {
    // if ( !photoToDelete ) { return; }
    // const updatedPhotos = photos;
    // const photoIndex = photos.findIndex( p => p === photoToDelete );
    // updatedPhotos.splice( photoIndex, 1 );

    // // spreading the array forces PhotoPreview to rerender on each photo deletion
    // setPhotos( [...updatedPhotos] );

    // // delete photo thumbnail from temp directory
    // const tempDirectory = `${RNFS.TemporaryDirectoryPath}/ReactNative`;
    // const fileName = photoToDelete.path.split( "ReactNative/" )[1];
    // RNFS.unlink( `${tempDirectory}/${fileName}` );

    hideDialog( );
  };

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
        <Button
          style={viewStyles.alignRight}
          onPress={( ) => {
            // setPhotoToDelete( item );
            showDialog( );
          }}
        >
          {t( "Remove-Photo" )}
        </Button>
      </>
    );
};

export default PhotoDeleteDialog;

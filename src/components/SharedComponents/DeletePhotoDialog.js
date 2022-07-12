// @flow

import type { Node } from "react";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Button, Dialog, Paragraph, Portal
} from "react-native-paper";
import Realm from "realm";

import realmConfig from "../../models/index";
import Photo from "../../models/Photo";
import { viewStyles } from "../../styles/camera/standardCamera";

type Props = {
  deleteDialogVisible: boolean,
  photoUriToDelete: ?string,
  photoUris: Array<string>,
  setPhotoUris: Function,
  hideDialog: Function
}

const DeletePhotoDialog = ( {
  deleteDialogVisible,
  photoUriToDelete,
  photoUris,
  setPhotoUris,
  hideDialog
}: Props ): Node => {
  const { t } = useTranslation( );

  const deletePhoto = async ( ) => {
    if ( !photoUriToDelete ) { return; }
    const updatedPhotos = photoUris;
    const photoIndex = photoUris.findIndex( p => p === photoUriToDelete );
    updatedPhotos.splice( photoIndex, 1 );

    // spreading the array forces DeletePhotoDialog to rerender on each photo deletion
    setPhotoUris( [...updatedPhotos] );

    const realm = await Realm.open( realmConfig );
    await Photo.deletePhoto( realm, photoUriToDelete );

    hideDialog( );
  };

  return (
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
  );
};

export default DeletePhotoDialog;

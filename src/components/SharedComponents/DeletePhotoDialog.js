// @flow

import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog, Paragraph, Portal
} from "react-native-paper";
import Photo from "realmModels/Photo";

import Button from "./Buttons/Button";

const { useRealm } = RealmContext;

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
  const {
    evidenceToAdd,
    setEvidenceToAdd
  } = useContext( ObsEditContext );
  const { t } = useTranslation( );
  const realm = useRealm( );

  const removePhotoFromList = ( list, photo ) => {
    const updatedPhotoList = list;
    const photoIndex = list.findIndex( p => p === photo );
    updatedPhotoList.splice( photoIndex, 1 );
    return updatedPhotoList || list;
  };

  const deletePhoto = async ( ) => {
    if ( !photoUriToDelete ) { return; }
    const updatedPhotos = removePhotoFromList( photoUris, photoUriToDelete );

    // spreading the array forces DeletePhotoDialog to rerender on each photo deletion
    setPhotoUris( [...updatedPhotos] );

    // when deleting photo from StandardCamera while adding new evidence, remember to clear
    // the list of new evidence to add
    if ( evidenceToAdd && evidenceToAdd.length > 0 && setEvidenceToAdd ) {
      const updatedEvidence = removePhotoFromList( evidenceToAdd, photoUriToDelete );
      setEvidenceToAdd( [...updatedEvidence] );
    }

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
          <Button onPress={hideDialog} text={t( "Cancel" )} level="neutral" />
          <Button onPress={deletePhoto} text={t( "Yes-delete-photo" )} level="primary" />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeletePhotoDialog;

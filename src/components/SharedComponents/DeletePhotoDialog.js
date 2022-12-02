// @flow

import { Text } from "components/styledComponents";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "react-native-paper";

import Button from "./Buttons/Button";

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
  const { deletePhotoFromObservation } = useContext( ObsEditContext );
  const { t } = useTranslation( );

  const deletePhoto = async ( ) => {
    deletePhotoFromObservation( photoUriToDelete, photoUris, setPhotoUris );
    hideDialog( );
  };

  return (
    <Dialog visible={deleteDialogVisible} onDismiss={hideDialog}>
      <Dialog.Content>
        <Text>{t( "Are-you-sure" )}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={hideDialog} text={t( "Cancel" )} level="neutral" />
        <Button onPress={deletePhoto} text={t( "Yes-delete-photo" )} level="primary" />
      </Dialog.Actions>
    </Dialog>
  );
};

export default DeletePhotoDialog;

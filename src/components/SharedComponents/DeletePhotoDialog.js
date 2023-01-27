// @flow

import { Text } from "components/styledComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Dialog } from "react-native-paper";

import Button from "./Buttons/Button";

type Props = {
  deleteDialogVisible: boolean,
  deletePhoto: Function,
  hideDialog: Function
}

const DeletePhotoDialog = ( {
  deleteDialogVisible,
  deletePhoto,
  hideDialog
}: Props ): Node => (
  <Dialog visible={deleteDialogVisible} onDismiss={hideDialog}>
    <Dialog.Content>
      <Text>{t( "Are-you-sure" )}</Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog} text={t( "Cancel" )} level="neutral" />
      <Button onPress={deletePhoto} text={t( "Yes-delete-photo" )} level="focus" />
    </Dialog.Actions>
  </Dialog>
);

export default DeletePhotoDialog;

// @flow

import React, { useContext } from "react";
import type { Node } from "react";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";
import { t } from "i18next";

import { viewStyles } from "../../styles/sharedComponents/deletePhotoDialog";
import { ObsEditContext } from "../../providers/contexts";

type Props = {
  deleteDialogVisible: boolean,
  hideDialog: Function
}

const DeleteObservationDialog = ( {
  deleteDialogVisible,
  hideDialog
}: Props ): Node => {
  const {
    deleteCurrentObservation
  } = useContext( ObsEditContext );
  const deleteObservation = async ( ) => {
    deleteCurrentObservation( );
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
          <Button onPress={deleteObservation} style={viewStyles.confirmButton}>
            {t( "Yes-delete-observation" )}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteObservationDialog;

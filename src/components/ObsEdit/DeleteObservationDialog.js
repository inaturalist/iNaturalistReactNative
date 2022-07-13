// @flow

import { t } from "i18next";
import type { Node } from "react";
import React, { useContext } from "react";
import {
  Button, Dialog, Paragraph, Portal
} from "react-native-paper";

import { ObsEditContext } from "../../providers/contexts";
import { viewStyles } from "../../styles/sharedComponents/deletePhotoDialog";

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

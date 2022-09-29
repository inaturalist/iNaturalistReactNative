// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import type { Node } from "react";
import React, { useContext } from "react";
import {
  Dialog, Paragraph, Portal
} from "react-native-paper";

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
          <Button onPress={hideDialog} text={t( "Cancel" )} level="primary" />
          <Button
            onPress={deleteObservation}
            text={t( "Yes-delete-observation" )}
            level="primary"
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteObservationDialog;

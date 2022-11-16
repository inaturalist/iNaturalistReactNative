// @flow

import { deleteObservation } from "api/observations";
import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import {
  Dialog, Paragraph, Portal
} from "react-native-paper";
import useAuthenticatedMutation from "sharedHooks/useAuthenticatedMutation";

type Props = {
  deleteDialogVisible: boolean,
  hideDialog: Function
}

const DeleteObservationDialog = ( {
  deleteDialogVisible,
  hideDialog
}: Props ): Node => {
  const {
    // deleteCurrentObservation,
    currentObservation
  } = useContext( ObsEditContext );

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        // delete from realm
        hideDialog( );
      }
    }
  );

  // const deleteObservation = async ( ) => {
  //   deleteCurrentObservation( );
  //   hideDialog( );
  // };

  return (
    <Portal>
      <Dialog visible={deleteDialogVisible} onDismiss={hideDialog}>
        <Dialog.Content>
          <Paragraph>{t( "Are-you-sure" )}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog} text={t( "Cancel" )} level="primary" />
          <Button
            onPress={( ) => deleteObservationMutation.mutate( { uuid: currentObservation.uuid } )}
            text={t( "Yes-delete-observation" )}
            level="primary"
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteObservationDialog;

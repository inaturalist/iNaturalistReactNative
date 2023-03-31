// @flow

import { useNavigation } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { deleteObservation } from "api/observations";
import { Button } from "components/SharedComponents";
import { Text } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { Dialog, Portal } from "react-native-paper";
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
    deleteLocalObservation,
    currentObservation
  } = useContext( ObsEditContext );
  const navigation = useNavigation( );
  const queryClient = useQueryClient( );
  const { uuid } = currentObservation;

  const handleLocalDeletion = ( ) => {
    deleteLocalObservation( uuid );
    hideDialog( );
    navigation.navigate( "ObsList" );
  };

  const deleteObservationMutation = useAuthenticatedMutation(
    ( params, optsWithAuth ) => deleteObservation( params, optsWithAuth ),
    {
      onSuccess: ( ) => {
        handleLocalDeletion( );
        queryClient.invalidateQueries( { queryKey: ["searchObservations"] } );
      }
    }
  );

  return (
    <Portal>
      <Dialog visible={deleteDialogVisible} onDismiss={hideDialog}>
        <Dialog.Content>
          <Text>{t( "Are-you-sure" )}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={hideDialog} text={t( "Cancel" )} level="focus" className="m-0.5" />
          <Button
            onPress={( ) => {
              if ( !currentObservation._synced_at ) {
                handleLocalDeletion( );
              } else {
                deleteObservationMutation.mutate( { uuid } );
              }
            }}
            text={t( "Yes-delete-observation" )}
            level="focus"
            className="m-0.5"
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DeleteObservationDialog;

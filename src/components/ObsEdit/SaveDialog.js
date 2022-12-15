// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { Text } from "components/styledComponents";
import { t } from "i18next";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext } from "react";
import { Dialog, Portal } from "react-native-paper";

type Props = {
  showSaveDialog: boolean,
  discardChanges: Function
}

const SaveDialog = ( {
  showSaveDialog,
  discardChanges
}: Props ): Node => {
  const {
    saveObservation
  } = useContext( ObsEditContext );

  return (
    <Portal>
      <Dialog visible={showSaveDialog} onDismiss={discardChanges}>
        <Dialog.Content>
          <Text>{t( "You-have-unsaved-changes" )}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button
            onPress={discardChanges}
            text={t( "Discard-Changes" )}
            level="primary"
            className="m-0.5"
          />
          <Button
            onPress={saveObservation}
            text={t( "Save" )}
            level="primary"
            className="m-0.5"
          />
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SaveDialog;

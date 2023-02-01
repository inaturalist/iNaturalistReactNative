// @flow

import { Button } from "components/SharedComponents";
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
    saveObservation,
    observations
  } = useContext( ObsEditContext );

  const singleObservationWarning = ( ) => (
    <>
      <Dialog.Content>
        <Text className="pt-10">{t( "You-have-unsaved-changes" )}</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          onPress={discardChanges}
          text={t( "Discard-Changes" )}
          level="warning"
          className="m-0.5"
        />
        <Button
          onPress={saveObservation}
          text={t( "Save" )}
          level="focus"
          className="m-0.5"
        />
      </Dialog.Actions>
    </>
  );

  const multipleObservationWarning = ( ) => (
    <>
      <Dialog.Content>
        <Text className="pt-10">
          {t( "You-will-lose-all-existing-observations", { count: observations.length } )}
        </Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          onPress={discardChanges}
          text={t( "Discard-X-Observations", { count: observations.length } )}
          level="warning"
          className="m-0.5"
        />
        <Button
          onPress={saveObservation}
          text={t( "Cancel" )}
          level="focus"
          className="m-0.5"
        />
      </Dialog.Actions>
    </>
  );

  return (
    <Portal>
      <Dialog visible={showSaveDialog} onDismiss={discardChanges}>
        {observations.length > 1
          ? multipleObservationWarning( )
          : singleObservationWarning( )}
      </Dialog>
    </Portal>
  );
};

export default SaveDialog;

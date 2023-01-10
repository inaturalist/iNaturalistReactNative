// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

type Props = {
  uploadObservations: Function
}

const UploadPrompt = ( { uploadObservations }: Props ): Node => {
  const numUnuploadedObs = useNumUnuploadedObservations( );
  return (
    <>
      <Text>{t( "Whenever-you-get-internet-connection-you-can-upload" )}</Text>
      <Button
        level="neutral"
        text={t( "UPLOAD-X-OBSERVATIONS", { count: numUnuploadedObs } )}
        className="py-1 mt-5"
        onPress={( ) => {
          uploadObservations( );
        }}
      />

    </>
  );
};

export default UploadPrompt;

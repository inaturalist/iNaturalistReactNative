// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

type Props = {
  numOfUnuploadedObs: number,
  updateUploadStatus: Function,
  uploadObservations: Function
}

const UploadPrompt = ( {
  uploadObservations, numOfUnuploadedObs, updateUploadStatus
}: Props ): Node => (
  <>
    <Text>{t( "Whenever-you-get-internet-connection-you-can-upload" )}</Text>
    <Button
      level="neutral"
      text={t( "UPLOAD-X-OBSERVATIONS", { count: numOfUnuploadedObs } )}
      className="py-1 mt-5"
      onPress={( ) => {
        updateUploadStatus( );
        uploadObservations( );
      }}
    />

  </>
);

export default UploadPrompt;

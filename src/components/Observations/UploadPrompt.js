// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";

import Button from "../SharedComponents/Buttons/Button";

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
      text={t( "Upload-X-Observations", { count: numOfUnuploadedObs } )}
      onPress={( ) => {
        updateUploadStatus( );
        uploadObservations( );
      }}
    />

  </>
);

export default UploadPrompt;

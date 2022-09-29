// @flow

import Button from "components/SharedComponents/Buttons/Button";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import viewStyles from "styles/upload/uploadPrompt";

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
      style={viewStyles.button}
      onPress={( ) => {
        updateUploadStatus( );
        uploadObservations( );
      }}
    />

  </>
);

export default UploadPrompt;

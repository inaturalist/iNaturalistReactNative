// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import { Button } from "react-native-paper";

import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/observations/obsList";

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
      buttonColor={colors.logInGray}
      textColor={colors.white}
      style={viewStyles.grayButton}
      labelStyle={textStyles.grayButtonText}
      onPress={( ) => {
        updateUploadStatus( );
        uploadObservations( );
      }}
    >
      {t( "Upload-X-Observations", { count: numOfUnuploadedObs } )}
    </Button>
  </>
);

export default UploadPrompt;

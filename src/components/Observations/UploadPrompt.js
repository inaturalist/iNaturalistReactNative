// @flow

import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text } from "react-native";
import { Button } from "react-native-paper";

import Observation from "../../models/Observation";
import uploadObservation from "../../providers/uploadHelpers/uploadObservation";
import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/observations/obsList";

type Props = {
  obsToUpload: Array<Object>
}

const UploadPrompt = ( { obsToUpload }: Props ): Node => {
  const numObsToUpload = obsToUpload?.length;

  const uploadObservations = ( ) => obsToUpload.forEach( obs => {
    const mappedObs = Observation.mapObservationForUpload( obs );
    uploadObservation( mappedObs, obs );
  } );

  return (
    <>
      <Text>{t( "Whenever-you-get-internet-connection-you-can-upload" )}</Text>
      <Button
        buttonColor={colors.logInGray}
        textColor={colors.white}
        style={viewStyles.grayButton}
        labelStyle={textStyles.grayButtonText}
        onPress={uploadObservations}
      >
        {t( "Upload-X-Observations", { count: numObsToUpload } )}
      </Button>
    </>
  );
};

export default UploadPrompt;

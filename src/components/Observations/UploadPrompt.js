// @flow

import { Button } from "components/SharedComponents";
import { t } from "i18next";
import type { Node } from "react";
import React from "react";
import { Text, View } from "react-native";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";

type Props = {
  startUpload: Function
}

const UploadPrompt = ( { startUpload }: Props ): Node => {
  const numUnuploadedObs = useNumUnuploadedObservations( );
  return (
    <View testID="UploadPrompt">
      <Text>{t( "Whenever-you-get-internet-connection-you-can-upload" )}</Text>
      <Button
        level="neutral"
        text={t( "UPLOAD-X-OBSERVATIONS", { count: numUnuploadedObs } )}
        className="py-1 mt-5"
        onPress={startUpload}
      />
    </View>
  );
};

export default UploadPrompt;

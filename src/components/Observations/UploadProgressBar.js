// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { t } from "i18next";
import type { Node } from "react";
import React, { useMemo, useRef } from "react";
import {
  Button, ProgressBar, Text
} from "react-native-paper";
import useNumUnuploadedObservations from "sharedHooks/useNumUnuploadedObservations";
import { textStyles, viewStyles } from "styles/observations/uploadProgressBar";
import colors from "styles/tailwindColors";

type Props = {
  allObsToUpload: Array<Object>,
  stopUpload: () => void
}

const UploadProgressBar = ( {
  allObsToUpload,
  stopUpload
}: Props ): Node => {
  const numUnuploadedObs = useNumUnuploadedObservations( );
  const totalObsToUpload = Math.max( allObsToUpload.length, numUnuploadedObs );

  const calculateProgress = ( ) => ( totalObsToUpload - numUnuploadedObs ) / totalObsToUpload;

  const progressFraction = calculateProgress( );

  const sheetRef = useRef( null );

  const snapPoints = useMemo( () => ["25%"], [] );

  // eslint-disable-next-line react/jsx-no-useless-fragment
  const noHandle = ( ) => <></>;

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints}
      handleComponent={noHandle}
      backgroundStyle={viewStyles.bottomSheet}
    >
      <BottomSheetView style={viewStyles.grayContainer}>
        <Button
          icon="close-circle"
          onPress={stopUpload}
          textColor={colors.white}
          style={viewStyles.closeButton}
        />
        <Text style={textStyles.whiteText} variant="titleMedium">
          {t( "Uploading-X-Observations", { count: numUnuploadedObs } )}
        </Text>
        <ProgressBar
          progress={progressFraction}
          style={viewStyles.progressBar}
          color={colors.white}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

export default UploadProgressBar;

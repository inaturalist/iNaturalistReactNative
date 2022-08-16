// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { t } from "i18next";
import type { Node } from "react";
import React, { useMemo, useRef } from "react";
import {
  Button, ProgressBar, Text
} from "react-native-paper";

import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/observations/uploadProgressBar";
import useUploadObservations from "./hooks/useUploadObservations";

type Props = {
  unuploadedObsList: Array<Object>,
  allObsToUpload: Array<Object>
}

const UploadProgressBar = ( { unuploadedObsList, allObsToUpload }: Props ): Node => {
  const numOfUnuploadedObs = unuploadedObsList.length;
  const totalObsToUpload = Math.max( allObsToUpload.length, unuploadedObsList.length );

  const calculateProgress = ( ) => ( totalObsToUpload - numOfUnuploadedObs ) / totalObsToUpload;

  const progressFraction = calculateProgress( );

  const {
    handleClosePress,
    status
  } = useUploadObservations( allObsToUpload );

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
          onPress={handleClosePress}
          textColor={colors.white}
          style={viewStyles.closeButton}
        />
        <Text style={textStyles.whiteText} variant="titleMedium">
          {t( "Uploading-X-Observations", { count: numOfUnuploadedObs } )}
        </Text>
        <ProgressBar
          progress={progressFraction}
          style={viewStyles.progressBar}
          color={colors.white}
        />
        {status === "failure" && (
          <Text style={textStyles.whiteText} variant="titleMedium">
            {t( "Error-Couldnt-Complete-Upload" )}
          </Text>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
};

export default UploadProgressBar;

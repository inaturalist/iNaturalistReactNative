// @flow

import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { t } from "i18next";
import type { Node } from "react";
import React, {
  useCallback, useEffect, useMemo, useRef, useState
} from "react";
import {
  Button, ProgressBar, Text
} from "react-native-paper";

import Observation from "../../models/Observation";
import uploadObservation from "../../providers/uploadHelpers/uploadObservation";
import colors from "../../styles/colors";
import { textStyles, viewStyles } from "../../styles/observations/uploadProgressBar";

type Props = {
  uploadStatus: Object
}

const UploadProgressBar = ( { uploadStatus }: Props ): Node => {
  const { allObsToUpload, unuploadedObs, totalObsToUpload } = uploadStatus;
  const numOfUnuploadedObs = unuploadedObs?.length;
  const [cancelUpload, setCancelUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [status, setStatus] = useState( null );

  const calculateProgress = ( ) => ( totalObsToUpload - numOfUnuploadedObs ) / totalObsToUpload;
  const progressFraction = calculateProgress( );

  useEffect( ( ) => {
    const upload = async obs => {
      const mappedObs = Observation.mapObservationForUpload( obs );
      const uploadSuccess = await uploadObservation( mappedObs, obs );
      if ( uploadSuccess !== "success" ) {
        setStatus( uploadSuccess );
        return;
      }
      if ( currentUploadIndex < allObsToUpload.length - 1 ) {
        setCurrentUploadIndex( currentUploadIndex + 1 );
      }
    };

    if ( !cancelUpload ) {
      upload( allObsToUpload[currentUploadIndex] );
    }
  }, [cancelUpload, currentUploadIndex, allObsToUpload] );

  const sheetRef = useRef( null );

  const snapPoints = useMemo( () => ["25%"], [] );

  const handleClosePress = useCallback( () => {
    setCancelUpload( true );
    setStatus( null );
  }, [] );

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

// @flow

import { useCallback, useEffect, useState } from "react";

import uploadObservation from "../../../providers/uploadHelpers/uploadObservation";

const useUploadObservations = ( uploadStatus: Object ): Object => {
  const { allObsToUpload, unuploadedObs, totalObsToUpload } = uploadStatus;
  const numOfUnuploadedObs = unuploadedObs?.length;
  const [cancelUpload, setCancelUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [status, setStatus] = useState( null );

  const calculateProgress = ( ) => ( totalObsToUpload - numOfUnuploadedObs ) / totalObsToUpload;
  const progressFraction = calculateProgress( );

  const handleClosePress = useCallback( ( ) => {
    setCancelUpload( true );
    setStatus( null );
  }, [] );

  useEffect( ( ) => {
    const upload = async obs => {
      console.log( obs, "obs for upload" );
      uploadObservation( obs );
    };
    if ( currentUploadIndex < allObsToUpload.length - 1 ) {
      setCurrentUploadIndex( currentUploadIndex + 1 );
    }

    if ( !cancelUpload ) {
      upload( allObsToUpload[currentUploadIndex] );
    }
  }, [cancelUpload, currentUploadIndex, allObsToUpload] );

  return {
    handleClosePress,
    status,
    progressFraction
  };
};

export default useUploadObservations;

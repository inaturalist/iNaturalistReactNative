// @flow

import { useCallback, useEffect, useState } from "react";

import uploadObservation from "../../../providers/uploadHelpers/uploadObservation";

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const [cancelUpload, setCancelUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [status, setStatus] = useState( null );

  const handleClosePress = useCallback( ( ) => {
    setCancelUpload( true );
    setStatus( null );
  }, [] );

  useEffect( ( ) => {
    const upload = async obs => {
      const response = await uploadObservation( obs );
      if ( response.status !== 200 ) {
        setStatus( "failure" );
      }
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
    status
  };
};

export default useUploadObservations;

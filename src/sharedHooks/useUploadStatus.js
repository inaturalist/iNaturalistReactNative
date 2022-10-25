// @flow

import { useCallback, useState } from "react";

const useUploadStatus = ( ): Object => {
  const [uploadInProgress, setUploadInProgress] = useState( false );

  const updateUploadStatus = useCallback( ( ) => {
    if ( uploadInProgress === false ) {
      setUploadInProgress( true );
    }
  }, [uploadInProgress] );

  return {
    updateUploadStatus,
    uploadInProgress
  };
};

export default useUploadStatus;

// @flow

import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import useApiToken from "sharedHooks/useApiToken";

const { useRealm } = RealmContext;

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const [cancelUpload, setCancelUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const realm = useRealm( );
  const apiToken = useApiToken( );

  const handleClosePress = useCallback( ( ) => {
    setCancelUpload( true );
  }, [] );

  useEffect( ( ) => {
    const upload = async obs => {
      if ( !apiToken ) return;
      await Observation.uploadObservation( obs, apiToken, realm );
    };
    if ( currentUploadIndex < allObsToUpload.length - 1 ) {
      setCurrentUploadIndex( currentUploadIndex + 1 );
    }

    if ( !cancelUpload ) {
      upload( allObsToUpload[currentUploadIndex] );
    }
  }, [
    allObsToUpload,
    apiToken,
    cancelUpload,
    currentUploadIndex,
    realm
  ] );

  return {
    handleClosePress
  };
};

export default useUploadObservations;

// @flow

import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import useApiToken from "sharedHooks/useApiToken";

const { useRealm } = RealmContext;

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const [uploadInProgress, setUploadInProgress] = useState( false );
  const [shouldUpload, setShouldUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const realm = useRealm();
  const apiToken = useApiToken();

  const cleanup = ( ) => {
    setUploadInProgress( false );
    setShouldUpload( false );
    setCurrentUploadIndex( 0 );
  };

  useEffect( ( ) => {
    const upload = async observationToUpload => {
      await Observation.uploadObservation( observationToUpload, apiToken, realm );
      setCurrentUploadIndex( currentIndex => currentIndex + 1 );
    };

    const observationToUpload = allObsToUpload[currentUploadIndex];
    const continueUpload = shouldUpload && observationToUpload && !!apiToken;

    if ( !continueUpload ) {
      cleanup( );
      return;
    }
    setUploadInProgress( true );
    upload( observationToUpload );
  }, [
    allObsToUpload,
    apiToken,
    shouldUpload,
    currentUploadIndex,
    realm
  ] );

  return {
    uploadInProgress,
    stopUpload: cleanup,
    startUpload: ( ) => setShouldUpload( true )
  };
};

export default useUploadObservations;

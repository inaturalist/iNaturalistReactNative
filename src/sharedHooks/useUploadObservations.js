// @flow

import {
  activateKeepAwake,
  deactivateKeepAwake
} from "@sayem314/react-native-keep-awake";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import Observation from "realmModels/Observation";
import useApiToken from "sharedHooks/useApiToken";
import useUploadProgress from "sharedHooks/useUploadProgress";

const { useRealm } = RealmContext;

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const [uploadInProgress, setUploadInProgress] = useState( false );
  const [shouldUpload, setShouldUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [progress, setProgress] = useState( 0 );
  const [error, setError] = useState( null );
  const realm = useRealm( );
  const apiToken = useApiToken( );
  const [totalUploadCount, setTotalUploadCount] = useState( 0 );
  const { setObservationProgress } = useUploadProgress();

  const cleanup = ( ) => {
    setUploadInProgress( false );
    setShouldUpload( false );
    setCurrentUploadIndex( 0 );
    setError( null );
    deactivateKeepAwake( );
    setProgress( 0 );
    setTotalUploadCount( 0 );
  };

  useEffect( ( ) => {
    const upload = async observationToUpload => {
      const increment = ( 1 / allObsToUpload.length ) / 2;
      setProgress( currentProgress => currentProgress + increment );

      setObservationProgress( observationToUpload.uuid, 0.5 );
      try {
        await Observation.uploadObservation(
          observationToUpload,
          apiToken,
          realm
        );
      } catch ( e ) {
        console.warn( e );
        setError( e.message );
        setObservationProgress( observationToUpload.uuid, 0 );
      }
      setProgress( currentProgress => {
        if ( currentUploadIndex === allObsToUpload.length - 1 ) {
          return 1;
        }
        return currentProgress + increment;
      } );
      setCurrentUploadIndex( currentIndex => currentIndex + 1 );
      setObservationProgress( observationToUpload.uuid, 1 );
    };

    const observationToUpload = allObsToUpload[currentUploadIndex];
    const continueUpload = shouldUpload && observationToUpload && !!apiToken;

    if ( !continueUpload ) {
      cleanup( );
      return;
    }

    setTotalUploadCount( allObsToUpload.length );
    activateKeepAwake( );
    setUploadInProgress( true );
    upload( observationToUpload );
  }, [
    allObsToUpload,
    apiToken,
    shouldUpload,
    currentUploadIndex,
    realm,
    setObservationProgress
  ] );

  return {
    uploadInProgress,
    error,
    progress,
    stopUpload: cleanup,
    currentUploadIndex,
    totalUploadCount,
    startUpload: ( ) => {
      setShouldUpload( true );
      allObsToUpload.forEach( observation => {
        setObservationProgress( observation.uuid, 0 );
      } );
    }
  };
};

export default useUploadObservations;

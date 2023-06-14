// @flow

import {
  activateKeepAwake,
  deactivateKeepAwake
} from "@sayem314/react-native-keep-awake";
import { ObsEditContext } from "providers/contexts";
import { useContext, useEffect, useState } from "react";
import useApiToken from "sharedHooks/useApiToken";

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const obsEditContext = useContext( ObsEditContext );
  const uploadObservation = obsEditContext?.uploadObservation;
  const [uploadInProgress, setUploadInProgress] = useState( false );
  const [shouldUpload, setShouldUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [error, setError] = useState( null );
  const [uploads, setUploads] = useState( [] );
  const [uploadedUUIDs, setUploadedUUIDS] = useState( [] );
  const apiToken = useApiToken( );

  const cleanup = ( ) => {
    setUploadInProgress( false );
    setShouldUpload( false );
    setCurrentUploadIndex( 0 );
    setError( null );
    deactivateKeepAwake( );
  };

  useEffect( ( ) => {
    const upload = async observationToUpload => {
      setUploadedUUIDS( [
        ...uploadedUUIDs,
        observationToUpload.uuid
      ] );
      try {
        await uploadObservation( observationToUpload );
      } catch ( e ) {
        console.warn( e );
        setError( e.message );
      }
      setCurrentUploadIndex( currentIndex => currentIndex + 1 );
    };

    const observationToUpload = allObsToUpload[currentUploadIndex];
    const continueUpload = shouldUpload && observationToUpload && !!apiToken;

    if ( !continueUpload ) {
      return;
    }

    if ( allObsToUpload.length >= uploads.length ) {
      setUploads( allObsToUpload );
    }
    activateKeepAwake( );
    setUploadInProgress( true );
    // only try to upload every observation once
    if ( !uploadedUUIDs.includes( observationToUpload.uuid ) ) {
      upload( observationToUpload );
    }
  }, [
    uploadedUUIDs,
    allObsToUpload,
    apiToken,
    shouldUpload,
    currentUploadIndex,
    uploads,
    uploadObservation
  ] );

  // // Fake upload in progress
  // return {
  //   uploadInProgress: true,
  //   error: null,
  //   progress: 0.5,
  //   stopUpload: cleanup,
  //   currentUploadIndex: 0,
  //   totalUploadCount: 1,
  //   startUpload: ( ) => setShouldUpload( true ),
  //   allObsToUpload: [{}, {}, {}, {}]
  // };

  // // Fake error state
  // return {
  //   uploadInProgress: false,
  //   error: "Something went terribly wrong",
  //   progress: 0,
  //   stopUpload: cleanup,
  //   currentUploadIndex: 0,
  //   totalUploadCount: 1,
  //   startUpload: ( ) => setShouldUpload( true ),
  //   allObsToUpload: [{},{},{},{}]
  // };

  return {
    uploadInProgress,
    error,
    stopUpload: cleanup,
    currentUploadIndex,
    startUpload: ( ) => setShouldUpload( true ),
    allObsToUpload
  };
};

export default useUploadObservations;

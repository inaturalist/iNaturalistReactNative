// @flow

import { useCallback, useEffect, useState } from "react";

import { RealmContext } from "../../../../providers/contexts";
import uploadObservation from "../../../../providers/uploadHelpers/uploadObservation";
import useApiToken from "../../../../sharedHooks/useApiToken";

const { useRealm } = RealmContext;

const useUploadObservations = ( allObsToUpload: Array<Object> ): Object => {
  const [cancelUpload, setCancelUpload] = useState( false );
  const [currentUploadIndex, setCurrentUploadIndex] = useState( 0 );
  const [status, setStatus] = useState( null );
  const realm = useRealm( );
  const apiToken = useApiToken( );

  const handleClosePress = useCallback( ( ) => {
    setCancelUpload( true );
    setStatus( null );
  }, [] );

  useEffect( ( ) => {
    const upload = async obs => {
      if ( !apiToken ) return;
      const response = await uploadObservation( obs, realm, apiToken );
      if ( response.results ) { return; }
      if ( response.status !== 200 ) {
        const error = JSON.parse( response );
        // guard against 500 errors / server downtime errors
        if ( error?.url?.includes( "observation_photos" ) ) {
          setStatus( "photoFailure" );
        } else {
          setStatus( "failure" );
        }
      }
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
    handleClosePress,
    status
  };
};

export default useUploadObservations;

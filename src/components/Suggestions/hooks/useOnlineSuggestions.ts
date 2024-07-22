import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { computerVisionPath } from "appConstants/paths.ts";
import { FileUpload } from "inaturalistjs";
import {
  useCallback, useEffect, useMemo, useState
} from "react";
import RNFS from "react-native-fs";
import resizeImage from "sharedHelpers/resizeImage.ts";
import {
  useAuthenticatedQuery,
  useIsConnected
} from "sharedHooks";
import useStore from "stores/useStore";

const SCORE_IMAGE_TIMEOUT = 5_000;

const outputPath = computerVisionPath;

type FlattenUploadArgs = {
  image: {
    uri: string,
    name: string,
    type: string
  }
}

const flattenUploadParams = async (
  uri: string
): Promise<FlattenUploadArgs> => {
  await RNFS.mkdir( outputPath );
  const uploadUri = await resizeImage( uri, {
    // this max width/height is the same as the legacy Android app
    // we always want the width/height to be bigger than 299x299
    // and want to preserve the aspect ratio (not crunch the image down into a square)
    // for the best results
    width: 640,
    outputPath
  } );

  const params: FlattenUploadArgs = {
    image: new FileUpload( {
      uri: uploadUri,
      name: "photo.jpeg",
      type: "image/jpeg"
    } )
  };

  return params;
};

type OnlineSuggestionsResponse = {
  dataUpdatedAt: Date,
  onlineSuggestions: Object,
  loadingOnlineSuggestions: boolean,
  timedOut: boolean,
  error: Object,
  removePrevQuery: Function
  isRefetching: boolean
}

const useOnlineSuggestions = (
  selectedPhotoUri: string,
  options: Object
): OnlineSuggestionsResponse => {
  const currentObservation = useStore( state => state.currentObservation );
  const {
    shouldUseEvidenceLocation,
    shouldFetchOnlineSuggestions
  } = options;

  const queryClient = useQueryClient( );
  const queryKey = useMemo( ( ) => ["scoreImage", selectedPhotoUri], [selectedPhotoUri] );
  const [timedOut, setTimedOut] = useState( false );
  const isOnline = useIsConnected( );
  const [flattenedUploadParams, setFlattenedUploadParams] = useState( null );

  async function queryFn( optsWithAuth ) {
    const params = flattenedUploadParams;
    const { latitude, longitude } = currentObservation;
    if ( shouldUseEvidenceLocation ) {
      if ( latitude ) {
        params.lat = latitude;
      }
      if ( longitude ) {
        params.lng = longitude;
      }
    } else if ( params.lat ) {
      delete params.lat;
      delete params.lng;
    }
    console.log( params, "params for upload", selectedPhotoUri, shouldUseEvidenceLocation );
    return scoreImage( params, optsWithAuth );
  }

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    fetchStatus,
    error
  } = useAuthenticatedQuery(
    queryKey,
    queryFn,
    {
      enabled: !!shouldFetchOnlineSuggestions
        && !!( flattenedUploadParams?.image ),
      allowAnonymousJWT: true
    }
  );

  const setImageParams = useCallback( async ( ) => {
    const newImageParams = await flattenUploadParams( selectedPhotoUri );
    setFlattenedUploadParams( newImageParams );
  }, [selectedPhotoUri] );

  useEffect( ( ) => {
    setImageParams( );
  }, [setImageParams] );

  // Give up on suggestions request after a timeout
  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, queryKey, queryClient] );

  const resetImageParams = useCallback( async ( ) => {
    queryClient.removeQueries( { queryKey } );
    setTimedOut( false );
    await setImageParams( );
  }, [setImageParams, queryClient, queryKey] );

  const removePrevQuery = useCallback( async ( ) => {
    queryClient.removeQueries( { queryKey } );
    setTimedOut( false );
    // refetch( );
  }, [queryClient, queryKey] );

  useEffect( () => {
    if ( isOnline === false ) {
      setTimedOut( true );
    }
  }, [isOnline] );

  const queryObject = {
    dataUpdatedAt,
    error,
    timedOut,
    removePrevQuery,
    resetImageParams,
    fetchStatus
  };

  return timedOut
    ? {
      ...queryObject,
      onlineSuggestions: undefined
    }
    : {
      ...queryObject,
      onlineSuggestions
    };
};

export default useOnlineSuggestions;

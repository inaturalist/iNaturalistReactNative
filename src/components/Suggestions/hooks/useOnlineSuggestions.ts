import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { computerVisionPath } from "appConstants/paths.ts";
import { FileUpload } from "inaturalistjs";
import { useEffect, useState } from "react";
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
  },
  lat?: number,
  lng?: number
}

const flattenUploadParams = async (
  uri: string,
  latitude?: number,
  longitude?: number
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
  if ( latitude ) {
    params.lat = latitude;
  }
  if ( longitude ) {
    params.lng = longitude;
  }
  return params;
};

type OnlineSuggestionsResponse = {
  dataUpdatedAt: Date,
  onlineSuggestions: Object,
  loadingOnlineSuggestions: boolean,
  timedOut: boolean,
  error: Object,
  refetchSuggestions: Function
  isRefetching: boolean
}

const useOnlineSuggestions = (
  selectedPhotoUri: string,
  options: Object
): OnlineSuggestionsResponse => {
  const currentObservation = useStore( state => state.currentObservation );
  const {
    showSuggestionsWithLocation,
    usingOfflineSuggestions,
    hasPermissions
  } = options;

  const params = showSuggestionsWithLocation
    ? {
      latitude: currentObservation?.latitude,
      longitude: currentObservation?.longitude
    }
    : null;

  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const isOnline = useIsConnected( );

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    fetchStatus,
    error
  } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => {
      const scoreImageParams = await flattenUploadParams(
        selectedPhotoUri,
        params?.latitude,
        params?.longitude
      );
      return scoreImage( scoreImageParams, optsWithAuth );
    },
    {
      enabled: !!selectedPhotoUri
        && usingOfflineSuggestions === false
        && hasPermissions !== undefined,
      allowAnonymousJWT: true
    }
  );

  // Give up on suggestions request after a timeout
  useEffect( ( ) => {
    const timer = setTimeout( ( ) => {
      if ( onlineSuggestions === undefined ) {
        queryClient.cancelQueries( { queryKey: ["scoreImage", selectedPhotoUri] } );
        setTimedOut( true );
      }
    }, SCORE_IMAGE_TIMEOUT );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [onlineSuggestions, selectedPhotoUri, queryClient] );

  const refetchSuggestions = async ( ) => {
    setTimedOut( false );
    await queryClient.refetchQueries( { queryKey: ["scoreImage", selectedPhotoUri] } );
  };

  useEffect( () => {
    if ( isOnline === false ) {
      setTimedOut( true );
    }
  }, [isOnline] );

  const queryObject = {
    dataUpdatedAt,
    error,
    timedOut,
    refetchSuggestions,
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

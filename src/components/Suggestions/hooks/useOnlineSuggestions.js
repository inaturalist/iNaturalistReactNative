// @flow

import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import { FileUpload } from "inaturalistjs";
import { useEffect, useState } from "react";
import RNFS from "react-native-fs";
import Photo from "realmModels/Photo";
import resizeImage from "sharedHelpers/resizeImage.ts";
import {
  useAuthenticatedQuery,
  useIsConnected
} from "sharedHooks";
import useStore from "stores/useStore";

const SCORE_IMAGE_TIMEOUT = 5_000;

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
  const outputPath = `${RNFS.DocumentDirectoryPath}/computerVisionSuggestions`;
  await RNFS.mkdir( outputPath );
  const uploadUri = await resizeImage( uri, {
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
  error: Object
}

const useOnlineSuggestions = (
  selectedPhotoUri: string
): OnlineSuggestionsResponse => {
  const currentObservation = useStore( state => state.currentObservation );
  const options = {
    latitude: currentObservation?.latitude,
    longitude: currentObservation?.longitude
  };
  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const isOnline = useIsConnected( );

  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    dataUpdatedAt,
    isLoading: loadingOnlineSuggestions,
    isError,
    error
  } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => {
      const scoreImageParams = await flattenUploadParams(
        // Ensure that if this URI is a remote thumbnail that we are resizing
        // a reasonably-sized image and not deliverying a handful of
        // upsampled pixels
        Photo.displayMediumPhoto( selectedPhotoUri ),
        options?.latitude,
        options?.longitude
      );
      return scoreImage( scoreImageParams, optsWithAuth );
    },
    {
      enabled: !!selectedPhotoUri,
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

  useEffect( () => {
    if ( isOnline === false ) {
      setTimedOut( true );
    }
  }, [isOnline] );

  return timedOut
    ? {
      dataUpdatedAt,
      error,
      onlineSuggestions: undefined,
      loadingOnlineSuggestions: false,
      timedOut
    }
    : {
      dataUpdatedAt,
      error,
      onlineSuggestions,
      loadingOnlineSuggestions: loadingOnlineSuggestions && !isError,
      timedOut
    };
};

export default useOnlineSuggestions;

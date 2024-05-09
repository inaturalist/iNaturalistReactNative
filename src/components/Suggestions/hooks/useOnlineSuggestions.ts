import { useQueryClient } from "@tanstack/react-query";
import scoreImage from "api/computerVision";
import computerVisionPath from "appConstants/paths.ts";
import { FileUpload } from "inaturalistjs";
import { useEffect, useMemo, useState } from "react";
import RNFS from "react-native-fs";
import Photo from "realmModels/Photo";
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

  const queryClient = useQueryClient( );
  const [timedOut, setTimedOut] = useState( false );
  const isOnline = useIsConnected( );

  const scoreImageParams = useMemo( async ( ) => {
    const options = {
      latitude: currentObservation?.latitude,
      longitude: currentObservation?.longitude
    };

    const imageParams = await flattenUploadParams(
      // Ensure that if this URI is a remote thumbnail that we are resizing
      // a reasonably-sized image and not deliverying a handful of
      // upsampled pixels
      Photo.displayMediumPhoto( selectedPhotoUri ),
      options?.latitude,
      options?.longitude
    );
    return imageParams;
  }, [currentObservation, selectedPhotoUri] );

  const imageName = scoreImageParams?.image?.uri?.split( "computerVisionSuggestions/" )[1];

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
    ["scoreImage", imageName],
    async optsWithAuth => scoreImage( scoreImageParams, optsWithAuth ),
    {
      enabled: !!imageName,
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

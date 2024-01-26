// @flow

import ImageResizer from "@bam.tech/react-native-image-resizer";
import scoreImage from "api/computerVision";
import { FileUpload } from "inaturalistjs";
import { useEffect, useState } from "react";
import Photo from "realmModels/Photo";
import {
  useAuthenticatedQuery
} from "sharedHooks";

const resizeImage = async (
  path: string,
  width: number,
  height?: number,
  outputPath?: string
): Promise<string> => {
  // Note that the default behavior of this library is to resize to contain,
  // i.e. it will not adjust aspect ratio
  const { uri } = await ImageResizer.createResizedImage(
    path,
    width,
    height || width, // height
    "JPEG", // compressFormat
    100, // quality
    0, // rotation
    // $FlowFixMe
    outputPath, // outputPath
    true // keep metadata
  );

  return uri;
};

type FlattenUploadArgs = {
  image: any,
  lat?: number,
  lng?: number
}

const flattenUploadParams = async (
  uri: string,
  latitude?: number,
  longitude?: number
): Promise<FlattenUploadArgs> => {
  const uploadUri = await resizeImage( uri, 640 );

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
  onlineSuggestions: Object,
  loadingOnlineSuggestions: boolean,
  timedOut: boolean
}

const useOnlineSuggestions = (
  selectedPhotoUri: string,
  options?: {
    latitude?: number,
    longitude?: number
  }
): OnlineSuggestionsResponse => {
  const [timedOut, setTimedOut] = useState( false );
  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    isLoading: loadingOnlineSuggestions,
    isError
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

  useEffect( ( ) => {
    const timer = setTimeout( ( ) => setTimedOut( true ), 2000 );

    return ( ) => {
      clearTimeout( timer );
    };
  }, [] );

  return {
    onlineSuggestions: !timedOut && onlineSuggestions,
    loadingOnlineSuggestions: !timedOut && ( loadingOnlineSuggestions && !isError ),
    timedOut
  };
};

export default useOnlineSuggestions;

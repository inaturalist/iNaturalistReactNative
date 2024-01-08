// @flow

import ImageResizer from "@bam.tech/react-native-image-resizer";
import scoreImage from "api/computerVision";
import { FileUpload } from "inaturalistjs";
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
  try {
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
  } catch ( e ) {
    return "";
  }
};

type ScoreImageParams = {
  image: any,
  lat?: number,
  lng?: number
}

const flattenUploadParams = async (
  uri: string,
  latitude?: number,
  longitude?: number
): Promise<ScoreImageParams> => {
  const uploadUri = await resizeImage( uri, 640 );

  const params: ScoreImageParams = {
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
  loadingOnlineSuggestions: boolean
}

const useOnlineSuggestions = (
  selectedPhotoUri: string,
  options?: {
    latitude?: number,
    longitude?: number
  }
): OnlineSuggestionsResponse => {
  // TODO if this is a remote observation with an `id` param, use
  // scoreObservation instead so we don't have to spend time resizing and
  // uploading images
  const {
    data: onlineSuggestions,
    isLoading: loadingOnlineSuggestions,
    isError
  } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        // Ensure that if this URI is a remote thumbnail that we are resizing
        // a reasonably-sized image and not deliverying a handful of
        // upsampled pixels
        Photo.displayMediumPhoto( selectedPhotoUri ),
        options?.latitude,
        options?.longitude
      ),
      optsWithAuth
    ),
    {
      enabled: !!selectedPhotoUri,
      retry: 2
    }
  );

  return {
    onlineSuggestions,
    loadingOnlineSuggestions: loadingOnlineSuggestions && !isError
  };
};

export default useOnlineSuggestions;

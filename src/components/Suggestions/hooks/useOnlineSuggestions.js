// @flow

import scoreImage from "api/computerVision";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery
} from "sharedHooks";
import useStore from "stores/useStore";

const useOnlineSuggestions = ( selectedPhotoUri: string ): {
  onlineSuggestions: Array<Object>,
  loadingOnlineSuggestions: boolean
} => {
  const currentObservation = useStore( state => state.currentObservation );

  const uploadParams = {
    image: selectedPhotoUri,
    latitude: currentObservation?.latitude,
    longitude: currentObservation?.longitude
  };

  const {
    data: onlineSuggestions,
    isLoading: loadingOnlineSuggestions
  } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        uploadParams.image,
        uploadParams.latitude,
        uploadParams.longitude
      ),
      optsWithAuth
    ),
    {
      enabled: !!selectedPhotoUri
    }
  );

  return {
    onlineSuggestions,
    loadingOnlineSuggestions
  };
};

export default useOnlineSuggestions;

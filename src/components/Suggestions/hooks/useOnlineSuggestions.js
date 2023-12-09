// @flow

import scoreImage from "api/computerVision";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery
} from "sharedHooks";
import useStore from "stores/useStore";

const useOnlineSuggestions = ( selectedPhotoUri: string, offlineSuggestions: Array<Object> ): {
  onlineSuggestions: Array<Object>,
  loadingOnlineSuggestions: boolean
} => {
  const currentObservation = useStore( state => state.currentObservation );

  const {
    data: onlineSuggestions,
    isLoading: loadingOnlineSuggestions
  } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        selectedPhotoUri,
        currentObservation?.latitude,
        currentObservation?.longitude
      ),
      optsWithAuth
    ),
    {
      enabled: !!(
        selectedPhotoUri && offlineSuggestions.length === 0 )
    }
  );

  return {
    onlineSuggestions,
    loadingOnlineSuggestions
  };
};

export default useOnlineSuggestions;

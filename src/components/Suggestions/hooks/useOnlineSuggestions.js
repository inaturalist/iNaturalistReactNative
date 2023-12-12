// @flow

import scoreImage from "api/computerVision";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery
} from "sharedHooks";
import useStore from "stores/useStore";

const useOnlineSuggestions = ( selectedPhotoUri: string, options: Object ): {
  onlineSuggestions: Array<Object>,
  loadingOnlineSuggestions: boolean
} => {
  const currentObservation = useStore( state => state.currentObservation );
  const { tryOnlineSuggestions } = options;

  const {
    data: onlineSuggestions,
    isLoading
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
        selectedPhotoUri && tryOnlineSuggestions )
    }
  );

  return {
    onlineSuggestions,
    loadingOnlineSuggestions: tryOnlineSuggestions
      ? isLoading
      : false
  };
};

export default useOnlineSuggestions;

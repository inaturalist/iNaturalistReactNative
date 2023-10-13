// @flow

import scoreImage from "api/computerVision";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useState } from "react";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery,
  useLocalObservation
} from "sharedHooks";

import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const {
    photoEvidenceUris,
    currentObservation,
    createId,
    loading,
    comment
  } = useContext( ObsEditContext );
  const uuid = currentObservation?.uuid;
  const localObservation = useLocalObservation( uuid );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoEvidenceUris[0] );

  const params = {
    image: selectedPhotoUri,
    latitude: localObservation?.latitude || currentObservation?.latitude,
    longitude: localObservation?.longitude || currentObservation?.longitude
  };

  const { data: nearbySuggestions, isLoading: loadingSuggestions } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        params.image,
        params.latitude,
        params.longitude
      ),
      optsWithAuth
    ),
    {
      enabled: !!selectedPhotoUri
    }
  );

  return (
    <Suggestions
      photoUris={photoEvidenceUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      onTaxonChosen={
        identification => createId( identification )
      }
      comment={comment}
      loading={loading}
      nearbySuggestions={nearbySuggestions}
      loadingSuggestions={loadingSuggestions && photoEvidenceUris.length > 0}
    />
  );
};

export default SuggestionsContainer;

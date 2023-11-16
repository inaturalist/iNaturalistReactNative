// @flow

import scoreImage from "api/computerVision";
import { difference } from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
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
    comment,
    setPhotoEvidenceUris
  } = useContext( ObsEditContext );
  const uuid = currentObservation?.uuid;
  const obsPhotos = currentObservation?.observationPhotos;
  const obsPhotoUris = ( obsPhotos || [] ).map(
    obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath
  );
  const localObservation = useLocalObservation( uuid );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoEvidenceUris[0] );

  useEffect( ( ) => {
    // If the photos are different, we need to display different photos
    // (probably b/c we're looking at a different observation)
    if ( difference( obsPhotoUris, photoEvidenceUris ).length > 0 ) {
      setPhotoEvidenceUris( obsPhotoUris );
      // And if the photos have changed, we should show results for the first
      // one
      setSelectedPhotoUri( obsPhotoUris[0] );
    }
  }, [
    obsPhotoUris,
    photoEvidenceUris,
    setPhotoEvidenceUris
  ] );

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
      onTaxonChosen={createId}
      comment={comment}
      loading={loading}
      nearbySuggestions={nearbySuggestions}
      loadingSuggestions={loadingSuggestions && photoEvidenceUris.length > 0}
    />
  );
};

export default SuggestionsContainer;

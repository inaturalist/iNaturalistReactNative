// @flow

import { useNavigation, useRoute } from "@react-navigation/native";
import scoreImage from "api/computerVision";
import { difference } from "lodash";
import { ObsEditContext } from "providers/contexts";
import type { Node } from "react";
import React, {
  useContext, useEffect, useState
} from "react";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedQuery,
  useLocalObservation
} from "sharedHooks";

import Suggestions from "./Suggestions";

const SuggestionsContainer = ( ): Node => {
  const {
    createId,
    currentObservation,
    photoEvidenceUris,
    setPhotoEvidenceUris
  } = useContext( ObsEditContext );
  const { params } = useRoute( );
  const obsUUID = params?.obsUUID;
  const uuid = currentObservation?.uuid;
  // TODO unify around a single interface for an Observation
  const obsPhotos = currentObservation?.observationPhotos || currentObservation?.observation_photos;
  const obsPhotoUris = ( obsPhotos || [] ).map(
    obsPhoto => obsPhoto.photo?.url || obsPhoto.photo?.localFilePath
  );
  const localObservation = useLocalObservation( uuid );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoEvidenceUris[0] );
  const [loading, setLoading] = useState( false );
  const navigation = useNavigation();

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

  const uploadParams = {
    image: selectedPhotoUri,
    latitude: localObservation?.latitude || currentObservation?.latitude,
    longitude: localObservation?.longitude || currentObservation?.longitude
  };

  const { data: nearbySuggestions, isLoading: loadingSuggestions } = useAuthenticatedQuery(
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

  const onTaxonChosen = async taxon => {
    if ( !obsUUID ) {
      setLoading( true );
      await createId( taxon );
      setLoading( false );
      navigation.goBack( );
    } else {
      navigation.navigate( "ObsDetails", { uuid: obsUUID, taxonSuggested: taxon } );
    }
  };

  return (
    <Suggestions
      currentObservation={currentObservation}
      loading={loading}
      loadingSuggestions={loadingSuggestions && photoEvidenceUris.length > 0}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={onTaxonChosen}
      photoUris={photoEvidenceUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
    />
  );
};

export default SuggestionsContainer;

// @flow

import { useNavigation } from "@react-navigation/native";
import scoreImage from "api/computerVision";
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
    setComment
  } = useContext( ObsEditContext );
  const uuid = currentObservation?.uuid;
  const localObservation = useLocalObservation( uuid );
  const wasSynced = localObservation?.wasSynced( );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( photoEvidenceUris[0] );

  const navigation = useNavigation( );

  const params = {
    image: selectedPhotoUri,
    latitude: localObservation?.latitude || currentObservation?.latitude,
    longitude: localObservation?.longitude || currentObservation?.longitude
  };

  const { data: nearbySuggestions } = useAuthenticatedQuery(
    ["scoreImage", params.image],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        params.image,
        params.latitude,
        params.longitude
      ),
      optsWithAuth
    )
  );

  useEffect(
    ( ) => {
      navigation.addListener( "blur", ( ) => {
        setComment( "" );
      } );
    },
    [navigation, setComment]
  );

  return (
    <Suggestions
      photoUris={photoEvidenceUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      onTaxonChosen={
        identification => createId( identification )
      }
      setComment={setComment}
      comment={comment}
      wasSynced={wasSynced}
      loading={loading}
      nearbySuggestions={nearbySuggestions}
    />
  );
};

export default SuggestionsContainer;

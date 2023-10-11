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

type Props = {
  route: {
    params: {
      observationUUID?: string,
      createRemoteIdentification?: boolean
    },
  },
};

const SuggestionsContainer = ( { route }: Props ): Node => {
  const [comment, setComment] = useState( "" );
  const {
    photoEvidenceUris,
    currentObservation,
    createId,
    loading
  } = useContext( ObsEditContext );
  const observationUUID = route?.params?.observationUUID;
  const createRemoteIdentification = route?.params?.createRemoteIdentification;
  const localObservation = useLocalObservation( observationUUID );
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
    [navigation]
  );

  return (
    <Suggestions
      photoUris={photoEvidenceUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      onTaxonChosen={
        identification => {
          createId( identification, comment, createRemoteIdentification );
        }
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

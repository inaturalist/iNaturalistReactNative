// @flow

import { useNavigation } from "@react-navigation/native";
import scoreImage from "api/computerVision";
import { createIdentification } from "api/identifications";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import uuid from "react-native-uuid";
import flattenUploadParams from "sharedHelpers/flattenUploadParams";
import {
  useAuthenticatedMutation,
  useAuthenticatedQuery,
  useCurrentUser,
  useLocalObservation,
  useTranslation
} from "sharedHooks";

import Suggestions from "./Suggestions";

const { useRealm } = RealmContext;

type Props = {
  route: {
    params: {
      observationUUID?: string,
      createRemoteIdentification?: boolean,
      belongsToCurrentUser?: boolean
    },
  },
};

const SuggestionsContainer = ( { route }: Props ): Node => {
  const [comment, setComment] = useState( "" );
  const {
    updateObservationKeys,
    mediaViewerUris
  } = useContext( ObsEditContext );
  const currentUser = useCurrentUser( );
  const realm = useRealm( );
  const observationUUID = route?.params?.observationUUID;
  const createRemoteIdentification = route?.params?.createRemoteIdentification;
  const belongsToCurrentUser = route?.params?.belongsToCurrentUser;
  const localObservation = useLocalObservation( observationUUID );
  const { t } = useTranslation( );
  const [selectedPhotoUri, setSelectedPhotoUri] = useState( mediaViewerUris[0] );

  const navigation = useNavigation( );

  const { data: nearbySuggestions } = useAuthenticatedQuery(
    ["scoreImage", selectedPhotoUri],
    async optsWithAuth => scoreImage(
      await flattenUploadParams(
        selectedPhotoUri
        // latitude,
        // longitude,
        // observedOn
      ),
      optsWithAuth
    )
  );

  console.log( nearbySuggestions, "nearby suggestions" );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const createIdentificationMutation = useAuthenticatedMutation(
    ( idParams, optsWithAuth ) => createIdentification( idParams, optsWithAuth ),
    {
      onSuccess: data => {
        if ( belongsToCurrentUser ) {
          realm?.write( ( ) => {
            const localIdentifications = localObservation?.identifications;
            const newIdentification = data[0];
            newIdentification.user = currentUser;
            newIdentification.taxon = realm?.objectForPrimaryKey(
              "Taxon",
              newIdentification.taxon.id
            ) || newIdentification.taxon;
            const realmIdentification = realm?.create( "Identification", newIdentification );
            localIdentifications.push( realmIdentification );
          } );
        }
        // navigate back to ObsDetails
        navigation.goBack( );
      },
      onError: e => {
        let error = null;
        if ( e ) {
          error = t( "Couldnt-create-identification-error", { error: e.message } );
        } else {
          error = t( "Couldnt-create-identification-unknown-error" );
        }
        showErrorAlert( error );
      }
    }
  );

  const formatIdentification = taxon => {
    const newIdent = {
      uuid: uuid.v4(),
      body: comment,
      taxon
    };

    return newIdent;
  };

  const createId = identification => {
    const newIdentification = formatIdentification( identification );
    if ( createRemoteIdentification ) {
      createIdentificationMutation.mutate( {
        identification: {
          observation_id: observationUUID,
          taxon_id: newIdentification.taxon.id,
          body: newIdentification.body
        }
      } );
    } else {
      updateObservationKeys( {
        taxon: newIdentification.taxon
      } );
      navigation.goBack( );
    }
  };

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
      photoUris={mediaViewerUris}
      selectedPhotoUri={selectedPhotoUri}
      setSelectedPhotoUri={setSelectedPhotoUri}
      nearbySuggestions={nearbySuggestions}
      onTaxonChosen={createId}
      setComment={setComment}
      comment={comment}
    />
  );
};

export default SuggestionsContainer;

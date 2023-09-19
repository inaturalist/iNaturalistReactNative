// @flow

import { useNavigation } from "@react-navigation/native";
import { createIdentification } from "api/identifications";
import { ObsEditContext, RealmContext } from "providers/contexts";
import type { Node } from "react";
import React, { useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import uuid from "react-native-uuid";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useLocalObservation,
  useTranslation
} from "sharedHooks";

import AddID from "./AddID";

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

const AddIDContainer = ( { route }: Props ): Node => {
  const [comment, setComment] = useState( "" );
  const [loading, setLoading] = useState( false );
  const [taxonSearch, setTaxonSearch] = useState( "" );
  const {
    updateObservationKeys
  } = useContext( ObsEditContext );
  const currentUser = useCurrentUser( );
  const realm = useRealm( );
  const observationUUID = route?.params?.observationUUID;
  const createRemoteIdentification = route?.params?.createRemoteIdentification;
  const belongsToCurrentUser = route?.params?.belongsToCurrentUser;
  const localObservation = useLocalObservation( observationUUID );
  const { t } = useTranslation( );

  const navigation = useNavigation( );

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
    setLoading( true );
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
        setTaxonSearch( "" );
        setComment( "" );
        setLoading( false );
      } );
    },
    [navigation]
  );

  return (
    <AddID
      setComment={setComment}
      comment={comment}
      taxonSearch={taxonSearch}
      setTaxonSearch={setTaxonSearch}
      createId={createId}
      loading={loading}
    />
  );
};

export default AddIDContainer;

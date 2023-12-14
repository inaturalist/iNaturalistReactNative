// @flow
import {
  faveObservation,
  unfaveObservation
} from "api/observations";
import _ from "lodash";
import type { Node } from "react";
import React, {
  useCallback, useMemo,
  useState
} from "react";
import { Alert } from "react-native";
import {
  useAuthenticatedMutation,
  useCurrentUser,
  useTranslation
} from "sharedHooks";

import PhotoDisplay from "./PhotoDisplay";

type Props = {
  observation: Object,
  refetchRemoteObservation: Function,
  isOnline: boolean,
  belongsToCurrentUser: boolean
}

const PhotoDisplayContainer = ( {
  observation, refetchRemoteObservation, isOnline, belongsToCurrentUser
}: Props ): Node => {
  const currentUser = useCurrentUser( );
  const userId = currentUser?.id;
  const { t } = useTranslation( );
  const observationId = observation?.id;

  const faves = observation?.faves;
  const uuid = observation?.uuid;

  const currentUserFaved = useCallback( ( ) => {
    if ( faves?.length > 0 ) {
      const userFaved = faves.find( fave => fave.user_id === userId );
      return !!userFaved;
    }
    return null;
  }, [faves, userId] );

  const [userFav, setUserFav] = useState( currentUserFaved( ) || false );

  const showErrorAlert = error => Alert.alert( "Error", error, [{ text: t( "OK" ) }], {
    cancelable: true
  } );

  const createUnfaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => unfaveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => refetchRemoteObservation( ),
      onError: error => {
        showErrorAlert( error );
        setUserFav( true );
      }
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => refetchRemoteObservation( ),
      onError: error => {
        showErrorAlert( error );
        setUserFav( false );
      }
    }
  );

  const faveOrUnfave = useCallback( ( ) => {
    if ( userFav ) {
      setUserFav( false );
      createUnfaveMutation.mutate( { uuid } );
    } else {
      setUserFav( true );
      createFaveMutation.mutate( { uuid } );
    }
  }, [createFaveMutation, createUnfaveMutation, userFav, uuid] );

  const photos = useMemo(
    ( ) => _.compact(
      Array.from(
        observation?.observationPhotos || observation?.observation_photos || []
      ).map(
        // TODO replace this hack. Without this you get errors about the
        // photo objects being invalidated down in PhotoScroll, but the
        // questions remains, why are these objects getting invalidated in
        // the first place? We are not deleting them, so what's happening
        // to them and why?
        op => (
          op.photo.toJSON
            ? op.photo.toJSON( )
            : op.photo
        )
      )
    ),
    [observation]
  );

  return (
    <PhotoDisplay
      faveOrUnfave={faveOrUnfave}
      userFav={userFav}
      photos={photos}
      observation={observation}
      isOnline={isOnline}
      belongsToCurrentUser={belongsToCurrentUser}
      observationId={observationId}
    />
  );
};

export default PhotoDisplayContainer;

// @flow
import {
  faveObservation,
  unfaveObservation
} from "api/observations";
import classNames from "classnames";
import {
  INatIconButton
} from "components/SharedComponents";
import type { Node } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  useAuthenticatedMutation,
  useTranslation
} from "sharedHooks";
import colors from "styles/tailwindColors";

type Props = {
  observation: Object,
  currentUser?: Object,
  afterToggleFave: ( wasFaved: boolean ) => void,
  top?: boolean
}

const FaveButton = ( {
  observation,
  currentUser,
  afterToggleFave = ( ) => { },
  top = false
}: Props ): Node => {
  const { t } = useTranslation( );
  const { uuid } = observation;

  const observationFaved = useMemo( ( ) => {
    if ( currentUser && observation?.faves?.length > 0 ) {
      const viewerFaved = observation?.faves.find( fave => fave.user_id === currentUser.id );
      return !!viewerFaved;
    }
    return null;
  }, [
    currentUser,
    observation
  ] );

  const [isFaved, setIsFaved] = useState( observationFaved || false );

  const showErrorAlert = error => {
    let msg = error?.json?.errors.map( err => err.message ).join( "; " );
    if ( error.status === 401 ) {
      msg = t( "You-need-log-in-to-do-that" );
    }
    Alert.alert(
      t( "Error-title" ),
      msg,
      [{ text: t( "OK" ) }],
      { cancelable: true }
    );
  };

  const createUnfaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => unfaveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => afterToggleFave( false ),
      onError: error => {
        showErrorAlert( error );
        setIsFaved( true );
      }
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => afterToggleFave( true ),
      onError: error => {
        showErrorAlert( error );
        setIsFaved( false );
      }
    }
  );

  const toggleFave = useCallback( ( ) => {
    if ( !currentUser ) return;

    if ( isFaved ) {
      setIsFaved( false );
      createUnfaveMutation.mutate( { uuid } );
    } else {
      setIsFaved( true );
      createFaveMutation.mutate( { uuid } );
    }
  }, [
    currentUser,
    createFaveMutation,
    createUnfaveMutation,
    isFaved,
    uuid
  ] );

  return (
    <INatIconButton
      icon={isFaved
        ? "star"
        : "star-bold-outline"}
      size={25}
      onPress={toggleFave}
      color={colors.white}
      className={classNames( "absolute bottom-3 right-3", {
        "top-3": top
      } )}
      accessibilityLabel={isFaved
        ? t( "Remove-favorite" )
        : t( "Add-favorite" )}
    />
  );
};

export default FaveButton;

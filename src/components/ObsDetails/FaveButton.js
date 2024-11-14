// @flow
import {
  faveObservation,
  unfaveObservation
} from "api/observations";
import classNames from "classnames";
import {
  ActivityIndicator,
  INatIconButton
} from "components/SharedComponents";
import {
  View
} from "components/styledComponents";
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
  afterToggleFave: Function,
  top?: boolean
}

const FaveButton = ( {
  observation,
  currentUser,
  afterToggleFave = ( ) => undefined,
  top = false
}: Props ): Node => {
  const { t } = useTranslation( );
  const uuid = observation?.uuid;
  const [loading, setLoading] = useState( false );

  const observationFaved = useMemo( ( ) => {
    if ( !observation ) return null;
    const faves = observation.votes?.filter( vote => vote?.vote_scope === null ) || [];

    if ( currentUser && faves.length > 0 ) {
      const viewerFaved = faves.find( fave => fave.user_id === currentUser.id );
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
      onSuccess: ( ) => {
        afterToggleFave( false );
        setLoading( false );
      },
      onError: error => {
        showErrorAlert( error );
        setIsFaved( true );
        setLoading( false );
      }
    }
  );

  const createFaveMutation = useAuthenticatedMutation(
    ( faveOrUnfaveParams, optsWithAuth ) => faveObservation( faveOrUnfaveParams, optsWithAuth ),
    {
      onSuccess: ( ) => {
        afterToggleFave( true );
        setLoading( false );
      },
      onError: error => {
        showErrorAlert( error );
        setIsFaved( false );
        setLoading( false );
      }
    }
  );

  const toggleFave = useCallback( ( ) => {
    if ( !currentUser ) return;
    setLoading( true );
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

  if ( !observation ) {
    return null;
  }

  return (
    <View
      className={classNames( "absolute right-3 w-[44px] h-[44px] justify-center", {
        "top-0": top,
        "bottom-3": !top
      } )}
    >
      {
        loading
          ? <ActivityIndicator size={25} />
          : (
            <INatIconButton
              icon={isFaved
                ? "star"
                : "star-bold-outline"}
              size={25}
              onPress={toggleFave}
              color={colors.white}
              accessibilityLabel={isFaved
                ? t( "Remove-favorite" )
                : t( "Add-favorite" )}
            />
          )
      }
    </View>
  );
};

export default FaveButton;

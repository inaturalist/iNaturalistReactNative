// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";
import NetInfo from "@react-native-community/netinfo";

import Observation from "../../../models/Observation";
import { FIELDS, USER_FIELDS } from "../../../providers/fields";
import { getUsername } from "../../LoginSignUp/AuthenticationService";

const useRemoteObservation = ( observation: Object, refetch: boolean ): Object => {
  const [remoteObservation, setRemoteObservation] = useState( null );
  const [isConnected, setIsConnected] = useState( null );
  const [currentUserFaved, setCurrentUserFaved] = useState( null );
  const [isCurrentUserObservation, setIsCurrentUserObservation] = useState( false );

  useEffect( ( ) => {
    const unsubscribe = NetInfo.addEventListener( state => {
      setIsConnected( state.isConnected );
    } );

    // Unsubscribe
    unsubscribe( );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchObservation = async ( ) => {
      try {
        const currentUserLogin = await getUsername( );

        const params = {
          fields: FIELDS
        };

        // $FlowFixMe
        params.fields.application = {
          icon: true,
          name: true,
          url: true
        };

        // $FlowFixMe
        params.fields.faves = {
          user: USER_FIELDS
        };

        const response = await inatjs.observations.fetch( observation.uuid, params );
        const results = response.results;
        const obs = Observation.mimicRealmMappedPropertiesSchema( results[0] );
        if ( !isCurrent ) { return; }
        if ( obs.faves ) {
          const userFavedObs = obs.faves.find( fave =>fave.user.login === currentUserLogin );
          if ( userFavedObs ) {
            setCurrentUserFaved( true );
          } else {
            setCurrentUserFaved( false );
          }
        }
        setRemoteObservation( obs );
        if ( currentUserLogin === obs.user.login ) {
          setIsCurrentUserObservation( true );
        }
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch observation with uuid ${observation.uuid}: `, e.message, );
      }
    };

    // TODO: probably need an error message for no connectivity
    if ( isConnected ) {
      fetchObservation( );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [observation, isConnected, refetch] );

  return {
    remoteObservation,
    currentUserFaved,
    isCurrentUserObservation
  };
};

export {
  useRemoteObservation
};

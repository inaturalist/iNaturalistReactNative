// @flow

import NetInfo from "@react-native-community/netinfo";
import { getUsername } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";
import { useEffect, useRef, useState } from "react";
import Observation from "realmModels/Observation";
import User from "realmModels/User";

const useRemoteObservation = ( observation: Object, refetch: boolean ): Object => {
  const [remoteObservation, setRemoteObservation] = useState( null );
  const [isConnected, setIsConnected] = useState( null );
  const [currentUserFaved, setCurrentUserFaved] = useState( null );
  const prevRefetch = useRef( refetch ).current;

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
          fields: Observation.FIELDS
        };

        // $FlowFixMe
        params.fields.application = {
          icon: true,
          name: true,
          url: true
        };

        // $FlowFixMe
        params.fields.faves = {
          user: User.USER_FIELDS
        };

        const response = await inatjs.observations.fetch( observation.uuid, params );
        const { results } = response;
        const obs = Observation.mimicRealmMappedPropertiesSchema( results[0] );
        if ( !isCurrent ) { return; }
        if ( obs.faves ) {
          const userFavedObs = obs.faves.find( fave => fave.user.login === currentUserLogin );
          if ( userFavedObs ) {
            setCurrentUserFaved( true );
          } else {
            setCurrentUserFaved( false );
          }
        }
        setRemoteObservation( obs );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch observation with uuid ${observation.uuid}: `, e.message );
      }
    };

    // TODO: probably need an error message for no connectivity
    if ( isConnected && ( !observation || refetch !== prevRefetch ) ) {
      fetchObservation( );
    }

    return ( ) => {
      isCurrent = false;
    };
  }, [observation, isConnected, refetch, prevRefetch] );

  return {
    remoteObservation,
    currentUserFaved
  };
};

export default useRemoteObservation;

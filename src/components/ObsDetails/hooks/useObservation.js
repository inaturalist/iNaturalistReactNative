// @flow

import { useEffect, useState, useRef, useCallback } from "react";
import inatjs from "inaturalistjs";
import NetInfo from "@react-native-community/netinfo";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import { FIELDS, USER_FIELDS } from "../../../providers/fields";
import { getUsername } from "../../../components/LoginSignUp/AuthenticationService";


const useObservation = ( uuid: string, refetch: boolean ): Object => {
  const [observation, setObservation] = useState( null );
  const [isConnected, setIsConnected] = useState( null );
  const [currentUserFaved, setCurrentUserFaved] = useState( null );
  const [isCurrentUserObservation, setIsCurrentUserObservation] = useState( false );

  const realmRef = useRef( null );

  const openObservationFromRealm = useCallback( async ( ) => {
    const realm = await Realm.open( realmConfig );
    realmRef.current = realm;

    try {
      const obs = realm.objectForPrimaryKey( "Observation", uuid );
      setObservation( obs );
      setIsCurrentUserObservation( true );
    } catch ( e ) {
      console.log( `Error finding Observation with primary key: ${uuid} `, e.message );
    }
  }, [realmRef, uuid] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
  }, [realmRef] );

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

        const response = await inatjs.observations.fetch( uuid, params );
        const results = response.results;
        if ( results.length === 0 ) {
          openObservationFromRealm( );
          return;
        }
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
        setObservation( obs );
        if ( currentUserLogin === obs.user.login ) {
          setIsCurrentUserObservation( true );
        }
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        // try to open from realm: this is for observations that still need to be uploaded
        openObservationFromRealm( );
        console.log( `Couldn't fetch observation with uuid ${uuid}: `, e.message, );
      }
    };

    if ( isConnected === false ) {
      openObservationFromRealm( );
    } else if ( isConnected ) {
      fetchObservation( );
    }

    return ( ) => {
      isCurrent = false;
      closeRealm( );
    };
  }, [uuid, openObservationFromRealm, closeRealm, isConnected, refetch] );

  return {
    observation,
    currentUserFaved,
    isCurrentUserObservation
  };
};

export {
  useObservation
};

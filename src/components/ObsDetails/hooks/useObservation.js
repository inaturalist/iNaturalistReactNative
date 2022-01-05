// @flow

import { useEffect, useState, useRef, useCallback } from "react";
import inatjs from "inaturalistjs";
import NetInfo from "@react-native-community/netinfo";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import { FIELDS } from "../../../providers/helpers";

const useObservation = ( uuid: string ): Object => {
  const [observation, setObservation] = useState( null );
  const [isConnected, setIsConnected] = useState( null );

  const realmRef = useRef( null );

  const openObservationFromRealm = useCallback( async ( ) => {
    const realm = await Realm.open( realmConfig );
    realmRef.current = realm;

    try {
      const obs = realm.objectForPrimaryKey( "Observation", uuid );
      setObservation( obs );
    }
    catch ( err ) {
      console.error( `Error finding Observation with primary key: ${uuid} `, err.message );
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
        const params = {
          fields: FIELDS
        };
        const response = await inatjs.observations.fetch( uuid, params );
        const results = response.results;
        const obs = Observation.copyRealmSchema( results[0] );
        if ( !isCurrent ) { return; }
        setObservation( obs );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
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
      closeRealm;
    };
  }, [uuid, openObservationFromRealm, closeRealm, isConnected] );

  return observation;
};

export {
  useObservation
};

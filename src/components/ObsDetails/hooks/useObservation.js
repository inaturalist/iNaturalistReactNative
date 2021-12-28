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

  const realmRef = useRef( null );

  const openObservationFromRealm = useCallback( async ( ) => {
    try {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;
      const obs = realm.objects( "Observation" ).filtered( `uuid = '${uuid}'` );
      setObservation( obs[0] );
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, uuid] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
  }, [realmRef] );

  useEffect( ( ) => {
    let isCurrent = true;
    const { isConnected } = NetInfo;
    // fetch observation with uuid
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
        console.log( "Couldn't fetch observation:", e.message, );
      }
    };

    // if ( isConnected ) {
      fetchObservation( );
    // } else {
    //   // TODO: make sure this works with no internet
    //   // if it does, delete fetchObsFromRealm.js
    //   openObservationFromRealm( );
    //}
    return ( ) => {
      isCurrent = false;
      // closeRealm;
    };
  }, [uuid, openObservationFromRealm, closeRealm] );

  return observation;
};

export {
  useObservation
};

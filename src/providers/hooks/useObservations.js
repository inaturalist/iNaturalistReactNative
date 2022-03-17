// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";
import { FIELDS } from "../helpers";
import { getUsername } from "../../components/LoginSignUp/AuthenticationService";

const useObservations = ( refetch: boolean ): boolean => {
  const [loading, setLoading] = useState( false );
  const realmRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const realm = await Realm.open( realmConfig );
      realmRef.current = realm;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) { return; }
    const realm = realmRef.current;
    results.forEach( obs => {
      const newObs = Observation.createObservationForRealm( obs, realm );
      realm?.write( ( ) => {
        // To upsert an object, call Realm.create() with the update mode set
        // to modified. The operation either inserts a new object with the given primary key
        // or updates an existing object that already has that primary key.
        realm?.create( "Observation", newObs, "modified" );
      } );
    } );
    setLoading( false );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      const userLogin = await getUsername( );
      console.log( userLogin, "user login fetch observations" );
      if ( !userLogin ) { return; }
      setLoading( true );
      try {
        const params = {
          user_id: userLogin,
          per_page: 100,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations:", e.message, );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [writeToDatabase, refetch] );

  return loading;
};

export default useObservations;

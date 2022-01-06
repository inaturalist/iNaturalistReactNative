// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";
import Taxon from "../../models/Taxon";
import User from "../../models/User";
import { FIELDS } from "../helpers";

const useObservations = ( ): boolean => {
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
        const existingObs = realm.objectForPrimaryKey( "Observation", obs.uuid );
        if ( existingObs !== undefined ) {
          // TODO: modify existing objects when syncing from inatjs
          return;
        }
        realm?.create( "Observation", newObs );
        // need to append Taxon object to identifications after the Observation object
        // has been created with its own Taxon object, otherwise will run into errors
        // with realm trying to create a Taxon object with an existing primary key
        obs.identifications.forEach( id => {
          const identification = realm.objectForPrimaryKey( "Identification", id.uuid );
          identification.taxon = Taxon.mapApiToRealm( id.taxon, realm );
        } );
        // append User object here, otherwise run into errors with realm trying to create
        // User with existing primary key
        // the user will be the same for every observation
        const newlyCreatedObs = realm.objectForPrimaryKey( "Observation", obs.uuid );
        newlyCreatedObs.user = User.mapApiToRealm( obs.user, realm );
      } );
    } );
    setLoading( false );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      setLoading( true );
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
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
        console.trace( e );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [writeToDatabase] );

  return loading;
};

export default useObservations;

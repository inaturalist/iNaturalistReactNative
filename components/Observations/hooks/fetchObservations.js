// @flow

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import Observation from "../../../models/Observation";

const useFetchObservations = ( ): Array<Object> => {
  const [observations, setObservations] = useState( [] );
  const realmRef = useRef( null );
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const config = {
        schema: [Observation.schema]
      };

      const realm = await Realm.open( config );
      realmRef.current = realm;

      const localObservations = realm.objects( "Observation" );
      if ( localObservations?.length ) {
        setObservations( localObservations );
      }
      subscriptionRef.current = localObservations;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setObservations] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setObservations( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  const FIELDS = useMemo( ( ) => {
    const USER_FIELDS = {
      icon_url: true,
      id: true,
      login: true,
      name: true
    };

    const TAXON_FIELDS = {
      default_photo: {
        square_url: true
      },
      iconic_taxon_name: true,
      name: true,
      preferred_common_name: true,
      rank: true,
      rank_level: true
    };

    return {
      comments_count: true,
      created_at: true,
      description: true,
      geojson: true,
      identifications: true,
      latitude: true,
      location: true,
      longitude: true,
      photos: {
        url: true
      },
      place_guess: true,
      quality_grade: true,
      taxon: TAXON_FIELDS,
      time_observed_at: true,
      user: USER_FIELDS
  };
}, [] );

const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) {
      return;
    }
    // Everything in the function passed to "realm.write" is a transaction and will
    // hence succeed or fail together. A transcation is the smallest unit of transfer
    // in Realm so we want to be mindful of how much we put into one single transaction
    // and split them up if appropriate (more commonly seen server side). Since clients
    // may occasionally be online during short time spans we want to increase the probability
    // of sync participants to successfully sync everything in the transaction, otherwise
    // no changes propagate and the transaction needs to start over when connectivity allows.
    const realm = realmRef.current;
    results.forEach( obs => {
      realm?.write( ( ) => {
        const existingObs = realm.objects( "Observation" ).filtered( `uuid = '${obs.uuid}'` );
        if ( existingObs.length > 0 ) {
          return;
        }
        realm?.create( "Observation", new Observation( obs ) );
      } );
    } );
}, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 100,
          // photos: true,
          // details: "all",
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        // console.log( results, "results api" );
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( e, "couldn't fetch observations" );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS, writeToDatabase] );

  return observations;
};

export default useFetchObservations;

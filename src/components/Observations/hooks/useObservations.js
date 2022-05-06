// @flow

import { useEffect, useCallback, useState, useContext } from "react";
import inatjs from "inaturalistjs";
import Observation from "../../../models/Observation";
import { getUsername } from "../../../components/LoginSignUp/AuthenticationService";
import { RealmContext } from "../../../providers/contexts";

const perPage = 6;

const useObservations = ( ): Object => {
  const realm = useContext( RealmContext );
  const [loading, setLoading] = useState( false );
  const [observationList, setObservationList] = useState( [] );
  const nextPageToFetch = observationList.length > 0 ? Math.ceil( observationList.length / perPage ) : 1;
  const [page, setPage] = useState( nextPageToFetch );
  const [userLogin, setUserLogin] = useState( null );
  const [obsToUpload, setObsToUpload] = useState( [] );

  const syncObservations = ( username = null ) => {
    // initial getUsername( ) fetch after login screen wasn't working without
    // passing username as navigation props, likely due to a timing issue
    // so here we're setting userLogin from props instead of from getUsername( )
    // but there's probably a cleaner way to do this
    if ( typeof username === "string" ) {
      setUserLogin( username );
    } else {
      setUserLogin( null );
    }
  };

  const loadObservations = useCallback( async ( ) => {
    // When querying a realm to find objects (e.g. realm.objects('Observation')) the result we get back
    // and the objects in it are "live" and will always reflect the latest state.
    const localObservations = realm?.objects( "Observation" ).sorted( "_created_at", true );
    const notUploadedObs = realm?.objects( "Observation" ).filtered( "_synced_at == null" );

    if ( localObservations?.length ) {
      setObservationList( localObservations );
    }

    if ( notUploadedObs?.length ) {
      setObsToUpload( notUploadedObs );
    }

    try {
      localObservations?.addListener( ( ) => {
        // If you just pass localObservations you end up assigning a Results
        // object to state instead of an array of observations. There's
        // probably a better way...
        setObservationList( localObservations.map( o => o ) );
      } );
    } catch ( err ) {
      console.error( "Unable to update local observations 1: ", err.message );
    }
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localObservations?.removeAllListeners( );
    };
  }, [realm, setObservationList] );

  const clearObservations = useCallback( ( ) => {
    setObservationList( [] );
  }, [setObservationList] );

  useEffect( ( ) => {
    loadObservations( );
    return clearObservations;
  }, [loadObservations, clearObservations] );

  const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) { return; }
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
  }, [realm] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      const username = await getUsername( );
      if ( !userLogin && !username ) { return; }
      setLoading( true );
      try {
        const params = {
          user_id: userLogin || username,
          page,
          per_page: perPage,
          fields: Observation.FIELDS
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
  }, [writeToDatabase, page, userLogin] );

  const fetchNextObservations = ( ) => setPage( page + 1 );

  return {
    loading,
    observationList,
    syncObservations,
    fetchNextObservations,
    obsToUpload
  };
};

export default useObservations;

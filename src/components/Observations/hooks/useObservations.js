// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import { getUsername, getUserId } from "../../../components/LoginSignUp/AuthenticationService";

const perPage = 6;

const useObservations = ( ): Object => {
  const [loading, setLoading] = useState( true );
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

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    // Since this is a non-sync realm, realm will be opened synchronously when calling "Realm.open"
    const realm = await Realm.open( realmConfig );
    realmRef.current = realm;

    // When querying a realm to find objects (e.g. realm.objects('Observation')) the result we get back
    // and the objects in it are "live" and will always reflect the latest state.
    const obs = realm.objects( "Observation" );
    const localObservations = obs.sorted( "_created_at", true );

    // includes obs which have never been synced or which have been updated locally since the last sync
    const notUploadedObs = obs.filtered( "_synced_at == null || _synced_at <= _updated_at" );

    if ( localObservations?.length ) {
      setObservationList( localObservations );
    }

    if ( notUploadedObs?.length ) {
      setObsToUpload( notUploadedObs );
    }

    try {
      localObservations.addListener( ( ) => {
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
      localObservations.removeAllListeners( );
      realm.close( );
    };
  }, [realmRef, setObservationList] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setObservationList( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    const checkForSignedInUser = async ( ) => {
      const userId = await getUserId( );
      if ( userId ) {
        openRealm( );
      }
    };

    checkForSignedInUser( );
    return closeRealm;
  }, [openRealm, closeRealm] );

  const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) { return; }
    const realm = realmRef.current;
    results.forEach( obs => {
      const existingObs = realm?.objectForPrimaryKey( "Observation", obs.uuid );

      if ( existingObs ) {
        // if observation has been updated locally since the last sync, do not overwrite
        // with observation attributes from server
        if ( existingObs._updated_at >= existingObs._synced_at ) {
          return;
        }
      }
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

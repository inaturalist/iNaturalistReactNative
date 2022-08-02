// @flow

import inatjs from "inaturalistjs";
import {
  useCallback, useEffect, useRef, useState
} from "react";
import Realm from "realm";

import realmConfig from "../../../models/index";
import Observation from "../../../models/Observation";
import { getUserId, getUsername } from "../../LoginSignUp/AuthenticationService";

const perPage = 6;

const useObservations = ( ): Object => {
  const [loading, setLoading] = useState( true );
  const [observationList, setObservationList] = useState( [] );
  const nextPageToFetch = observationList.length > 0
    ? Math.ceil( observationList.length / perPage )
    : 1;
  const [page, setPage] = useState( nextPageToFetch );
  const [userLogin, setUserLogin] = useState( null );
  const [uploadStatus, setUploadStatus] = useState( {
    allObsToUpload: [],
    unuploadedObs: [],
    totalObsToUpload: 0,
    uploadInProgress: false
  } );

  const { unuploadedObs } = uploadStatus;
  const numOfUnuploadedObs = unuploadedObs?.length;

  const syncObservations = ( username = null ) => {
    // initial getUsername( ) fetch after login screen wasn't working without
    // passing username as navigation props, likely due to a timing issue
    // so here we're setting userLogin from props instead of from getUsername( )
    // but there's probably a cleaner way to do this
    if ( typeof username === "string" ) {
      setUserLogin( username );
    }
  };

  const checkForUnsyncedObservations = useCallback( obs => {
    // includes obs which have never been synced or which have been updated
    // locally since the last sync
    const unsyncedObs = obs.filtered( "_synced_at == null || _synced_at <= _updated_at" );

    if ( unsyncedObs?.length && unsyncedObs?.length !== numOfUnuploadedObs ) {
      setUploadStatus( {
        ...uploadStatus,
        unuploadedObs: unsyncedObs,
        allObsToUpload: unsyncedObs,
        totalObsToUpload: Math.max( unsyncedObs.length, uploadStatus.totalObsToUpload )
      } );
    }
  }, [uploadStatus, numOfUnuploadedObs] );

  const checkForLoggedOutUser = async ( ) => {
    // don't show activity wheel if user is logged out and API is not called
    const userId = await getUserId( );
    if ( !userId ) {
      setLoading( false );
    }
  };

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const updateObservationState = async ( realm, obs ) => {
      checkForUnsyncedObservations( obs );
      await checkForLoggedOutUser( );
      await Observation.fetchObservationUpdates( realm );
    };

    Realm.open( realmConfig ).then( realm => {
      realmRef.current = realm;

      const obs = realm.objects( "Observation" );
      const localObservations = obs.sorted( "_created_at", true );

      updateObservationState( realm, obs );

      try {
        localObservations.addListener( ( ) => {
          // If you just pass localObservations you end up assigning a Results
          // object to state instead of an array of observations. There's
          // probably a better way...
          if ( localObservations.length !== observationList.length ) {
            if ( !isCurrent ) { return; }
            setObservationList( localObservations.map( o => o ) );
          }
        } );
      } catch ( e ) {
        console.log( `Unable to fetch local observations in addListener: ${e}` );
      }
      // cleanup function
      return ( ) => {
        isCurrent = false;
        // remember to remove listeners to avoid async updates
        realm.removeAllListeners( );
        localObservations.removeAllListeners( );
        realm.close( );
      };
    } );
  }, [checkForUnsyncedObservations, observationList.length] );

  const writeToDatabase = useCallback( results => {
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
        const { results } = response;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observations:", e.message );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [writeToDatabase, page, userLogin] );

  const fetchNextObservations = ( ) => setPage( page + 1 );

  const updateUploadStatus = useCallback( ( ) => {
    if ( uploadStatus.uploadInProgress === false ) {
      setUploadStatus( {
        ...uploadStatus,
        uploadInProgress: true
      } );
    }
  }, [uploadStatus] );

  return {
    loading,
    observationList,
    syncObservations,
    fetchNextObservations,
    updateUploadStatus,
    uploadStatus,
    setUploadStatus
  };
};

export default useObservations;

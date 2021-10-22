// @flow

import { useEffect, useMemo, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import Observation from "../../../models/Observation";

const useFetchObsDetails = ( ): Array<Object> => {
  const [comments, setComments] = useState( [] );
  const realmRef = useRef( null );
  const subscriptionRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    try {
      const config = {
        schema: [Observation.schema]
      };

      const realm = await Realm.open( config );
      realmRef.current = realm;

      const localComments = realm.objects( "Observation" );
      if ( localComments?.length ) {
        setComments( localComments );
      }
      subscriptionRef.current = localComments;
    }
    catch ( err ) {
      console.error( "Error opening realm: ", err.message );
    }
  }, [realmRef, setComments] );

  const closeRealm = useCallback( ( ) => {
    const subscription = subscriptionRef.current;
    subscription?.removeAllListeners( );
    subscriptionRef.current = null;

    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setComments( [] );
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

    const COMMENT_FIELDS = {
      body: true,
      created_at: true,
      id: true,
      user: USER_FIELDS
    };

    return {
      comments: COMMENT_FIELDS
    };
  }, [] );

const writeToDatabase = useCallback( ( results ) => {
    if ( results.length === 0 ) {
      return;
    }
    const realm = realmRef.current;
    results.forEach( comment => {
      realm?.write( ( ) => {

      } );
    } );
}, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchComments = async ( ) => {
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 50,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        console.log( results, "results api" );
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( e, "couldn't fetch comments" );
      }
    };

    fetchComments( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS, writeToDatabase] );

  return [];
};

export default useFetchObsDetails;

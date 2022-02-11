// @flow

import { useEffect, useCallback, useRef, useState } from "react";
import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import Message from "../../models/Message";
import User from "../../models/User";
import { MESSAGE_FIELDS } from "../helpers";

const useMessages = ( ): boolean => {
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
    results.forEach( msg => {
      const newMsg = Message.createMessageForRealm( msg, realm );
      realm?.write( ( ) => {
        const existingMsg = realm.objectForPrimaryKey( "Message", msg.uuid );
        if ( existingMsg !== undefined ) {
          // TODO: modify existing objects when syncing from inatjs
          return;
        }
        realm?.create( "Message", newMsg );
        // append User object here, otherwise run into errors with realm trying to create
        // User with existing primary key
        // the user will be the same for every observation //Q does this relate to messages?
        const newlyCreatedMsg = realm.objectForPrimaryKey( "Message", msg.uuid );
        //Q why do we need this special treatment for users and is this right?
        newlyCreatedMsg.fromUser = User.mapApiToRealm( msg.from_user, realm );
        newlyCreatedMsg.toUser = User.mapApiToRealm( msg.to_user, realm );
      } );
    } );
    setLoading( false );
  }, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchMessages = async ( ) => {
      setLoading( true );
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 100,
          fields: MESSAGE_FIELDS
        };
        const response = await inatjs.messages.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        setLoading( false );
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch messages:", e.message, );
      }
    };

    fetchMessages( );
    return ( ) => {
      isCurrent = false;
    };
  }, [writeToDatabase] );

  return loading;
};

export default useMessages;

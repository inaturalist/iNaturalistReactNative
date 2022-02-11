// @flow
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Node } from "react";
import Realm from "realm";

import realmConfig from "../models/index";
import { MessageContext } from "./contexts";
import useMessages from "./hooks/useMessages";

type Props = {
  children: any
}

const MessageProvider = ( { children }: Props ): Node => {
  const [messageList, setMessageList] = useState( [] );

  // TODO: put this fetch into either a sync button or a pull-from-top gesture
  // instead of automatically fetching every time ObsProvider loads //TODO
  // and add syncing logic to Realm schemas
  const loading = useMessages( );

  // We store a reference to our realm using useRef that allows us to access it via
  // realmRef.current for the component's lifetime without causing rerenders if updated.
  const realmRef = useRef( null );

  const openRealm = useCallback( async ( ) => {
    // Since this is a non-sync realm, realm will be opened synchronously when calling "Realm.open"
    const realm = await Realm.open( realmConfig );
    realmRef.current = realm;

    // When querying a realm to find objects (e.g. realm.objects('Message')) the result we get back
    // and the objects in it are "live" and will always reflect the latest state.
    const localMessages = realm.objects( "Message" );

    if ( localMessages?.length ) {
      setMessageList( localMessages );
    }

    try {
        localMessages.addListener( ( ) => {
        // If you just pass localMessages you end up assigning a Results
        // object to state instead of an array of messages. There's
        // probably a better way...
        setMessageList( localMessages.map( o => o ) );
      } );
    } catch ( err ) {
      console.error( "Unable to update local messages: ", err.message );
    }
    return ( ) => {
      // remember to remove listeners to avoid async updates
      localMessages.removeAllListeners( );
      realm.close( );
    };
  }, [realmRef, setMessageList] );

  const closeRealm = useCallback( ( ) => {
    const realm = realmRef.current;
    realm?.close( );
    realmRef.current = null;
    setMessageList( [] );
  }, [realmRef] );

  useEffect( ( ) => {
    openRealm( );

    // Return a cleanup callback to close the realm to prevent memory leaks
    return closeRealm;
  }, [openRealm, closeRealm] );

  const messageValue = {
    messageList,
    loading
  };

  return (
    <MessageContext.Provider value={messageValue}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageProvider;

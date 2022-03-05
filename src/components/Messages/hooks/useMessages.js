// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import { getJWTToken } from "../../LoginSignUp/AuthenticationService";
import { MESSAGE_FIELDS } from "../../../providers/helpers";

// TODO: need to trigger a rerender on change of user. Right now API parameters not being used.
const useMessages = ( apiParams: Object ): {
  messageList: Array<Object>,
  loading: boolean
} => {
  const [messages, setMessages] = useState( [] );
  const [loading, setLoading] = useState( false );

  console.log( "use messages" );

  useEffect( ( ) => {
    let isCurrent = true;

    const fetchMessages = async ( ) => {
      setLoading( true );
      try {
        const apiToken = await getJWTToken( );
        const options = {
          api_token: apiToken
        };
        const params = {
          page: 1,
          fields: MESSAGE_FIELDS
        };
        const response = await inatjs.messages.search( params, options );
        const { results } = response;
        if ( !isCurrent ) { return; }
        console.log( "Messages returned" );
        setMessages( results );
        setLoading( false );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch messages:", e.message, );
        setLoading( false );
      }
    };

    fetchMessages( );
    return ( ) => {
      isCurrent = false;
    };
  }, [apiParams] );

  return { messages, loading };
};

export default useMessages;

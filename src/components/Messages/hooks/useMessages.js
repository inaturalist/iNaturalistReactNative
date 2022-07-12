// @flow

import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";

import MESSAGE_FIELDS from "../../../providers/fields";
import { getJWTToken } from "../../LoginSignUp/AuthenticationService";

const useMessages = ( ): {
  messages: Array<Object>,
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
        console.log( "Couldn't fetch messages:", e.message );
        setLoading( false );
      }
    };

    fetchMessages( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return { messages, loading };
};

export default useMessages;

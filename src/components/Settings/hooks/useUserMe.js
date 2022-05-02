import inatjs from "inaturalistjs";
import {useEffect, useState} from "react";

const useUserMe = ( accessToken: string ): Array<Object> => {
  const [result, setResult] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchSearchResults = async ( ) => {
      try {
        const response = await inatjs.users.me( {api_token: accessToken} );
        if ( !isCurrent ) { return; }
        setResult( response.results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch search results:", e.message, );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) { return; }
    fetchSearchResults( );
    return ( ) => {
      isCurrent = false;
    };
  }, [accessToken] );

  return result;
};

export default useUserMe;

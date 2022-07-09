// @flow

import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

const useUserMe = ( accessToken: string ): Array<Object> | null => {
  const [result, setResult] = useState( null );

  useEffect( ( ): function => {
    let isCurrent = true;
    const cleanUp = ( ) => {
      isCurrent = false;
    };
    const fetchSearchResults = async ( ) => {
      try {
        const response = await inatjs.users.me( {
          api_token: accessToken,
          fields:
          "all"
        } );
        if ( !isCurrent ) { return; }
        setResult( response.results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.error( e );
        Alert.alert(
          "Error",
          "Couldn't retrieve user details!",
          [{ text: "OK" }],
          {
            cancelable: true
          }
        );
      }
    };

    // don't bother to fetch search results if there isn't a query
    if ( !accessToken ) { return cleanUp; }
    fetchSearchResults( );
    return cleanUp;
  }, [accessToken] );

  return result;
};

export default useUserMe;

// @flow

import { useEffect, useState } from "react";

import { getJWTToken } from "../components/LoginSignUp/AuthenticationService";
import useCurrentUser from "./useCurrentUser";

const useApiToken = ( ): ?string => {
  const [apiToken, setApiToken] = useState( null );
  const [shouldFetchToken, setShouldFetchToken] = useState( true );
  const currentUser = useCurrentUser( );

  useEffect( ( ) => {
    const fetchApiToken = async ( ) => {
      if ( !currentUser ) {
        setApiToken( null );
        // setShouldFetchToken( false );
        return;
      }
      const token = await getJWTToken( );
      if ( token ) {
        if ( token !== apiToken ) {
          setApiToken( token );
        }
        setShouldFetchToken( false );
      } else {
        console.error( "Failed to get API token even though user is logged in: ", currentUser );
      }
    };
    if ( shouldFetchToken ) fetchApiToken( );
  }, [shouldFetchToken, currentUser, apiToken] );

  return apiToken;
};

export default useApiToken;

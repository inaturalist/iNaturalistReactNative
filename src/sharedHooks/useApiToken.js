// @flow

import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { useEffect, useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

const useApiToken = ( ): string | null => {
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
      const token = await getJWT( );
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

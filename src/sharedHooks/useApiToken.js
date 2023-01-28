// @flow

import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { useState } from "react";
import useCurrentUser from "sharedHooks/useCurrentUser";

const useApiToken = ( ): string | null => {
  const [apiToken, setApiToken] = useState( null );
  const currentUser = useCurrentUser( );

  const fetchApiToken = async () => {
    if ( !currentUser ) {
      setApiToken( null );
      return;
    }
    const token = await getJWT();
    if ( token ) {
      if ( token !== apiToken ) {
        setApiToken( token );
      }
    } else {
      console.error(
        "Failed to get API token even though user is logged in: ",
        currentUser
      );
    }
  };

  fetchApiToken();

  return apiToken;
};

export default useApiToken;

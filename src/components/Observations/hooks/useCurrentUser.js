// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import { getJWTToken } from "../../../components/LoginSignUp/AuthenticationService";

const useCurrentUser = ( ): Object => {
  const [currentUser, setCurrentUser] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserProfile = async ( ) => {
      try {
        const apiToken = await getJWTToken( false );
        const options = {
          api_token: apiToken
        };
        const response = await inatjs.users.me( options );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setCurrentUser( results[0].id );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch current user:", e.message );
      }
    };

    fetchUserProfile( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return currentUser;
};

export {
  useCurrentUser
};

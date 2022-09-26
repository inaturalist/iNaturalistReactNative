// @flow

import { useEffect, useState } from "react";

import { getUserId } from "../components/LoginSignUp/AuthenticationService";

const useCurrentUser = ( ): Object => {
  const [currentUser, setCurrentUser] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserId = async ( ) => {
      try {
        const id = await getUserId( );
        if ( !isCurrent ) { return; }
        setCurrentUser( id );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch current user from realm:", e.message );
      }
    };

    fetchUserId( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return currentUser;
};

export default useCurrentUser;

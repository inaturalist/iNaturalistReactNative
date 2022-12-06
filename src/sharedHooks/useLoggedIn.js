// @flow

import { getUsername } from "components/LoginSignUp/AuthenticationService";
import { useEffect, useState } from "react";

const useLoggedIn = ( ): ?boolean => {
  const [isLoggedIn, setIsLoggedIn] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchLoggedInUser = async ( ) => {
      try {
        console.log( "useLoggedIn is running" );
        const currentUserLogin = await getUsername( );
        if ( !isCurrent ) { return; }
        if ( currentUserLogin ) {
          setIsLoggedIn( true );
        } else {
          setIsLoggedIn( false );
        }
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't check whether user logged in:", e.message );
      }
    };

    fetchLoggedInUser( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return isLoggedIn;
};

export default useLoggedIn;

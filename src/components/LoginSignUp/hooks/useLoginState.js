// @flow

import { isLoggedIn } from "components/LoginSignUp/AuthenticationService";
import { useEffect, useState } from "react";

const useLoginState = ( ): any => {
  const [loggedIn, setLoggedIn] = useState( false );

  useEffect( ( ) => {
    const fetchLoggedIn = async ( ) => {
      const login = await isLoggedIn( );
      if ( login !== loggedIn ) {
        setLoggedIn( login );
      }
    };

    fetchLoggedIn( );
  }, [loggedIn] );

  return {
    loggedIn,
    setLoggedIn
  };
};

export default useLoginState;

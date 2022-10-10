// @flow

import { getJWTToken } from "components/LoginSignUp/AuthenticationService";
import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";

// TODO: this doesn't really need to be a hook since we already have a useUserMe hook
// we should remove this and get member id via useUserMe

const useMemberId = ( ): ?number => {
  const [memberId, setMemberId] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchMemberId = async ( ) => {
      const apiToken = await getJWTToken( );
      try {
        const options = {
          api_token: apiToken
        };
        const { results } = await inatjs.users.me( options );
        if ( !isCurrent ) { return; }
        setMemberId( results[0].id );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch current member id:", JSON.stringify( e.response ) );
      }
    };

    fetchMemberId( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return memberId;
};

export default useMemberId;

// @flow

import { useEffect, useState, useMemo } from "react";
import inatjs from "inaturalistjs";

const useFetchUser = ( ): Object => {
  const [user, setUser] = useState( null );
  const FIELDS = useMemo( ( ) => {
    const USER_FIELDS = {
      description: true,
      icon_url: true,
      id: true,
      login: true,
      name: true
    };

    return {
      user: USER_FIELDS
  };
}, [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testId = 1132118;
        const ids = `${testId}?fields=name,login,icon_url,created_at,roles,site_id`;
        const response = await inatjs.users.fetch( ids );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setUser( results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch user:", e.message, );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS] );

  return user;
};

export default useFetchUser;

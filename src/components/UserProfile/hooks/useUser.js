// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const useUser = ( userId: number ): Object => {
  const [user, setUser] = useState( null );


  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserProfile = async ( ) => {
      try {
        const id = `${userId}?fields=name,login,icon_url,created_at,roles,site_id`;
        const response = await inatjs.users.fetch( id );
        const results = response.results;
        if ( !isCurrent ) { return; }
        setUser( results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch user:", e.message );
      }
    };

    fetchUserProfile( );
    return ( ) => {
      isCurrent = false;
    };
  }, [userId] );

  return user;
};

export {
  useUser
};

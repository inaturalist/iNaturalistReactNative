// @flow

import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";

const USER_FIELDS = {
  name: true,
  login: true,
  icon_url: true,
  created_at: true,
  roles: true,
  site_id: true,
  description: true,
  updated_at: true,
  species_count: true,
  observations_count: true,
  identifications_count: true,
  journal_posts_count: true,
  site: true
};

const useRemoteUser = ( userId: number ): Object => {
  const [user, setUser] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserProfile = async ( ) => {
      if ( !userId ) {
        setUser( null );
        return;
      }
      let response;
      try {
        response = await inatjs.users.fetch( userId, { fields: USER_FIELDS } );
      } catch ( e ) {
        console.log( "Failed to fetch current user: ", JSON.stringify( e.response ) );
        setUser( null );
        return;
      }
      const { results } = response;
      if ( !isCurrent ) { return; }
      setUser( results[0] );
    };

    fetchUserProfile( );
    return ( ) => {
      isCurrent = false;
    };
  }, [userId] );

  return {
    user
  };
};

export default useRemoteUser;

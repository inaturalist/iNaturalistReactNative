// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import { getUsername } from "../../../components/LoginSignUp/AuthenticationService";

const useUser = ( userId: number ): Object => {
  const [user, setUser] = useState( null );
  const [currentUser, setCurrentUser] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserProfile = async ( ) => {
      try {
        const currentUserLogin = await getUsername( );
        const id = `${userId}?fields=name,login,icon_url,created_at,roles,site_id,description,updated_at,species_count,observations_count,identifications_count,journal_posts_count`;
        const response = await inatjs.users.fetch( id );
        const results = response.results;
        if ( !isCurrent ) { return; }
        if ( currentUserLogin === results[0].login ) {
          setCurrentUser( true );
        } else {
          setCurrentUser( false );
        }
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

  return {
    user,
    currentUser
  };
};

export {
  useUser
};

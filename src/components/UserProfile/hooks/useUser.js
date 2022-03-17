// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import { getUsername } from "../../../components/LoginSignUp/AuthenticationService";

const useUser = ( userId: number ): Object => {
  const [user, setUser] = useState( null );
  const [currentUser, setCurrentUser] = useState( null );

  // const FIELDS = {
  //   name: true,
  //   login: true,
  //   icon_url: true,
  //   created_at: true,
  //   roles: true,
  //   site: {
  //     name: true
  //   },
  //   description: true,
  //   updated_at: true,
  //   species_count: true,
  //   observations_count: true,
  //   journal_posts_count: true,
  //   identifications_count: true
  // };

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchUserProfile = async ( ) => {
      try {
        const currentUserLogin = await getUsername( );
         const id = `${userId}?fields=name,login,icon_url,created_at,roles,site_id,description,updated_at,species_count,observations_count,identifications_count,journal_posts_count,site`;
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

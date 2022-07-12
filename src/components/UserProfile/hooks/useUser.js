// @flow

import inatjs from "inaturalistjs";
import { useEffect, useState } from "react";

import { getUsername } from "../../LoginSignUp/AuthenticationService";

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
      const currentUserLogin = await getUsername( );
      const response = await inatjs.users.fetch( userId, {
        fields: {
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
        }
      } );
      const { results } = response;
      if ( !isCurrent ) { return; }
      if ( currentUserLogin === results[0].login ) {
        setCurrentUser( true );
      } else {
        setCurrentUser( false );
      }
      setUser( results[0] );
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

export default useUser;

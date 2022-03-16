// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true
};

const useMemberProjects = ( userId: number ): Array<Object> => {
  const [projects, setProjects] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchMemberProjects = async ( ) => {
      try {
        const params = {
          per_page: 10,
          id: userId,
          fields: FIELDS
        };
        const response = await inatjs.users.projects( params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setProjects( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch member projects:", e.message, );
      }
    };

    fetchMemberProjects( );

    return ( ) => {
      isCurrent = false;
    };
  }, [userId] );

  return projects;
};

export default useMemberProjects;

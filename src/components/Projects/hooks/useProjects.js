// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true
};

const useProjects = ( apiParams: Object ): Array<Object> => {
  const [projects, setProjects] = useState( [] );

  // TODO: check with team on whether this is the best endpoint
  // for joined projects. otherwise, user/:id/membership?
  useEffect( ( ) => {
    let isCurrent = true;
    const fetchProjects = async ( ) => {
      try {
        const params = {
          per_page: 10,
          ...apiParams,
          fields: FIELDS
        };
        const response = await inatjs.projects.search( params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setProjects( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch projects:", e.message );
      }
    };

    fetchProjects( );
    return ( ) => {
      isCurrent = false;
    };
  }, [apiParams] );

  return projects;
};

export default useProjects;

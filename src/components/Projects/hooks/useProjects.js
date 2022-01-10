// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true
};

const useProjects = ( apiParams: Object ): Array<Object> => {
  const [projects, setProjects] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchProjects = async ( ) => {
      try {
        const params = {
          per_page: 10,
          ...apiParams
          // features: true
          // fields: FIELDS
        };
        console.log( params, "params in use projects" );
        const response = await inatjs.projects.fetch( [], params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setProjects( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch projects:", e.message, );
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

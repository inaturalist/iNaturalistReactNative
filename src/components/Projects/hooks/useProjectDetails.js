// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true
};

const useProjectDetails = ( id: number ): Array<Object> => {
  const [projectDetails, setProjectDetails] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchProjects = async ( ) => {
      try {
        const params = {
          per_page: 1,
          id
          // fields: FIELDS
        };
        const response = await inatjs.projects.fetch( [], params );
        const { results } = response;
        console.log( results, "results" );
        if ( !isCurrent ) { return; }
        setProjectDetails( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch project details for project_id ${id}:`, e.message, );
      }
    };

    fetchProjects( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return projectDetails;
};

export default useProjectDetails;

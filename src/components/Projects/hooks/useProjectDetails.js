// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const FIELDS = {
  title: true,
  icon: true,
  header_image_url: true,
  description: true
};

const useProjectDetails = ( id: number ): Object => {
  const [projectDetails, setProjectDetails] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchProjectDetails = async ( ) => {
      try {
        const params = {
          fields: FIELDS
        };
        const response = await inatjs.projects.fetch( [id], params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setProjectDetails( results[0] );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch project details for project_id ${id}:`, e.message );
      }
    };

    fetchProjectDetails( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return projectDetails;
};

export default useProjectDetails;

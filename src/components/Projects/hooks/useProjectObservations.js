// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

const PHOTO_FIELDS = {
  id: true,
  attribution: true,
  license_code: true,
  url: true
};

const OBSERVATION_PHOTOS_FIELDS = {
  id: true,
  photo: PHOTO_FIELDS,
  position: true,
  uuid: true
};

const TAXON_FIELDS = {
  name: true,
  preferred_common_name: true
};

const FIELDS = {
  observation_photos: OBSERVATION_PHOTOS_FIELDS,
  taxon: TAXON_FIELDS
};

const useProjectObservations = ( id: number ): Object => {
  const [projectObservations, setProjectObservations] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchProjectObservations = async ( ) => {
      try {
        const params = {
          per_page: 25,
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const { results } = response;
        if ( !isCurrent ) { return; }
        setProjectObservations( results );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( `Couldn't fetch project observations for project_id ${id}:`, e.message, );
      }
    };

    fetchProjectObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [id] );

  return projectObservations;
};

export default useProjectObservations;

// @flow

import { useEffect, useState } from "react";
import inatjs from "inaturalistjs";

import Observation from "../../../models/Observation";
import { FIELDS } from "../../../providers/helpers";

const useObservation = ( uuid: string ): Object => {
  const [observation, setObservation] = useState( null );

  useEffect( ( ) => {
    let isCurrent = true;
    // fetch observation with uuid
    const fetchObservation = async ( ) => {
      try {
        const params = {
          fields: FIELDS
        };
        const response = await inatjs.observations.fetch( uuid, params );
        const results = response.results;
        const obs = Observation.copyRealmSchema( results[0] );
        // TODO: append user photo if this is the current user's observation
        // TODO: check for internet. if no internet, look for realm observation instead
        if ( !isCurrent ) { return; }
        setObservation( obs );
      } catch ( e ) {
        if ( !isCurrent ) { return; }
        console.log( "Couldn't fetch observation:", e.message, );
      }
    };

    fetchObservation( );
    return ( ) => {
      isCurrent = false;
    };
  }, [uuid] );

  return observation;
};

export {
  useObservation
};

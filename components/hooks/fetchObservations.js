// @flow strict-local

import { useState, useEffect } from "react";
import inatjs from "inaturalistjs";

const useFetchObservations = ( ): Array<{
  uuid: string,
  userPhoto: string,
  commonName: string,
  location: string,
  timeObservedAt: string,
  identifications: number,
  comments: number,
  qualityGrade: string
}> => {
  const [observations, setObservations] = useState( [] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albullington";
        const params = { user_login: testUser };
        const response = await inatjs.observations.search( params );
        const userObservations = response.results;

        const onlyNecessaryObsDetails = userObservations.map( ( obs => {
          return {
            uuid: obs.uuid,
            userPhoto: obs.taxon.default_photo.square_url,
            commonName: obs.taxon.preferred_common_name || obs.taxon.name,
            location: obs.place_guess || obs.location,
            timeObservedAt: obs.time_observed_at,
            identifications: obs.identifications_count,
            comments: obs.comments.length,
            qualityGrade: obs.quality_grade
          };
        } ) );
        if ( !isCurrent ) { return; }
        setObservations( onlyNecessaryObsDetails );
      } catch ( e ) {
        console.log( e, JSON.stringify( e ), "couldn't fetch observations" );
      }
    };
    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [] );

  return observations;
};

export default useFetchObservations;

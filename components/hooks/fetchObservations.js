// @flow strict-local

import { useState, useEffect } from "react";
import inatjs from "inaturalistjs";

const useFetchObservations = ( ): any => {
  const [observations, setObservations] = useState( [] );

  useEffect( ( ) => {
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albulltest";
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
        setObservations( onlyNecessaryObsDetails );
      } catch ( e ) {
        console.log( e, JSON.stringify( e ), "couldn't fetch observations" );
      }
    };
    fetchObservations( );
  }, [] );

  return observations;
};

export default useFetchObservations;

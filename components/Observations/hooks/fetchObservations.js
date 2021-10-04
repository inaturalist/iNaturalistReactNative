// @flow strict-local

import { useState, useEffect } from "react";
import inatjs from "inaturalistjs";

// import database from "../../../model/database";

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
        console.log( userObservations, "user obs" );

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


// try {
//   await database.write( async ( ) => {
//     await database.get( "observations" ).create( localObs => {
//       userObservations.forEach( ( obs => {
//         localObs.uuid = obs.uuid;
//         localObs.userPhoto = obs.taxon.default_photo.square_url;
//         localObs.commonName = obs.taxon.preferred_common_name || obs.taxon.name;
//         localObs.location = obs.place_guess || obs.location;
//         localObs.timeObservedAt = obs.time_observed_at;
//         localObs.identifications = obs.identifications_count;
//         localObs.comments = obs.comments.length;
//         localObs.qualityGrade = obs.quality_grade;
//       } ) );
//     } );
//   } );
// } catch ( e ) {
//   console.log( e, "couldn't create new obs in database" );
// }

// try {
//   const localObservations = await database.get( "observations" ).query( ).fetch( );
//   console.log( localObservations, "local obs with fetch?" );
// } catch ( e ) {
//   console.log( e, "can't fetch obs" );
// }

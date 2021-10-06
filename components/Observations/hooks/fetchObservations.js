// @flow strict-local

import { useState, useEffect } from "react";
import inatjs from "inaturalistjs";
import { parse } from "@babel/core";

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

    const renameInCamelCase = ( results ) => {
      const renamedResults = results.map( ( obs => {
        return {
          uuid: obs.uuid,
          userPhoto: obs.taxon.default_photo.url,
          commonName: obs.species_guess,
          location: obs.place_guess,
          timeObservedAt: obs.observed_on,
          identifications: obs.identifications.length || 0,
          comments: obs.comment_count || 0,
          qualityGrade: obs.quality_grade
        };
      } ) );
      if ( !isCurrent ) { return; }
      setObservations( renamedResults );
    };

    const fetchObservations = async( ) => {
      const FIELDS = {
        observed_on: true,
        species_guess: true,
        place_guess: true,
        quality_grade: true,
        identifications: true,
        comments_count: true,
        taxon: {
          default_photo: {
            url: true
          }
        }
      };

      try {
        const response = await fetch( "https://api.inaturalist.org/v2/observations", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "X-HTTP-Method-Override": "GET",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, HEAD"
          },
          body: JSON.stringify( {
            user_login: "albullington",
            photos: true,
            fields: FIELDS
          } )
        } );
        const parsedResponse = await response.json( );
        renameInCamelCase( parsedResponse.results );
      } catch ( e ) {
        console.log( e, "couldn't fetch observations" );
      }
    };

    // const fetchObservations = async ( ) => {
    //   try {
    //     const testUser = "albullington";
    //     const params = {
    //       user_login: testUser,
    //       per_page: 50,
    //       details: "all",
    //       fields: "species_guess,observed_on,quality_grade,photos,identifications,comments_count,taxon"
    //     };
    //     const response = await inatjs.observations.search( params );
    //     const userObservations = response.results;

    //     const onlyNecessaryObsDetails = userObservations.map( ( obs => {
    //       // console.log( obs.photos );
    //       return {
    //         uuid: obs.uuid,
    //         // userPhoto: obs.photos[0],
    //         commonName: obs.species_guess,
    //         // location: obs.place_guess || obs.location,
    //         timeObservedAt: obs.observed_on,
    //         identifications: obs.identifications.length,
    //         // comments: obs.comments.length,
    //         qualityGrade: obs.quality_grade
    //       };
    //     } ) );
    //     console.log( response.results, "response length v2" );
    //     if ( !isCurrent ) { return; }
    //     setObservations( onlyNecessaryObsDetails );
    //   } catch ( e ) {
    //     console.log( e, "couldn't fetch observations" );
    //   }
    // };
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


// const fetchObservations = async ( ) => {
//   try {
//     const testUser = "albullington";
//     const params = {
//       user_login: testUser,
//       photos: true,
//       fields: {
//         species_guess: true,
//         observed_on: true
//       }
//     };

//     // const options = {
//     //   fields: {
//     //     species_guess: true,
//     //     observed_on: true
//     //   }
//     // };
//     const response = await inatjs.observations.search( params );
//     // const userObservations = response.results;

//     // console.log( response, "response v2" );

//     // const onlyNecessaryObsDetails = [];

//     // const onlyNecessaryObsDetails = userObservations.map( ( obs => {
//     //   return {
//     //     uuid: obs.uuid,
//     //     userPhoto: obs.taxon.default_photo.square_url,
//     //     commonName: obs.taxon.preferred_common_name || obs.taxon.name,
//     //     location: obs.place_guess || obs.location,
//     //     timeObservedAt: obs.time_observed_at,
//     //     identifications: obs.identifications_count,
//     //     comments: obs.comments.length,
//     //     qualityGrade: obs.quality_grade
//     //   };
//     // } ) );
//     if ( !isCurrent ) { return; }
//     setObservations( onlyNecessaryObsDetails );
//   } catch ( e ) {
//     console.log( e, e.message, "couldn't fetch observations" );
//   }
// };
// fetchObservations( );

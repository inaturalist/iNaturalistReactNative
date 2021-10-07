// @flow strict-local

import { useState, useEffect, useMemo, useCallback } from "react";
import inatjs from "inaturalistjs";
import { Q } from "@nozbe/watermelondb";

import database from "../../../model/database";

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
  const FIELDS = useMemo( ( ) => {
    return {
    observed_on: true,
    place_guess: true,
    quality_grade: true,
    identifications: true,
    comments_count: true,
    taxon: {
      name: true,
      preferred_common_name: true
    },
    photos: {
      url: true
    }
  };
}, [] );

const deleteAllDatabaseRecords = async ( ) => {
  const localObservations = await database.get( "observations" )
    .query( )
    .fetch( );

  const deleted = localObservations.map( obs => obs.prepareDestroyPermanently( ) );

  database.batch( ...deleted );
};

const transformObsForDatabase = ( localObs, obs ) => {
  localObs.uuid = obs.uuid;
  localObs.userPhoto = obs.photos[0].url;
  localObs.commonName = obs.taxon.preferred_common_name || obs.taxon.name;
  localObs.location = obs.place_guess;
  localObs.timeObservedAt = obs.observed_on;
  localObs.identifications = obs.identifications.length;
  localObs.comments = obs.comment_count;
  localObs.qualityGrade = obs.quality_grade;
};

const getExistingObservations = async ( results ) => {
  const uuids = results.map( obs => obs.uuid );
  return database.get( "observations" )
    .query( Q.where( "uuid", Q.oneOf( uuids ) ) )
    .fetch( );
};

const createOrUpdateObs = useCallback( ( obs, existingObservations ) => {
  const obsToUpdate = existingObservations.find( exO => exO.uuid === obs.uuid );
  if ( obsToUpdate ) {
    return obsToUpdate
      .prepareUpdate( existingObs => transformObsForDatabase( existingObs, obs ) );
  }

  return database.get( "observations" )
    .prepareCreate( newObs => transformObsForDatabase( newObs, obs ) );
}, [] );

const writeToDatabase = useCallback( ( results ) => {
  // based on this description
  // https://github.com/Nozbe/WatermelonDB/issues/252#issuecomment-466986977
  database.write( async ( ) => {
    // await deleteAllDatabaseRecords( );
    // check which observations already exist - kind of a lot of boilerplate code here
    // https://github.com/Nozbe/WatermelonDB/issues/36#issue-360631556
    try {
      const observationsToUpdate = await getExistingObservations( results );
      const newObs = results.map( obs => createOrUpdateObs( obs, observationsToUpdate ) );
      await database.batch( ...newObs );
    } catch ( e ) {
      console.log( e, "watermelondb query" );
    }
  } );
}, [createOrUpdateObs] );

  useEffect( ( ) => {
    let isCurrent = true;
    const fetchObservations = async ( ) => {
      try {
        const testUser = "albullington";
        const params = {
          user_login: testUser,
          per_page: 400,
          photos: true,
          details: "all",
          fields: FIELDS
        };
        const response = await inatjs.observations.search( params );
        const results = response.results;
        if ( !isCurrent ) { return; }
        writeToDatabase( results );
      } catch ( e ) {
        console.log( e, "couldn't fetch observations" );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS, writeToDatabase] );

  return;
};

export default useFetchObservations;

// const fetchObservations = async( ) => {

//   try {
//     const response = await fetch( "https://api.inaturalist.org/v2/observations", {
//       method: "post",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         "X-HTTP-Method-Override": "GET",
//         "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE, HEAD"
//       },
//       body: JSON.stringify( {
//         user_login: "albullington",
//         fields: FIELDS
//       } )
//     } );
//     const parsedResponse = await response.json( );
//     renameResultsInCamelCase( parsedResponse.results );
//     // writeToDatabase( parsedResponse.results );
//   } catch ( e ) {
//     console.log( e, "couldn't fetch observations" );
//   }
// };

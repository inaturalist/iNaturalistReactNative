// @flow strict-local

import { useEffect, useMemo, useCallback } from "react";
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
      comments_count: true,
      created_at: true,
      description: true,
      geoprivacy: true,
      identifications: true,
      latitude: true,
      location: true,
      longitude: true,
      observed_on: true,
      photos: {
        url: true
      },
      place_guess: true,
      positional_accuracy: true,
      preferences: {
        prefers_community_taxon: true
      },
      private_place_guess: true,
      public_positional_accuracy: true,
      quality_grade: true,
      taxon: {
        iconic_taxon_id: true,
        iconic_taxon_name: true,
        name: true,
        preferred_common_name: true,
        rank: true,
        rank_level: true
      },
      time_observed_at: true
    // from new observation edit

    // iconic taxon id
    // geoprivacy
    // captive/cultivated
    // multiple observation photos
    // lat
    // lng
    // full observed on timestamp
    // species_guess
    // notes
    // projects
    // computer vision id or not (owners_id_from_vision)
    // sounds

    // from iOS
    // https://github.com/inaturalist/INaturalistIOS/blob/main/INaturalistIOS/ExploreObservationRealm.h

    // obs id (not uuid)
    // time created
    // time synced
    // time updated locally (what's the difference w/ synced?)
    // privateLat
    // privateLng
    // public accuracy
    // private accuracy
    // coordinates obscured?
    // positional accuracy (diff from public/private?)
    // location
    // private location
    // observation media
    // validation error message
    // obs photos, sounds, comments, ids, faves, fieldvalue, projects (separate realms)

    // from android
    // https://github.com/inaturalist/iNaturalistAndroid/blob/main/iNaturalist/src/main/java/org/inaturalist/android/Observation.java

    // taxon geoprivacy
    // iconic taxon name
    // id_please (what is this? whether a user allows IDs or not?)
    // observed_on_string (separate from observed_on)
    // license
    // out_of_range
    // private_place_guess
    // positioning device
    // positioning method
    // taxon_id
    // time_observed_at
    // updated_at (there's a different _ method for this too)
    // user_agent
    // user_id
    // user_login
    // id_count
    // comments_count
    // last_comments_count
    // last_ids_count
    // is_deleted
    // scientific_name
    // rank_level
    // rank
    // prefers_community_taxon
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
    await deleteAllDatabaseRecords( );
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
        if ( !isCurrent ) { return; }
        console.log( e, "couldn't fetch observations" );
      }
    };

    fetchObservations( );
    return ( ) => {
      isCurrent = false;
    };
  }, [FIELDS, writeToDatabase] );

  return [];
};

export default useFetchObservations;

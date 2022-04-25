// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../components/LoginSignUp/AuthenticationService";
import { markUploaded, markPhotoUploaded, markSoundUploaded } from "./markUploaded";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";
// import fetchPlaceName from "../../../sharedHelpers/fetchPlaceName";

const uploadSound = async ( soundParams, apiToken, uuid ) => {
  const options = { api_token: apiToken };

  try {
    const { results } = await inatjs.observation_sounds.create( soundParams, options );
    const soundId = results[0].id;
    await markSoundUploaded( uuid, soundId );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), "couldn't upload sound" );
  }
};

const createSoundParams = async ( id, apiToken, localObs ) => {
  const obsSoundsToUpload = localObs.observationSounds;

  if ( !obsSoundsToUpload || obsSoundsToUpload.length === 0 ) { return; }
  for ( let i = 0; i < obsSoundsToUpload.length; i += 1 ) {
    const soundToUpload = obsSoundsToUpload[i];
    const soundParams = ObservationSound.mapSoundForUpload( id, soundToUpload );
    uploadSound( soundParams, apiToken, soundToUpload.uuid );
  }
};

const uploadPhoto = async ( photoParams, apiToken, uuid ) => {
  const options = { api_token: apiToken };

  try {
    const { results } = await inatjs.observation_photos.create( photoParams, options );
    const photoId = results[0].id;
    await markPhotoUploaded( uuid, photoId );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), "couldn't upload photo" );
  }
};

const createPhotoParams = async ( id, apiToken, localObs ) => {
  const obsPhotosToUpload = localObs.observationPhotos;

  if ( !obsPhotosToUpload || obsPhotosToUpload.length === 0 ) { return; }
  for ( let i = 0; i < obsPhotosToUpload.length; i += 1 ) {
    const photoToUpload = obsPhotosToUpload[i];
    const photoParams = ObservationPhoto.mapPhotoForUpload( id, photoToUpload );
    uploadPhoto( photoParams, apiToken, photoToUpload.uuid );
  }
};

const uploadObservation = async ( obsToUpload: Object, localObs: Object ) => {
  const FIELDS = { id: true };

  try {
    const apiToken = await getJWTToken( false );

    const uploadParams = {
      // TODO: decide how to format place_guess param
      // right now it looks like street, city, state is preferred on the web
      observation: {
        ...obsToUpload
        // where's the right place to do this? save to realm, then upload?
        // place_guess: fetchPlaceName( obsToUpload.latitude, obsToUpload.longitude )
      },
      fields: FIELDS
    };

    const options = {
      api_token: apiToken
    };

    const response = await inatjs.observations.create( uploadParams, options );
    const { id } = response.results[0];
    // save id to realm and set time synced
    await markUploaded( obsToUpload.uuid, id );
    if ( localObs.observationPhotos ) {
      createPhotoParams( id, apiToken, localObs ); // v2
    }
    if ( localObs.observationSounds ) {
      createSoundParams( id, apiToken, localObs ); // v2
    }
  } catch ( e ) {
    console.log( JSON.stringify( e.response.status ), "couldn't upload observation: ", JSON.stringify( e.response ) );
  }
};

export default uploadObservation;

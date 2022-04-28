// @flow

import inatjs from "inaturalistjs";

import { getJWTToken } from "../../components/LoginSignUp/AuthenticationService";
import { markRecordUploaded } from "./markUploaded";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";

const uploadToServer = async ( params, options, uuid, type, apiCall ) => {
  try {
    const response = await apiCall.create( params, options );
    await markRecordUploaded( uuid, type, response );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), `couldn't upload ${type}` );
  }
};

const createParams = ( response, options, evidence, mapLocalModelForUpload, type, apiCall ) => {
  const { id } = response.results[0];
  if ( !evidence || evidence.length === 0 ) { return; }
  for ( let i = 0; i < evidence.length; i += 1 ) {
    const currentEvidence = evidence[i];
    const params = mapLocalModelForUpload( id, currentEvidence );
    uploadToServer( params, options, currentEvidence.uuid, type, apiCall );
  }
};

const uploadObservation = async ( obsToUpload: Object, localObs: Object ) => {
  try {
    const apiToken = await getJWTToken( false );
    const options = { api_token: apiToken };

    const uploadParams = {
      observation: { ...obsToUpload },
      fields: { id: true }
    };

    const response = await inatjs.observations.create( uploadParams, options );
    await markRecordUploaded( obsToUpload.uuid, "Observation", response );
    if ( localObs.observationPhotos ) {
      createParams(
        response,
        options,
        localObs.observationPhotos,
        ObservationPhoto.mapPhotoForUpload,
        "ObservationPhoto",
        inatjs.observation_photos
      );
    }
    if ( localObs.observationSounds ) {
      createParams(
        response,
        options,
        localObs.observationSounds,
        ObservationSound.mapSoundForUpload,
        "ObservationSound",
        inatjs.observation_sounds
      );
    }
  } catch ( e ) {
    console.log( "couldn't upload observation: ", e );
  }
};

export default uploadObservation;

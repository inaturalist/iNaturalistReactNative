// @flow

import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import { getJWTToken } from "../../components/LoginSignUp/AuthenticationService";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";

const markRecordUploaded = async ( uuid: string, type: string, response: Object ) => {
  const { id } = response.results[0];

  try {
    const realm = await Realm.open( realmConfig );
    const record = realm.objectForPrimaryKey( type, uuid );
    realm?.write( ( ) => {
      record.id = id;
      record._synced_at = new Date( );
    } );
  } catch ( e ) {
    console.log( e, `couldn't mark ${type} uploaded in realm` );
  }
};

const uploadToServer = async ( params, options, uuid, type, endpoint ) => {
  try {
    const response = await endpoint.create( params, options );
    await markRecordUploaded( uuid, type, response );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), `couldn't upload ${type}` );
  }
};

const flattenParams = ( response, options, evidence, mapLocalModelForUpload, type, endpoint ) => {
  const { id } = response.results[0];
  if ( !evidence || evidence.length === 0 ) { return; }
  for ( let i = 0; i < evidence.length; i += 1 ) {
    const currentEvidence = evidence[i];
    const params = mapLocalModelForUpload( id, currentEvidence );
    uploadToServer( params, options, currentEvidence.uuid, type, endpoint );
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
      flattenParams(
        response,
        options,
        localObs.observationPhotos,
        ObservationPhoto.mapPhotoForUpload,
        "ObservationPhoto",
        inatjs.observation_photos
      );
    }
    if ( localObs.observationSounds ) {
      flattenParams(
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

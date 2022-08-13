// @flow

import inatjs from "inaturalistjs";
import Realm from "realm";

import { getJWTToken } from "../../components/LoginSignUp/AuthenticationService";
import realmConfig from "../../models/index";
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

const uploadToServer = async (
  uuid: string,
  type: string,
  params: Object,
  apiEndpoint: Function
) => {
  const apiToken = await getJWTToken( false );
  const options = { api_token: apiToken };

  try {
    const response = await apiEndpoint.create( params, options );
    await markRecordUploaded( uuid, type, response );
  } catch ( e ) {
    console.log( JSON.stringify( e.response ), `couldn't upload ${type}` );
  }
};

const uploadEvidence = (
  evidence: Array<Object>,
  type: string,
  apiSchemaMapper: Function,
  observationId: number,
  apiEndpoint: Function
) => {
  if ( evidence.length === 0 ) { return; }
  for ( let i = 0; i < evidence.length; i += 1 ) {
    const currentEvidence = evidence[i];
    const params = apiSchemaMapper( observationId, currentEvidence );
    uploadToServer( currentEvidence.uuid, type, params, apiEndpoint );
  }
};

const uploadObservation = async (
  obsToUpload: Object,
  localObs: Object
): Promise<string> => {
  const apiToken = await getJWTToken( false );
  const options = { api_token: apiToken };

  // Remove all null values, b/c the API doesn't seem to like them for some
  // reason (might be an error with the API as of 20220801)
  const newObs = {};
  Object.keys( obsToUpload ).forEach( k => {
    if ( obsToUpload[k] !== null ) {
      newObs[k] = obsToUpload[k];
    }
  } );

  const uploadParams = {
    observation: { ...newObs },
    fields: { id: true }
  };

  let response;
  try {
    response = await inatjs.observations.create( uploadParams, options );
  } catch ( uploadError ) {
    const body = JSON.parse( await uploadError.response.text( ) );
    console.error( "[ERROR] Failed to upload observation: ", JSON.stringify( body ) );
    return "failure";
  }
  const { id } = response.results[0];
  await markRecordUploaded( obsToUpload.uuid, "Observation", response );

  if ( localObs.observationPhotos ) {
    uploadEvidence(
      localObs.observationPhotos,
      "ObservationPhoto",
      ObservationPhoto.mapPhotoForUpload,
      id,
      inatjs.observation_photos
    );
  }
  if ( localObs.observationSounds ) {
    uploadEvidence(
      localObs.observationSounds,
      "ObservationSound",
      ObservationSound.mapSoundForUpload,
      id,
      inatjs.observation_sounds
    );
  }
  return "success";
};

export default uploadObservation;

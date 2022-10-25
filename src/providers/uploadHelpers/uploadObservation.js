// @flow

import inatjs from "inaturalistjs";
import Observation from "realmModels/Observation";
import ObservationPhoto from "realmModels/ObservationPhoto";
import ObservationSound from "realmModels/ObservationSound";

const uploadObsSound = ( obs, id, realm, apiToken ) => Observation.uploadEvidence(
  obs.observationSounds,
  "ObservationSound",
  ObservationSound.mapSoundForUpload,
  id,
  inatjs.observation_sounds,
  realm,
  apiToken
);

const uploadObsPhoto = ( obs, id, realm, apiToken ) => Observation.uploadEvidence(
  obs.observationPhotos,
  "ObservationPhoto",
  ObservationPhoto.mapPhotoForUpload,
  id,
  inatjs.observation_photos,
  realm,
  apiToken
);

const uploadObservation = async (
  obs: Object,
  realm: Object,
  apiToken: string | null
): Promise<any> => {
  const response = await Observation.uploadObservation( obs, apiToken );
  await Observation.markRecordUploaded( obs.uuid, "Observation", response, realm );
  const { id } = response.results[0];
  if ( obs.observationPhotos && obs.observationPhotos.length > 0 ) {
    return uploadObsPhoto( obs, id, realm, apiToken );
  }
  if ( obs.observationSounds && obs.observationSounds.length > 0 ) {
    return uploadObsSound( obs, id, realm, apiToken );
  }
  return response;
};

export default uploadObservation;

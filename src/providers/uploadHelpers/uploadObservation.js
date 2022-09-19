// @flow

import inatjs from "inaturalistjs";

import Observation from "../../models/Observation";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";

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
  if ( obs.observationPhotos ) {
    return uploadObsPhoto( obs, id, realm, apiToken );
  }
  if ( obs.observationSounds ) {
    return uploadObsSound( obs, id, realm, apiToken );
  }
  return null;
};

export default uploadObservation;

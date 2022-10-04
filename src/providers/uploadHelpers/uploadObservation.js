// @flow

import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";

const uploadObsSound = ( obs, id, realm ) => Observation.uploadEvidence(
  obs.observationSounds,
  "ObservationSound",
  ObservationSound.mapSoundForUpload,
  id,
  inatjs.observation_sounds,
  realm
);

const uploadObsPhoto = ( obs, id, realm ) => Observation.uploadEvidence(
  obs.observationPhotos,
  "ObservationPhoto",
  ObservationPhoto.mapPhotoForUpload,
  id,
  inatjs.observation_photos,
  realm
);

const uploadObservation = async ( obs: Object ): Promise<any> => {
  const response = await Observation.uploadObservation( obs );
  const realm = await Realm.open( realmConfig );
  await Observation.markRecordUploaded( obs.uuid, "Observation", response, realm );
  const { id } = response.results[0];
  if ( obs.observationPhotos && obs.observationPhotos.length > 0 ) {
    return uploadObsPhoto( obs, id, realm );
  }
  if ( obs.observationSounds && obs.observationSounds.length > 0 ) {
    return uploadObsSound( obs, id, realm );
  }
  return response;
};

export default uploadObservation;

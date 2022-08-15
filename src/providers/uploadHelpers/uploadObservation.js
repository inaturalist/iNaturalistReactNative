// @flow

import inatjs from "inaturalistjs";
import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";
import ObservationPhoto from "../../models/ObservationPhoto";
import ObservationSound from "../../models/ObservationSound";

const uploadObservation = async ( obs: Object ): Promise<any> => {
  const response = await Observation.uploadObservation( obs );
  const realm = await Realm.open( realmConfig );
  await Observation.markRecordUploaded( obs.uuid, "Observation", response, realm );
  const { id } = response.results[0];
  if ( obs.observationPhotos ) {
    Observation.uploadEvidence(
      obs.observationPhotos,
      "ObservationPhoto",
      ObservationPhoto.mapPhotoForUpload,
      id,
      inatjs.observation_photos,
      realm
    );
  }
  if ( obs.observationSounds ) {
    Observation.uploadEvidence(
      obs.observationSounds,
      "ObservationSound",
      ObservationSound.mapSoundForUpload,
      id,
      inatjs.observation_sounds,
      realm
    );
  }
};

export default uploadObservation;

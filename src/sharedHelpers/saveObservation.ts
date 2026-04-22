import type { ExifTags } from "@lodev09/react-native-exify";
import * as Exify from "@lodev09/react-native-exify";
import type Realm from "realm";
import Observation from "realmModels/Observation";
import type { RealmObservation } from "realmModels/types";

const writeExifToCameraRollPhotos = async (
  observation: RealmObservation,
  cameraRollUris: string[],
  exif: {
    latitude?: number | null;
    longitude?: number | null;
    positional_accuracy?: number | null;
  },
) => {
  if ( !cameraRollUris || cameraRollUris.length === 0 || !observation ) {
    return;
  }

  // eslint-disable-next-line camelcase
  const { latitude, longitude, positional_accuracy } = exif;

  const exifToWrite: ExifTags = {
    GPSLatitude: latitude,
    GPSLongitude: longitude,
    // eslint-disable-next-line camelcase
    GPSHPositioningError: positional_accuracy,
  };

  // Update all photos taken via the app with the new fetched location.
  cameraRollUris.forEach( uri => {
    Exify.write( uri, exifToWrite );
  } );
};

const saveObservation = async (
  observation: RealmObservation,
  cameraRollUris: string[],
  realm: Realm,
) => {
  await writeExifToCameraRollPhotos( observation, cameraRollUris, {
    latitude: observation.latitude,
    longitude: observation.longitude,
    positional_accuracy: observation.positional_accuracy,
  } );
  return Observation.saveLocalObservationForUpload( observation, realm );
};

export default saveObservation;

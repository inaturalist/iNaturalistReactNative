import type Realm from "realm";
import type {
  RealmObservation,
  RealmObservationFieldValue,
  RealmProjectObservation,
} from "realmModels/types";

interface UploadOptions {
  api_token?: string;
  signal: AbortSignal;
}
function filterDirtyOfvs( observation: RealmObservation ): RealmObservationFieldValue[] {
  return observation.observationFieldValues;
}

function filterDirtyPos( observation: RealmObservation ): RealmProjectObservation[] {
  return observation.projectObservations;
}

async function uploadProjectChildren(
  obsUUID: string,
  observation: RealmObservation,
  options: UploadOptions,
  realm: Realm,
): Promise<void> {
  const dirtyOfvs = filterDirtyOfvs( observation );
  const dirtyPos = filterDirtyPos( observation );

  console.log( "dirtyOfvs", dirtyOfvs );
  console.log( "dirtyPos", dirtyPos );

  console.log( "obsUUID", obsUUID );
  console.log( "options", options );
  console.log( "realm", realm );
}

export {
  filterDirtyOfvs,
  filterDirtyPos,
  uploadProjectChildren,
};

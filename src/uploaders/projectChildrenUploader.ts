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
  // Single upload-time gate combining timestamp dirty (needsSync),
  // not tombstoned (_pending_deletion), and non-empty value.
  return observation.observationFieldValues.filter(
    ofv => ofv.needsSync( )
    && !ofv._pending_deletion
    && ofv.value != null
    && ofv.value !== "",
  );
}

function filterDirtyPos( observation: RealmObservation ): RealmProjectObservation[] {
  // Single upload-time gate combining timestamp dirty (needsSync),
  // not tombstoned (_pending_deletion), and non-empty value.
  return observation.projectObservations.filter(
    po => po.needsSync( )
      && !po._pending_deletion
      && !po.wasSynced( ),
  );
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

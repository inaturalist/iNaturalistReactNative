import { createProjectObservation } from "api/projectObservations";
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

async function uploadSingleProjectObservation(
  po: RealmProjectObservation,
  observationUUID: string,
  options: UploadOptions,
  realm: Realm,
): Promise<void> {
  const params = {
    project_observation: {
      observation_id: observationUUID,
      project_id: po.projectId,
    },
  };
  const response = await createProjectObservation( params, options );

  console.log( "response", response );

  // TODO: update realm
  console.log( "observationUUID", observationUUID );
  console.log( "realm", realm );
  // );
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

  await Promise.all(
    dirtyPos.map( po => uploadSingleProjectObservation(
      po,
      obsUUID,
      options,
      realm,
    ) ),
  );
}

export {
  filterDirtyOfvs,
  filterDirtyPos,
  uploadProjectChildren,
};

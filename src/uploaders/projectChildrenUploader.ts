import {
  createObservationFieldValue,
} from "api/observationFieldValues";
import { createProjectObservation } from "api/projectObservations";
import type Realm from "realm";
import type {
  RealmObservation,
  RealmObservationFieldValue,
  RealmProjectObservation,
} from "realmModels/types";
import { markRecordUploaded } from "uploaders";

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

async function uploadSingleObservationFieldValue(
  ofv: RealmObservationFieldValue,
  observationUUID: string,
  options: UploadOptions,
  realm: Realm,
): Promise<void> {
  const params = {
    observation_field_value: {
      observation_id: observationUUID,
      observation_field_id: ofv.obsFieldId,
      // We have filtered out empty OFVs in previous step, so type is string
      value: ofv.value as string,
    },
  };

  let response;
  if ( ofv.wasSynced( ) && ofv.id ) {
    console.log( "update branch" );
  } else {
    response = await createObservationFieldValue( params, options );
  }

  markRecordUploaded(
    observationUUID,
    ofv.uuid,
    "ObservationFieldValue",
    response,
    realm,
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

  markRecordUploaded(
    observationUUID,
    po.uuid,
    "ProjectObservation",
    response,
    realm,
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

  // The two batches need to be in sequence; PO phase waits until all OFVs settle.
  // Because some POs might need a just uploaded OFV to not 422
  // Can be parallel within each phase.
  await Promise.all(
    dirtyOfvs.map( ofv => uploadSingleObservationFieldValue(
      ofv,
      obsUUID,
      options,
      realm,
    ) ),
  );

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

import { INatApiError } from "api/error";
import { deleteObservationFieldValue } from "api/observationFieldValues";
import { deleteProjectObservation } from "api/projectObservations";
import type Realm from "realm";
import type {
  RealmObservation,
  RealmObservationFieldValue,
  RealmProjectObservation,
} from "realmModels/types";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

interface DeleteOptions {
  api_token?: string;
  signal: AbortSignal;
}

function isDeleteSuccess( error: unknown ): boolean {
  return error instanceof INatApiError
    && ( error.status === 404 || error.status === 403 );
}

async function deleteRemoteProjectObservation(
  po: RealmProjectObservation,
  options: DeleteOptions,
): Promise<void> {
  // Android Classic is: PO DELETE runs only when the row has a server id
  // this should be comparable. We don't need to delete on server if it was never synced.
  if ( !po.wasSynced( ) ) {
    return;
  }
  try {
    await deleteProjectObservation( po.uuid, options );
  } catch ( error ) {
    if ( !isDeleteSuccess( error ) ) {
      throw error;
    }
  }
}

async function deleteRemoteObservationFieldValue(
  ofv: RealmObservationFieldValue,
  options: DeleteOptions,
): Promise<void> {
  if ( !ofv.wasSynced( ) ) {
    return;
  }
  try {
    await deleteObservationFieldValue( ofv.uuid, options );
  } catch ( error ) {
    if ( !isDeleteSuccess( error ) ) {
      throw error;
    }
  }
}

export default async function syncProjectChildDeletions(
  observation: RealmObservation,
  options: DeleteOptions,
  realm: Realm,
): Promise<void> {
  const posToDelete = observation.projectObservations.filter( po => po._pending_deletion );
  const ofvsToDelete = observation.observationFieldValues.filter( ofv => ofv._pending_deletion );

  // The two batches need to be in sequence; OFV phase waits until all POs settle.
  // Because some OFVs might be required for some POs, so deleteing a PO in such a case
  // will error out 422.
  // Can be parallel within each phase.
  await Promise.all(
    posToDelete.map( po => deleteRemoteProjectObservation( po, options ) ),
  );
  // Remove realm entry
  posToDelete.forEach( po => safeRealmWrite( realm, ( ) => {
    realm.delete( po );
  }, "deleting synced project observation from Realm" ) );

  await Promise.all(
    ofvsToDelete.map( ofv => deleteRemoteObservationFieldValue( ofv, options ) ),
  );
  // Remove realm entry
  ofvsToDelete.forEach( ofv => safeRealmWrite( realm, ( ) => {
    realm.delete( ofv );
  }, "deleting synced observation field value from Realm" ) );
}

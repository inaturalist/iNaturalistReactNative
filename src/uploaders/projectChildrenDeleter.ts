import { deleteProjectObservation } from "api/projectObservations";
import type Realm from "realm";
import type {
  RealmObservation,
  RealmProjectObservation,
} from "realmModels/types";

interface DeleteOptions {
  api_token?: string;
  signal: AbortSignal;
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
  await deleteProjectObservation( po.uuid, options );
}

export default async function syncProjectChildDeletions(
  observation: RealmObservation,
  options: DeleteOptions,
  realm: Realm,
): Promise<void> {
  const posToDelete = observation.projectObservations.filter( po => po._pending_deletion );
  const ofvsToDelete = observation.observationFieldValues.filter( ofv => ofv._pending_deletion );

  console.log( "ofvsToDelete", ofvsToDelete );
  console.log( "options", options );
  console.log( "realm", realm );

  await Promise.all(
    posToDelete.map( po => deleteRemoteProjectObservation( po, options ) ),
  );
}

import type Realm from "realm";
import type {
  RealmObservation,
} from "realmModels/types";

interface DeleteOptions {
  api_token?: string;
  signal: AbortSignal;
}

export default async function syncProjectChildDeletions(
  observation: RealmObservation,
  options: DeleteOptions,
  realm: Realm,
): Promise<void> {
  const posToDelete = observation.projectObservations.filter( po => po._pending_deletion );
  const ofvsToDelete = observation.observationFieldValues.filter( ofv => ofv._pending_deletion );

  console.log( "posToDelete", posToDelete );
  console.log( "ofvsToDelete", ofvsToDelete );
  console.log( "options", options );
  console.log( "realm", realm );
}

import type {
  RealmObservation,
  RealmProjectObservation,
} from "realmModels/types";

function filterDirtyPos( observation: RealmObservation ): RealmProjectObservation[] {
  // Single upload-time gate combining timestamp dirty (needsSync),
  // not tombstoned (_pending_deletion), and non-empty value.
  return observation.projectObservations.filter(
    po => po.needsSync( )
      && !po._pending_deletion
      && !po.wasSynced( ),
  );
}

export default filterDirtyPos;

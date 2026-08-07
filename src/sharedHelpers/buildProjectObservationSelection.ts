import ProjectObservation from "realmModels/ProjectObservation";
import type { RealmProjectObservationPojo } from "realmModels/types";

export interface BuildProjectObservationSelectionResult {
  projectObservations: RealmProjectObservationPojo[];
}

export function areProjectIdSetsEqual(
  first: Set<number>,
  second: Set<number>,
): boolean {
  if ( first.size !== second.size ) {
    return false;
  }
  return [...first].every( projectId => second.has( projectId ) );
}

function isSyncedOrTombstonedPo( po: RealmProjectObservationPojo ): boolean {
  return po._synced_at != null || po._pending_deletion === true;
}

export default function buildProjectObservationSelection(
  existingProjectObservations: RealmProjectObservationPojo[] | undefined,
  selectedProjectIds: Set<number>,
): BuildProjectObservationSelectionResult {
  const priorProjectObservations = existingProjectObservations ?? [];
  const nextProjectObservations: RealmProjectObservationPojo[] = [];

  // When pressing Save, for each project that is selected we need to check if there
  // already exists a PO (e.g. on ObsEdit by not changing this one while adding another)
  // or if we need to create a new PO
  selectedProjectIds.forEach( projectId => {
    const existingPo = priorProjectObservations.find( po => po.projectId === projectId );
    if ( existingPo ) {
      nextProjectObservations.push( existingPo );
    } else {
      nextProjectObservations.push( ProjectObservation.new( projectId ) );
    }
  } );

  priorProjectObservations.forEach( po => {
    if ( selectedProjectIds.has( po.projectId ) ) {
      return;
    }
    if ( isSyncedOrTombstonedPo( po ) ) {
      nextProjectObservations.push( {
        ...po,
        _pendingRemoval: true,
      } );
    }
  } );

  return {
    projectObservations: nextProjectObservations,
  };
}

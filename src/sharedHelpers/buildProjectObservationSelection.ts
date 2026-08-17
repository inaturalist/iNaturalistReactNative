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

function activatePo( po: RealmProjectObservationPojo ): RealmProjectObservationPojo {
  // eslint-disable-next-line camelcase
  const { _pendingRemoval, _pending_deletion, ...rest } = po;
  return rest;
}

export default function buildProjectObservationSelection(
  existingProjectObservations: RealmProjectObservationPojo[] | undefined,
  selectedProjectIds: Set<number>,
): BuildProjectObservationSelectionResult {
  const priorProjectObservations = existingProjectObservations ?? [];
  const nextProjectObservations: RealmProjectObservationPojo[] = [];

  selectedProjectIds.forEach( projectId => {
    const existingPo = priorProjectObservations.find( po => po.projectId === projectId );
    if ( existingPo ) {
      nextProjectObservations.push( activatePo( existingPo ) );
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

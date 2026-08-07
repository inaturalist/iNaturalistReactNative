import ProjectObservation from "realmModels/ProjectObservation";
import type { RealmProjectObservationPojo } from "realmModels/types";

export interface BuildProjectObservationSelectionResult {
  projectObservations: RealmProjectObservationPojo[];
  projectObservationUuidsToDelete: string[];
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

export default function buildProjectObservationSelection(
  existingProjectObservations: RealmProjectObservationPojo[] | undefined,
  existingUuidsToDelete: string[] | undefined,
  selectedProjectIds: Set<number>,
): BuildProjectObservationSelectionResult {
  const priorProjectObservations = existingProjectObservations ?? [];
  const priorUuidsToDelete = existingUuidsToDelete ?? [];

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

  const uuidsToDelete: string[] = [];
  priorProjectObservations.forEach( po => {
    // If a PO was already synced (= is on remote) but is deselected during
    // an ObsEdit session, we need to mark it for deletion.
    if ( !selectedProjectIds.has( po.projectId ) && po._synced_at != null ) {
      uuidsToDelete.push( po.uuid );
    }
  } );
  const keptUuids = new Set( nextProjectObservations.map( po => po.uuid ) );
  const nextUuidsToDelete = [
    ...new Set( [
      // If a PO that was marked as deleted in a prior ObsEdit session, is now re-selected for
      // addition, we need to keep it out of the to-be-deleted list
      ...priorUuidsToDelete.filter( uuid => !keptUuids.has( uuid ) ),
      ...uuidsToDelete,
    ] ),
  ];

  return {
    projectObservations: nextProjectObservations,
    projectObservationUuidsToDelete: nextUuidsToDelete,
  };
}

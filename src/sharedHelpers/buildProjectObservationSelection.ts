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

export default function buildProjectObservationSelection(
  existingProjectObservations: RealmProjectObservationPojo[] | undefined,
  selectedProjectIds: Set<number>,
): BuildProjectObservationSelectionResult {
  const projectObservations = existingProjectObservations ?? [];
  const nextProjectObservations: RealmProjectObservationPojo[] = [];

  // When pressing Save, for each project that is selected we need to check if there
  // already exists a PO (e.g. on ObsEdit by not changing this one while adding another)
  // or if we need to create a new PO
  selectedProjectIds.forEach( projectId => {
    const existingPo = projectObservations.find( po => po.projectId === projectId );
    if ( existingPo ) {
      nextProjectObservations.push( existingPo );
    } else {
      nextProjectObservations.push( ProjectObservation.new( projectId ) );
    }
  } );
  return {
    projectObservations: nextProjectObservations,
  };
}

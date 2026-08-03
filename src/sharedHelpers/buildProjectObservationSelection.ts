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
  console.log( "existingProjectObservations", existingProjectObservations );
  console.log( "selectedProjectIds", selectedProjectIds );
  return {
    projectObservations: [],
  };
}

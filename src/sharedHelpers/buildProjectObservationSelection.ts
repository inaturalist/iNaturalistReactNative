export function areProjectIdSetsEqual(
  first: Set<number>,
  second: Set<number>,
): boolean {
  if ( first.size !== second.size ) {
    return false;
  }
  return [...first].every( projectId => second.has( projectId ) );
}

export default function buildProjectObservationSelection() {
}

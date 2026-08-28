import type Realm from "realm";

function persistObservationUploadError(
  realm: Realm,
  obsUuid: string,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  const observation = realm.objectForPrimaryKey( "Observation", obsUuid );
}

function clearObservationUploadError(
  realm: Realm,
  obsUuid: string,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  const observation = realm.objectForPrimaryKey( "Observation", obsUuid );
  if ( !observation?.uploadErrorMessage ) {
    return;
  }
}

export {
  clearObservationUploadError,
  persistObservationUploadError,
};

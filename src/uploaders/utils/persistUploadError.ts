import type Realm from "realm";

function persistObservationUploadError(
  realm: Realm,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
}

function clearObservationUploadError(
  realm: Realm,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
}

export {
  clearObservationUploadError,
  persistObservationUploadError,
};

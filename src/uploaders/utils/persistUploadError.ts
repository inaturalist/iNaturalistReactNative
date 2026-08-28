import type Realm from "realm";

function persistObservationUploadError(
  realm: Realm,
  obsUuid: string,
  error: Error,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  const observation = realm.objectForPrimaryKey( "Observation", obsUuid );
  if ( !observation ) {
    return;
  }
  const message = JSON.stringify( error );
  safeRealmWrite( realm, ( ) => {
    observation.uploadErrorMessage = message;
  }, "persisting observation upload error" );
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
  safeRealmWrite( realm, ( ) => {
    observation.uploadErrorMessage = null;
  }, "clearing observation upload error" );
}

export {
  clearObservationUploadError,
  persistObservationUploadError,
};

import type Realm from "realm";
import type { RealmObservation } from "realmModels/types";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

function persistObservationUploadError(
  realm: Realm,
  realmObservation: RealmObservation,
  uploadErrorMessage: string,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  safeRealmWrite( realm, ( ) => {
    realmObservation.uploadErrorMessage = uploadErrorMessage;
  }, "persisting observation upload error" );
}

function clearObservationUploadError(
  realm: Realm,
  realmObservation: RealmObservation,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  if ( !realmObservation?.uploadErrorMessage ) {
    return;
  }
  safeRealmWrite( realm, ( ) => {
    realmObservation.uploadErrorMessage = null;
  }, "clearing observation upload error" );
}

export {
  clearObservationUploadError,
  persistObservationUploadError,
};

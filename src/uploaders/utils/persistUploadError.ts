import type Realm from "realm";
import type { RealmObservation } from "realmModels/types";
import { log } from "sharedHelpers/logger";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

const logger = log.extend( "persistUploadError" );

function persistObservationUploadError(
  realm: Realm,
  realmObservation: RealmObservation,
  uploadErrorMessage: string,
): void {
  if ( !realm || realm.isClosed ) {
    return;
  }
  try {
    safeRealmWrite( realm, ( ) => {
      realmObservation.uploadErrorMessage = uploadErrorMessage;
    }, "persisting observation upload error" );
  } catch ( error ) {
    logger.error( "Failed to persist observation upload error", error );
  }
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
  try {
    safeRealmWrite( realm, ( ) => {
      realmObservation.uploadErrorMessage = null;
    }, "clearing observation upload error" );
  } catch ( error ) {
    logger.error( "Failed to clear observation upload error", error );
  }
}

export {
  clearObservationUploadError,
  persistObservationUploadError,
};

import safeRealmWrite from "sharedHelpers/safeRealmWrite";

function findRecordInRealm(
  realm: object,
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  options?: {
    record: object;
  },
): object | null {
  if ( !realm || realm.isClosed ) return null;

  // Photos do not have UUIDs, so we pass the Photo itself as an option
  if ( type === "Photo" && options?.record ) {
    return options.record;
  }

  const observation = realm.objectForPrimaryKey( "Observation", observationUUID );
  if ( !observation ) return null;

  if ( type === "Observation" ) {
    return observation;
  } if ( type === "ObservationPhoto" ) {
    return observation.observationPhotos?.find( op => op.uuid === recordUUID ) || null;
  } if ( type === "ObservationSound" ) {
    return observation.observationSounds?.find( os => os.uuid === recordUUID ) || null;
  }

  return null;
}

function updateRecordWithServerId(
  realm: object,
  record: object,
  serverId: number,
  type: string,
): void {
  safeRealmWrite( realm, ( ) => {
    record.id = serverId;
    record._synced_at = new Date( );
    if ( type === "Observation" ) {
      record.needs_sync = false;
    }
  }, `marking record uploaded in realmSync.js, type: ${type}` );
}

function handleRecordUpdateError(
  error: Error,
  realm: object,
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  serverId: number,
  options?: {
    record: object;
  },
): void {
  // Try it one more time in case it was invalidated but it's still in the
  // database
  if ( error.message.match( /invalidated or deleted/ ) ) {
    const refreshedRecord
        = findRecordInRealm( realm, observationUUID, recordUUID, type, options );
    if ( !refreshedRecord ) {
      throw new Error(
        `Cannot find local Realm object on retry (${type}), recordUUID: ${recordUUID || ""}`,
      );
    }
    updateRecordWithServerId( realm, refreshedRecord, serverId, type );
  } else {
    // For other errors, just log and re-throw
    console.error( `Error updating record in Realm: ${error.message}` );
    throw error;
  }
}

// The reason this doesn't simply accept the record is because we're not being
// strict about using Realm.Objects, so sometimes the thing we just uploaded
// is a Realm.Object and sometimes it's a POJO, but in order to mark it as
// uploaded and add a server-assigned id attribute, we need to find the
// matching Realm.Object
const markRecordUploaded = (
  observationUUID: string,
  recordUUID: string | null,
  type: string,
  response: {
    results: Array<{id: number}>;
  },
  realm: object,
  options?: {
    record: object;
  },
) => {
  if ( !realm || realm.isClosed ) return;

  const { id } = response.results[0];

  const record = findRecordInRealm( realm, observationUUID, recordUUID, type, options );

  if ( !record ) {
    throw new Error(
      // eslint-disable-next-line max-len
      `Cannot find local Realm object to mark as updated (${type}), recordUUID: ${recordUUID || ""}`,
    );
  }

  try {
    updateRecordWithServerId( realm, record, id, type );
  } catch ( realmWriteError ) {
    handleRecordUpdateError(
      realmWriteError,
      realm,
      observationUUID,
      recordUUID,
      type,
      id,
      options,
    );
  }
};

export default markRecordUploaded;

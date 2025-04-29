import safeRealmWrite from "sharedHelpers/safeRealmWrite";

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
    results: Array<{id: number}>
  },
  realm: Object,
  options?: {
    record: Object
  }
) => {
  const { id } = response.results[0];
  if ( !realm || realm.isClosed ) return;
  function extractRecord( obsUUID, recUUID, recordType, opts ) {
    const observation = realm?.objectForPrimaryKey( "Observation", obsUUID );
    let record;
    if ( recordType === "Observation" ) {
      record = observation;
    } else if ( recordType === "ObservationPhoto" ) {
      const existingObsPhoto = observation?.observationPhotos?.find( op => op.uuid === recUUID );
      record = existingObsPhoto;
    } else if ( recordType === "ObservationSound" ) {
      const existingObsSound = observation?.observationSounds?.find( os => os.uuid === recUUID );
      record = existingObsSound;
    } else if ( recordType === "Photo" ) {
      // Photos do not have UUIDs, so we pass the Photo itself as an option
      record = opts?.record;
    }
    return record;
  }
  let record = extractRecord( observationUUID, recordUUID, type, options );

  if ( !record ) {
    throw new Error(
      `Cannot find local Realm object to mark as updated (${type}), recordUUID: ${recordUUID || ""}`
    );
  }

  try {
    safeRealmWrite( realm, ( ) => {
      // These flow errors don't make any sense b/c if record is undefined, we
      // will throw an error above
      // $FlowIgnore
      record.id = id;
      // $FlowIgnore
      record._synced_at = new Date( );
      if ( type === "Observation" ) {
        // $FlowIgnore
        record.needs_sync = false;
      }
    }, `marking record uploaded in uploadObservation.js, type: ${type}` );
  } catch ( realmWriteError ) {
    // Try it one more time in case it was invalidated but it's still in the
    // database
    if ( realmWriteError.message.match( /invalidated or deleted/ ) ) {
      record = extractRecord( observationUUID, recordUUID, type, options );
      safeRealmWrite( realm, ( ) => {
        // These flow errors don't make any sense b/c if record is undefined, we
        // will throw an error above
        // $FlowIgnore
        record.id = id;
        // $FlowIgnore
        record._synced_at = new Date( );
        if ( type === "Observation" ) {
          // $FlowIgnore
          record.needs_sync = false;
        }
      }, `marking record uploaded in uploadObservation.js, type: ${type}` );
    }
  }
};

export default markRecordUploaded;

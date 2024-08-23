// @flow

// this is based on safeWrite from this github issue, but customized for
// realmjs: https://stackoverflow.com/questions/39366182/the-realm-is-already-in-a-write-transaction

const safeRealmWrite = (
  realm: Object,
  action: Function,
  description: string
): Object => {
  if ( realm.isInTransaction ) {
    realm.cancelTransaction( );
  }
  // https://www.mongodb.com/docs/realm-sdks/react/latest/classes/Realm-1.html#beginTransaction.beginTransaction-1
  realm.beginTransaction( );
  try {
    const response = action( );
    realm.commitTransaction( );
    return response;
  } catch ( e ) {
    e.message = `${description}: ${e.message}`;
    throw e;
  }
};

export default safeRealmWrite;

// this is based on safeWrite from this github issue, but customized for
// realmjs: https://stackoverflow.com/questions/39366182/the-realm-is-already-in-a-write-transaction
import type Realm from "realm";

const safeRealmWrite = (
  realm: Realm,
  action: () => void,
  description: string
) => {
  if ( realm.isInTransaction ) {
    return action( );
  }
  // https://www.mongodb.com/docs/realm-sdks/react/latest/classes/Realm-1.html#beginTransaction.beginTransaction-1
  realm.beginTransaction( );
  try {
    const response = action( );
    realm.commitTransaction( );
    return response;
  } catch ( e ) {
    realm.cancelTransaction( );
    e.message = `${description}: ${e.message}`;
    throw e;
  }
};

export default safeRealmWrite;

// @flow

import { log } from "../../react-native-logs.config";

const logger = log.extend( "safeRealmWrite" );

// this is based on safeWrite from this github issue, but customized for
// realmjs: https://stackoverflow.com/questions/39366182/the-realm-is-already-in-a-write-transaction

const safeRealmWrite = (
  realm: Object,
  action: Function,
  description: string
): Object => {
  if ( realm.isInTransaction ) {
    logger.info( "realm is in transaction:", realm.isInTransaction );
    realm.cancelTransaction( );
  }
  // https://www.mongodb.com/docs/realm-sdks/react/latest/classes/Realm-1.html#beginTransaction.beginTransaction-1
  realm.beginTransaction( );
  try {
    logger.info( "writing to realm:", description );
    const response = action( );
    realm.commitTransaction( );
    return response;
  } catch ( e ) {
    logger.info( "couldn't write to realm: ", e );
    throw new Error( `${description}: ${e.message}` );
  }
};

export default safeRealmWrite;

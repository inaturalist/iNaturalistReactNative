// @flow
import Realm from "realm";

import realmConfig from "../../models/index";

const markRecordUploaded = async ( uuid: string, type: string, response: Object ) => {
  const { id } = response.results[0];

  try {
    const realm = await Realm.open( realmConfig );
    const record = realm.objectForPrimaryKey( type, uuid );
    realm?.write( ( ) => {
      record.id = id;
      record._synced_at = new Date( );
    } );
  } catch ( e ) {
    console.log( e, `couldn't mark ${type} uploaded in realm` );
  }
};

export {
  markRecordUploaded
};

// @flow
import Realm from "realm";

import realmConfig from "../../models/index";
import { getUTCDate } from "../../sharedHelpers/dateAndTime";

const markUploaded = async ( uuid: string, id: number ) => {
  try {
    const realm = await Realm.open( realmConfig );
    const obs = realm.objectForPrimaryKey( "Observation", uuid );
    realm?.write( ( ) => {
      obs.id = id;
      obs.timeSynced = getUTCDate( new Date( ) );
    } );
  } catch ( e ) {
    console.log( e, "couldn't save observation to realm" );
  }
};

export default markUploaded;

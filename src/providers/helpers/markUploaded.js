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
    console.log( e, "couldn't mark obs uploaded in realm" );
  }
};

const markPhotoUploaded = async ( uuid: string, id: number ) => {
  try {
    const realm = await Realm.open( realmConfig );
    const obsPhoto = realm.objectForPrimaryKey( "ObservationPhoto", uuid );
    realm?.write( ( ) => {
      obsPhoto.photo.id = id;
      obsPhoto.photo.timeSynced = getUTCDate( new Date( ) );
    } );
  } catch ( e ) {
    console.log( e, "couldn't mark photo uploaded in realm" );
  }
};

export {
  markUploaded,
  markPhotoUploaded
};

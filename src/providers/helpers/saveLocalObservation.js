// @flow

import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";

const saveLocalObservation = async ( currentObs: Object ): Promise<any> => {
  try {
    const realm = await Realm.open( realmConfig );
    const obsToSave = Observation.saveLocalObservationForUpload( currentObs, realm );
    realm?.write( ( ) => {
      realm?.create( "Observation", obsToSave );
    } );
    return realm.objectForPrimaryKey( "Observation", currentObs.uuid );
  } catch ( e ) {
    console.log( e, "couldn't save observation locally" );
    return null;
  }
};

export default saveLocalObservation;

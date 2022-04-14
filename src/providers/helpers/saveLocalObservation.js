// @flow

import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";

const saveLocalObservation = async ( currentObs: Object ): Promise<string> => {
  try {
    const realm = await Realm.open( realmConfig );
    const obsToSave = Observation.saveLocalObservationForUpload( currentObs, realm );
    realm?.write( ( ) => {
      realm?.create( "Observation", obsToSave );
    } );
    return "saved";
  } catch ( e ) {
    console.log( e, "couldn't save observation locally" );
    return "not-saved";
  }
};

export default saveLocalObservation;

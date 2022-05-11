// @flow

import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";

const saveLocalObservation = async ( currentObs: Object ): Promise<any> => {
  try {
    const realm = await Realm.open( realmConfig );

    return await Observation.saveLocalObservationForUpload( currentObs, realm );
  } catch ( e ) {
    console.log( e, "couldn't save observation locally" );
    return null;
  }
};

export default saveLocalObservation;

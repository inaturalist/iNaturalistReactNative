// @flow

import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";

const saveLocalObservation = async ( currentObs: Object ): Promise<any> => {
  const realm = await Realm.open( realmConfig );
  return Observation.saveLocalObservationForUpload( currentObs, realm );
};

export default saveLocalObservation;

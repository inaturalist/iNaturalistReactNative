// @flow

import Realm from "realm";

import realmConfig from "../../models/index";
import Observation from "../../models/Observation";
import { getUserId } from "../../components/LoginSignUp/AuthenticationService";

const saveLocalObservation = async ( currentObs: Object ): Promise<any> => {
  try {
    const realm = await Realm.open( realmConfig );

    // make sure local observations have user details for ObsDetail
    const id = await getUserId( );
    const user = realm.objectForPrimaryKey( "User", Number( id ) );
    currentObs.user = user;

    const obsToSave = Observation.saveLocalObservationForUpload( currentObs, realm );
    realm?.write( ( ) => {
      // using 'modified' here for the case where a new observation has the same Taxon
      // as a previous observation; otherwise, realm will error out
      realm?.create( "Observation", obsToSave, "modified" );
    } );
    const newLocalObs = realm.objectForPrimaryKey( "Observation", currentObs.uuid );
    return newLocalObs;
  } catch ( e ) {
    console.log( e, "couldn't save observation locally" );
    return null;
  }
};

export default saveLocalObservation;

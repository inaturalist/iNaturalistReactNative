import { fetchTaxon } from "api/taxa";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

async function fetchTaxonAndSave( id, realm, params = {}, opts = {} ) {
  const options = { ...opts };
  if ( !options.api_token ) {
    options.api_token = await getJWT( );
  }
  const remoteTaxon = await fetchTaxon( id, params, options );
  const mappedRemoteTaxon = Taxon.mapApiToRealm( remoteTaxon, realm );
  safeRealmWrite( realm, ( ) => {
    realm.create(
      "Taxon",
      Taxon.forUpdate( mappedRemoteTaxon ),
      "modified"
    );
  }, "saving remote taxon in ObsDetails" );
  return mappedRemoteTaxon;
}

export default fetchTaxonAndSave;

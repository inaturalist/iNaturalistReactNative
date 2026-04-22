import { fetchTaxon } from "api/taxa";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import type Realm from "realm";
import { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";

interface Options {
  api_token?: string | null;
}

async function fetchTaxonAndSave(
  id: number,
  realm: Realm,
  params: Record<string, unknown> = {},
  opts: Options = {},
) {
  const options = { ...opts };
  if ( !options.api_token ) {
    options.api_token = await getJWT( );
  }
  // Casting is necessary until fetchTaxon is typed to return Taxon.
  const remoteTaxon = await fetchTaxon( id, params, options ) as Taxon;
  const mappedRemoteTaxon = Taxon.mapApiToRealm( remoteTaxon, realm );
  safeRealmWrite( realm, ( ) => {
    realm.create(
      Taxon,
      Taxon.forUpdate( mappedRemoteTaxon ),
      UpdateMode.Modified,
    );
  }, "saving remote taxon in ObsDetails" );
  return mappedRemoteTaxon;
}

export default fetchTaxonAndSave;

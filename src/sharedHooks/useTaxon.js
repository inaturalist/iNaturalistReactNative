// @flow

import { fetchTaxon } from "api/taxa";
import { RealmContext } from "providers/contexts";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useTaxon = ( taxon: Object, fetchRemote: boolean = true ): Object => {
  const realm = useRealm( );

  const existingTaxon = taxon?.id && realm.objectForPrimaryKey( "Taxon", taxon?.id );

  const {
    data: remoteTaxon
  } = useAuthenticatedQuery(
    [fetchTaxon],
    optsWithAuth => fetchTaxon( taxon?.id, { fields: Taxon.TAXON_FIELDS }, optsWithAuth ),
    { enabled: !!( taxon?.id && fetchRemote ) }
  );

  if ( remoteTaxon ) {
    Taxon.saveRemoteTaxon( remoteTaxon, realm );
  }

  if ( existingTaxon?.default_photo?.url ) {
    return existingTaxon;
  }
  if ( remoteTaxon?.default_photo?.url ) {
    return remoteTaxon;
  }
  return taxon;
};

export default useTaxon;

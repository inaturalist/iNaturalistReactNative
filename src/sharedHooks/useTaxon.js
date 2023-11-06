// @flow

import { fetchTaxon } from "api/taxa";
import { RealmContext } from "providers/contexts";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useTaxon = ( taxon: Object ): Object => {
  const realm = useRealm( );

  const existingTaxon = taxon?.id && realm.objectForPrimaryKey( "Taxon", taxon?.id );

  const {
    data: remoteTaxon
  } = useAuthenticatedQuery(
    [fetchTaxon],
    optsWithAuth => fetchTaxon( taxon?.id, { fields: Taxon.TAXON_FIELDS }, optsWithAuth ),
    { enabled: !!taxon?.id }
  );

  if ( !existingTaxon && remoteTaxon ) {
    Taxon.saveRemoteTaxon( remoteTaxon, realm );
  }

  return existingTaxon || taxon;
};

export default useTaxon;

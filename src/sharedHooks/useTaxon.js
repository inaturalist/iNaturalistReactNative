// @flow

import { RealmContext } from "providers/contexts";
import Taxon from "realmModels/Taxon";

const { useRealm } = RealmContext;

const useTaxon = ( taxon: Object ): Object => {
  const realm = useRealm( );

  const existingTaxon = taxon?.id && realm.objectForPrimaryKey( "Taxon", taxon?.id );

  if ( !existingTaxon && taxon?.id ) {
    Taxon.downloadRemoteTaxon( taxon?.id, realm );
  }

  return existingTaxon || taxon;
};

export default useTaxon;

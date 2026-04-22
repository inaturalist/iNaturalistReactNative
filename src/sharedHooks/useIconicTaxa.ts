import { searchTaxa } from "api/taxa";
import type { ApiOpts, ApiTaxon } from "api/types";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import { UpdateMode } from "realm";
import Taxon from "realmModels/Taxon";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useIconicTaxa = ( options: { reload: boolean } = { reload: false } ) => {
  const { reload } = options;
  const realm = useRealm( );
  const [isUpdatingRealm, setIsUpdatingRealm] = useState<boolean>( );
  const enabled = !!( reload );

  const queryKey = ["useIconicTaxa", reload];
  const { data: iconicTaxa } = useAuthenticatedQuery(
    queryKey,
    ( optsWithAuth: ApiOpts ) => searchTaxa( { iconic: true }, optsWithAuth ),
    { enabled },
  );

  useEffect( ( ) => {
    if ( iconicTaxa?.length > 0 && !isUpdatingRealm ) {
      setIsUpdatingRealm( true );
      safeRealmWrite( realm, ( ) => {
        iconicTaxa.forEach( ( taxon: ApiTaxon ) => {
          realm.create(
            "Taxon",
            Taxon.forUpdate( taxon, { isIconic: true } ),
            UpdateMode.Modified,
          );
        } );
      }, "modifying iconic taxa in useIconicTaxa" );
    }
  }, [iconicTaxa, realm, isUpdatingRealm] );

  return realm?.objects( "Taxon" ).filtered( "isIconic = true" );
};

export default useIconicTaxa;

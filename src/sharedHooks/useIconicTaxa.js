// @flow
import { searchTaxa } from "api/taxa";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useIconicTaxa = ( { reload }: Object ): Object => {
  const realm = useRealm( );

  const queryKey = ["searchTaxa", reload];
  const { data: iconicTaxa } = useAuthenticatedQuery(
    queryKey,
    ( ) => searchTaxa( { iconic: true } ),
    { enabled: !!reload }
  );

  useEffect( ( ) => {
    if ( iconicTaxa?.length > 0 ) {
      iconicTaxa.forEach( taxa => {
        taxa.isIconic = true;
        realm?.write( ( ) => {
          realm?.create( "Taxon", taxa, "modified" );
        } );
      } );
    }
  }, [iconicTaxa, realm] );

  return realm?.objects( "Taxon" ).filtered( "isIconic = true" );
};

export default useIconicTaxa;

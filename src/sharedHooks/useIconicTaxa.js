// @flow
import { searchTaxa } from "api/taxa";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery, useIsConnected } from "sharedHooks";

const { useRealm } = RealmContext;

const useIconicTaxa = ( { reload }: Object ): Object => {
  const realm = useRealm( );
  const isConnected = useIsConnected( );
  const [isUpdatingRealm, setIsUpdatingRealm] = useState( );

  const queryKey = ["searchTaxa", reload];
  const { data: iconicTaxa } = useAuthenticatedQuery(
    queryKey,
    ( ) => searchTaxa( { iconic: true } ),
    { enabled: !!isConnected && !!reload }
  );

  useEffect( ( ) => {
    if ( iconicTaxa?.length > 0 && !isUpdatingRealm ) {
      setIsUpdatingRealm( true );
      safeRealmWrite( realm, ( ) => {
        iconicTaxa.forEach( taxa => {
          realm.create( "Taxon", {
            ...taxa,
            isIconic: true
          }, "modified" );
        } );
      }, "modifying iconic taxa in useIconicTaxa" );
    }
  }, [iconicTaxa, realm, isUpdatingRealm] );

  return realm?.objects( "Taxon" ).filtered( "isIconic = true" );
};

export default useIconicTaxa;

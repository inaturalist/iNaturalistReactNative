import {
  useNetInfo
} from "@react-native-community/netinfo";
import { searchTaxa } from "api/taxa";
import { RealmContext } from "providers/contexts.ts";
import { useEffect, useState } from "react";
import { UpdateMode } from "realm";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useIconicTaxa = ( options: { reload: boolean } = { reload: false } ) => {
  const { reload } = options;
  const realm = useRealm( );
  const { isConnected } = useNetInfo( );
  const [isUpdatingRealm, setIsUpdatingRealm] = useState<boolean>( );
  const enabled = !!isConnected && !!reload;

  const queryKey = ["searchTaxa", reload];
  const { data: iconicTaxa } = useAuthenticatedQuery(
    queryKey,
    ( ) => searchTaxa( { iconic: true } ),
    { enabled }
  );

  useEffect( ( ) => {
    if ( iconicTaxa?.length > 0 && !isUpdatingRealm ) {
      setIsUpdatingRealm( true );
      safeRealmWrite( realm, ( ) => {
        iconicTaxa.forEach( taxon => {
          realm.create( "Taxon", {
            ...taxon,
            isIconic: true,
            _synced_at: new Date( )
          }, UpdateMode.Modified );
        } );
      }, "modifying iconic taxa in useIconicTaxa" );
    }
  }, [iconicTaxa, realm, isUpdatingRealm] );

  return realm?.objects( "Taxon" ).filtered( "isIconic = true" );
};

export default useIconicTaxa;

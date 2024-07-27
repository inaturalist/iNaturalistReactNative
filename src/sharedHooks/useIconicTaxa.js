// @flow
import {
  useNetInfo
} from "@react-native-community/netinfo";
import { searchTaxa } from "api/taxa";
import { RealmContext } from "providers/contexts";
import { useEffect, useState } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery } from "sharedHooks";

const { useRealm } = RealmContext;

const useIconicTaxa = ( options: { reload: boolean } = { reload: false } ): Object => {
  const { reload } = options;
  const realm = useRealm( );
  const { isInternetReachable: isOnline } = useNetInfo( );
  const [isUpdatingRealm, setIsUpdatingRealm] = useState( );
  const enabled = !!isOnline && !!reload;

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
          }, "modified" );
        } );
      }, "modifying iconic taxa in useIconicTaxa" );
    }
  }, [iconicTaxa, realm, isUpdatingRealm] );

  return realm?.objects( "Taxon" ).filtered( "isIconic = true" );
};

export default useIconicTaxa;

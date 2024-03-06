// @flow
import { fetchUserMe } from "api/users";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect, useState } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery,
  useBustUserIconCache,
  useCurrentUser,
  useIsConnected
} from "sharedHooks";

const { useRealm } = RealmContext;

const useUserMe = ( options: ?Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const updateRealm = options?.updateRealm;
  const isConnected = useIsConnected( );
  const enabled = !!isConnected && !!currentUser;
  const [remoteUserUpdated, setRemoteUserUpdated] = useState( false );

  const {
    data: remoteUser,
    isLoading,
    refetch: refetchUserMe,
    dataUpdatedAt
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth ),
    {
      enabled
    }
  );

  const updateUser = useCallback( ( ) => {
    if ( remoteUser && updateRealm ) {
      safeRealmWrite( realm, ( ) => {
        realm.create( "User", remoteUser, "modified" );
      }, "modifying current user via remote fetch in useUserMe" );
      setRemoteUserUpdated( true );
    }
  }, [
    realm,
    remoteUser,
    updateRealm
  ] );

  useBustUserIconCache( remoteUserUpdated );

  useEffect( ( ) => {
    if ( dataUpdatedAt && updateUser ) {
      updateUser( );
    }
  }, [dataUpdatedAt, updateUser] );

  return {
    remoteUser,
    isLoading,
    refetchUserMe
  };
};

export default useUserMe;

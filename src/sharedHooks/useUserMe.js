// @flow
import { fetchUserMe } from "api/users";
import { RealmContext } from "providers/contexts.ts";
import { useCallback, useEffect } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite.ts";
import {
  useAuthenticatedQuery,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

const useUserMe = ( options: ?Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const updateRealm = options?.updateRealm;
  const enabled = !!( currentUser );

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
    }
  }, [
    realm,
    remoteUser,
    updateRealm
  ] );

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

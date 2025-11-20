import { fetchUserMe } from "api/users";
import { RealmContext } from "providers/contexts";
import { useCallback, useEffect } from "react";
import { UpdateMode } from "realm";
import User from "realmModels/User";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import {
  useAuthenticatedQuery,
  useCurrentUser
} from "sharedHooks";

const { useRealm } = RealmContext;

interface UseUserMeOptions {
  updateRealm?: boolean;
}

const useUserMe = ( options: UseUserMeOptions ) => {
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
        realm.create( User, remoteUser, UpdateMode.Modified );
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

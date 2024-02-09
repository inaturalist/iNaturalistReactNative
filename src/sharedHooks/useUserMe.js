// @flow
import { fetchUserMe } from "api/users";
import { RealmContext } from "providers/contexts";
import { useEffect } from "react";
import safeRealmWrite from "sharedHelpers/safeRealmWrite";
import { useAuthenticatedQuery, useCurrentUser, useIsConnected } from "sharedHooks";

const { useRealm } = RealmContext;

const useUserMe = ( options: ?Object ): Object => {
  const realm = useRealm( );
  const currentUser = useCurrentUser( );
  const updateRealm = options?.updateRealm;
  const isConnected = useIsConnected( );
  const enabled = !!isConnected && !!currentUser;

  const {
    data: remoteUser,
    isLoading,
    refetch: refetchUserMe
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth ),
    {
      enabled
    }
  );

  const userLocaleChanged = (
    !currentUser?.locale || ( remoteUser?.locale !== currentUser?.locale )
  )
    && updateRealm;

  console.log( userLocaleChanged, updateRealm, remoteUser, "useUserME" );

  useEffect( ( ) => {
    if ( userLocaleChanged && remoteUser ) {
      safeRealmWrite( realm, ( ) => {
        realm.create( "User", remoteUser, "modified" );
      }, "modifying current user via remote fetch in useUserMe" );
    }
  }, [realm, userLocaleChanged, remoteUser] );

  return {
    remoteUser,
    isLoading,
    refetchUserMe
  };
};

export default useUserMe;

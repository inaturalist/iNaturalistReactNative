// @flow
import { fetchUserMe } from "api/users";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";
import useIsConnected from "sharedHooks/useIsConnected";

const useUserMe = ( ): Object => {
  const currentUser = useCurrentUser( );
  const isConnected = useIsConnected( );

  const {
    data: remoteUser,
    isLoading,
    refetch: refetchUserMe
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth ),
    {
      enabled: !!isConnected && !!currentUser
    }
  );

  return {
    remoteUser,
    isLoading,
    refetchUserMe
  };
};

export default useUserMe;

// @flow
import { fetchUserMe } from "api/users";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";
import useCurrentUser from "sharedHooks/useCurrentUser";

const useUserMe = ( ): Object => {
  const currentUser = useCurrentUser( );

  const {
    data: remoteUser,
    isLoading,
    refetch: refetchUserMe
  } = useAuthenticatedQuery(
    ["fetchUserMe"],
    optsWithAuth => fetchUserMe( { }, optsWithAuth ),
    {
      enabled: !!currentUser
    }
  );

  return {
    remoteUser,
    isLoading,
    refetchUserMe
  };
};

export default useUserMe;

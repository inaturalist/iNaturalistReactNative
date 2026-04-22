import { fetchSearchResults } from "api/search";
import type { ApiOpts, ApiUser } from "api/types";
import { useAuthenticatedQuery } from "sharedHooks";

const USER_SEARCH_FIELDS = "user.id,user.login,user.icon_url,user.observations_count";

const useUserSearch = ( query: string ) => {
  const trimmedQuery = query.trim( );
  const shouldFetch = trimmedQuery.length > 0;

  const {
    data: users = [],
    isLoading,
    refetch,
  } = useAuthenticatedQuery<ApiUser[] | null>(
    ["fetchSearchResults", "users", trimmedQuery],
    ( optsWithAuth: ApiOpts ) => fetchSearchResults(
      {
        q: trimmedQuery,
        sources: "users",
        fields: USER_SEARCH_FIELDS,
      },
      optsWithAuth,
    ),
    { enabled: shouldFetch },
  );

  return {
    users: users ?? [],
    isLoading,
    refetch,
  };
};

export default useUserSearch;

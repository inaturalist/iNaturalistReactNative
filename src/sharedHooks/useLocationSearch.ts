import { fetchSearchResults } from "api/search";
import type { ApiOpts, ApiPlace } from "api/types";
import useAuthenticatedQuery from "sharedHooks/useAuthenticatedQuery";

// Autocomplete suggestions for the Universal Search location field. Mirrors
// useUniversalSearch, but fetches only places. We use fetchSearchResults (rather
// than the raw search wrapper) because it already flattens the response down to
// the place records we render.
const useLocationSearch = ( query: string ) => {
  const trimmedQuery = query.trim( );
  const shouldFetch = trimmedQuery.length > 0;

  const {
    data: results = [],
    isLoading,
    refetch,
  } = useAuthenticatedQuery<ApiPlace[]>(
    ["useLocationSearch", trimmedQuery],
    async ( optsWithAuth: ApiOpts ) => {
      const places = await fetchSearchResults(
        {
          q: trimmedQuery,
          sources: "places",
          // place.id + display_name feed the context; display_name + place_type
          // feed the result row. No geojson needed: buildQueryParams only reads
          // location.place.id.
          fields: "place,place.display_name,place.place_type",
          per_page: 20,
        },
        optsWithAuth,
      );
      return ( places ?? [] ) as ApiPlace[];
    },
    { enabled: shouldFetch },
  );

  return {
    results,
    isLoading,
    refetch,
  };
};

export default useLocationSearch;

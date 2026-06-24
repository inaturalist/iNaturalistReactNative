import { search } from "api/search";
import type {
  ApiOpts,
  ApiProject,
  ApiTaxon,
  ApiUser,
} from "api/types";
import { useAuthenticatedQuery } from "sharedHooks";

// A single autocomplete suggestion, tagged by source so the consumer can pick
// the right row renderer. We use the raw `search` wrapper rather than
// `fetchSearchResults` because the latter flattens results and discards the type.
export type UniversalSearchResultItem =
  | { type: "taxon"; taxon: ApiTaxon }
  | { type: "user"; user: ApiUser }
  | { type: "project"; project: ApiProject };

const useUniversalSearch = ( query: string ) => {
  const trimmedQuery = query.trim( );
  // TODO look into some sort of throttle here
  const shouldFetch = trimmedQuery.length > 0;

  const {
    data: results = [],
    isLoading,
    refetch,
  } = useAuthenticatedQuery<UniversalSearchResultItem[] | null>(
    ["useUniversalSearch", trimmedQuery],
    async ( optsWithAuth: ApiOpts ) => {
      const response = await search(
        { q: trimmedQuery, sources: ["taxa", "users", "projects"] },
        optsWithAuth,
      );
      if ( !response ) { return []; }
      // Preserve the API's score-sorted order, mapping each result to a tagged union
      return response.results.reduce<UniversalSearchResultItem[]>( ( acc, result ) => {
        if ( result.taxon ) {
          acc.push( { type: "taxon", taxon: result.taxon } );
        } else if ( result.user ) {
          acc.push( { type: "user", user: result.user } );
        } else if ( result.project ) {
          acc.push( { type: "project", project: result.project } );
        }
        return acc;
      }, [] );
    },
    { enabled: shouldFetch },
  );

  return {
    results: results ?? [],
    isLoading,
    refetch,
  };
};

export default useUniversalSearch;

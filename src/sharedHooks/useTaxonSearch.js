// @flow

import fetchSearchResults from "api/search";
import { useAuthenticatedQuery } from "sharedHooks";

const useTaxonSearch = ( taxonQuery: string ): Object => {
  const { data: taxonList, isLoading } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa"
      },
      optsWithAuth
    ),
    {
      enabled: !!( taxonQuery.length > 0 )
    }
  );

  return { taxonList, isLoading };
};

export default useTaxonSearch;

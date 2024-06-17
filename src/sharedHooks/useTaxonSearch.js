// @flow

import { useAuthenticatedQuery } from "sharedHooks";
import fetchSearchResults from "api/search";

const useTaxonSearch = ( taxonQuery: string ): Array<Object> => {
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa",
      },
      optsWithAuth
    )
  );

  return taxonList;
};

export default useTaxonSearch;

// @flow

import fetchSearchResults from "api/search";
import { useAuthenticatedQuery } from "sharedHooks";

const useTaxonSearch = ( taxonQuery: string ): Array<Object> => {
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchTaxonSuggestions", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa"
      },
      optsWithAuth
    )
  );

  return taxonList;
};

export default useTaxonSearch;

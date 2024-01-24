// @flow

import fetchSearchResults from "api/search";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

const useTaxonSearch = ( taxonQuery: string ): Array<Object> => {
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchSearchResults", taxonQuery],
    optsWithAuth => fetchSearchResults(
      {
        q: taxonQuery,
        sources: "taxa",
        fields: {
          taxon: Taxon.TAXON_FIELDS
        }
      },
      optsWithAuth
    )
  );
  return taxonList;
};

export default useTaxonSearch;

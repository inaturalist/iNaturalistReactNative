// @flow

import { useQueryClient } from "@tanstack/react-query";
import fetchSearchResults from "api/search";
import Taxon from "realmModels/Taxon";
import { useAuthenticatedQuery } from "sharedHooks";

const useTaxonSearch = ( taxonQuery: string ): Array<Object> => {
  const queryClient = useQueryClient( );
  queryClient.invalidateQueries();
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

// @flow

import { searchTaxa } from "api/taxa";
import { useAuthenticatedQuery } from "sharedHooks";

const useTaxonSearch = ( taxonQuery: string ): Array<Object> => {
  const { data: taxonList } = useAuthenticatedQuery(
    ["fetchTaxa", taxonQuery],
    optsWithAuth => searchTaxa(
      {
        q: taxonQuery
      },
      optsWithAuth
    ),
    {
      enabled: !!( taxonQuery.length > 0 )
    }
  );
  return taxonList;
};

export default useTaxonSearch;

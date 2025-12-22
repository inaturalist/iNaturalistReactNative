// @flow

import { fetchObservers } from "api/observations";
import { useAuthenticatedQuery } from "sharedHooks";

const params = {
  per_page: 3,
  fields: {
    user: {
      login: true,
      name: true,
    },
  },
};

const useObservers = ( taxonIds: Array<number> ): Array<string> => {
  const { data } = useAuthenticatedQuery(
    ["fetchObservers", taxonIds],
    ( ) => fetchObservers( {
      ...params,
      taxon_ids: taxonIds,
    } ),
    {
      enabled: !!( taxonIds?.length > 0 ),
    },
  );

  return data?.results?.map( result => result.user.login );
};

export default useObservers;

// @flow

import { useInfiniteQuery } from "@tanstack/react-query";
import { searchObservations } from "api/observations";
import { getJWT } from "components/LoginSignUp/AuthenticationService";
import { flatten, last } from "lodash";
import Observation from "realmModels/Observation";

const useInfiniteExploreScroll = ( { params: newInputParams }: object ): object => {
  const baseParams = {
    ...newInputParams,
    fields: Observation.EXPLORE_LIST_FIELDS,
    ttl: -1
  };

  const { fields, ...queryKeyParams } = baseParams;

  const queryKey = ["useInfiniteExploreScroll", "searchObservations", queryKeyParams];

  const {
    data,
    isFetchingNextPage,
    fetchNextPage,
    status
  } = useInfiniteQuery( {
    // eslint-disable-next-line
    queryKey,
    queryFn: async ( { pageParam } ) => {
      const apiToken = await getJWT( );
      const options = {
        api_token: apiToken
      };

      const params = {
        ...baseParams
      };

      if ( pageParam ) {
        // $FlowIgnore
        params.id_below = pageParam;
      } else {
        // $FlowIgnore
        params.page = 1;
      }
      const response = await searchObservations( params, options );
      return response;
    },
    initialPageParam: 0,
    getNextPageParam: lastPage => last( lastPage.results )?.id
  } );

  const observations = flatten( data?.pages?.map( r => r.results ) ) || [];
  let totalResults = data?.pages?.[0].total_results;
  if ( totalResults !== 0 && !totalResults ) {
    totalResults = null;
  }

  return {
    isFetchingNextPage,
    fetchNextPage,
    observations: flatten( observations ),
    status,
    totalResults
  };
};

export default useInfiniteExploreScroll;
